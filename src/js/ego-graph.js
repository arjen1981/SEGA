/**
 * Ego-graph module — spotlight state management and neighborhood filtering.
 *
 * Manages the dual view modes (ego / full) and controls which nodes and edges
 * are visible based on the current spotlight node's direct neighborhood.
 *
 * Exports:
 *   initEgoGraph(network)          — store network reference
 *   applyEgoGraph(nodeId)          — set spotlight, hide non-neighbors, focus camera
 *   expandAll()                    — unhide all, restore physics, fit viewport
 *   getViewMode()                  — return current mode ("ego" | "full")
 *   getSpotlightId()               — return current spotlight node ID or null
 *   pickRandomSpotlight(nodesArray) — select a random non-company node ID
 *   prefersReducedMotion()         — check reduced-motion media query
 *   easeInOutQuad(t)               — quadratic ease-in-out
 *   computeZoomDip(t)              — parabolic zoom dip multiplier
 *   computeNeighborhoodDiff(old,new) — set diff between ego neighborhoods
 *   cancelTransition()             — cancel in-progress transition animation
 *   finalizeTransition(id, set)    — apply canonical end state after transition
 *
 * @module ego-graph
 */

/** @type {vis.Network | null} */
let network = null;

/** @type {"ego" | "full"} */
let viewMode = "ego";

/** @type {string | null} */
let spotlightId = null;

/** @type {boolean} Tracks whether physics is currently active (R1, R3) */
let physicsEnabled = false;

/** @type {boolean} Tracks last viewport type for physics config (R3) */
let lastPhysicsIsMobile = false;

/** @type {Function | null} Pending stabilized handler for cancel-and-replace (R2) */
let pendingStabilizationHandler = null;

/** @type {number | null} Active rAF ID for transition animation (012) */
let animFrameId = null;

/** @type {object | null} In-progress transition state (012) */
let transitionState = null;

/** @type {number | null} Fallback timer that completes animation if rAF stalls (e.g. background tab) */
let transitionFallbackTimer = null;

/**
 * 005: Media query for mobile detection — mirrors CSS breakpoint.
 * @type {MediaQueryList}
 */
const mobileQuery = window.matchMedia("(max-width: 767px)");

/**
 * 005: Check whether the current viewport is mobile (≤767px).
 * @returns {boolean}
 */
function isMobile() {
	return mobileQuery.matches;
}

/**
 * 012: Media query for reduced motion preference.
 * @type {MediaQueryList}
 */
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * 012: Check whether the user prefers reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
	return reducedMotionQuery.matches;
}

/**
 * Get the offset for graph centering so that the spotlight node
 * appears in the visible area (left of desktop panel, above mobile sheet).
 *
 * 005: Returns { x, y } object instead of a single width number.
 * - Desktop: horizontal offset to center left of side panel
 * - Mobile + sheet open: vertical offset to center above bottom sheet
 * - Mobile + sheet closed: no offset (full viewport)
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.anticipateOpen=false] — when true, assume the panel
 *   is about to open even if it isn't yet (mirrors the desktop fallback).
 *   Pass true from applyEgoGraph where openDetailPanel always follows.
 * @returns {{ x: number, y: number }} pixel offset for network.focus()
 */
function getPanelOffset({ anticipateOpen = false } = {}) {
	const panel = document.querySelector(".detail-panel");
	const isOpen = panel?.classList.contains("open");

	if (isMobile()) {
		if (isOpen && panel) {
			// Sheet is open — use actual rendered height
			const sheetHeight = panel.offsetHeight;
			return { x: 0, y: -sheetHeight / 2 };
		}
		if (anticipateOpen) {
			// Sheet about to open — anticipate 60vh height (matches CSS rule)
			const sheetHeight = Math.round(window.innerHeight * 0.6);
			return { x: 0, y: -sheetHeight / 2 };
		}
		// Sheet truly closed — center in full viewport
		return { x: 0, y: 0 };
	}

	// Desktop: offset left to center in area beside the panel
	if (isOpen && panel) {
		return { x: -panel.offsetWidth / 2, y: 0 };
	}
	// Panel not open yet — anticipate default panel width from CSS custom property
	const raw = getComputedStyle(document.documentElement).getPropertyValue("--detail-panel-width");
	const panelWidth = Number.parseInt(raw, 10) || 400;
	return { x: -panelWidth / 2, y: 0 };
}

/* ============================================================
   012: Transition animation helpers and infrastructure
   ============================================================ */

/**
 * 012: Quadratic ease-in-out.
 * @param {number} t — normalized progress 0–1
 * @returns {number} eased value 0–1
 */
export function easeInOutQuad(t) {
	return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * 012: Compute zoom dip multiplier — parabolic curve that dips to ~0.7 at midpoint.
 * @param {number} t — eased progress 0–1
 * @returns {number} scale multiplier (1.0 at ends, ~0.7 at midpoint)
 */
export function computeZoomDip(t) {
	const dipFactor = 0.3;
	return 1 - dipFactor * 4 * t * (1 - t);
}

/**
 * 012: Compute the set difference between old and new ego-graph neighborhoods.
 * Returns departing, arriving, and shared node/edge sets.
 *
 * @param {string} oldNodeId — current spotlight node ID
 * @param {string} newNodeId — target spotlight node ID
 * @returns {{ departing: Set<string>, arriving: Set<string>, shared: Set<string>,
 *             departingEdgeIds: Set<string>, arrivingEdgeIds: Set<string>, sharedEdgeIds: Set<string> }}
 */
export function computeNeighborhoodDiff(oldNodeId, newNodeId) {
	const oldNeighbors = new Set(network.getConnectedNodes(oldNodeId));
	oldNeighbors.add(oldNodeId);

	const newNeighbors = new Set(network.getConnectedNodes(newNodeId));
	newNeighbors.add(newNodeId);

	const departing = new Set();
	const arriving = new Set();
	const shared = new Set();

	for (const id of oldNeighbors) {
		if (newNeighbors.has(id)) {
			shared.add(id);
		} else {
			departing.add(id);
		}
	}
	for (const id of newNeighbors) {
		if (!oldNeighbors.has(id)) {
			arriving.add(id);
		}
	}

	const edges = network.body.data.edges;
	const allEdges = edges.get();
	const departingEdgeIds = new Set();
	const arrivingEdgeIds = new Set();
	const sharedEdgeIds = new Set();

	for (const edge of allEdges) {
		const bothInOld = oldNeighbors.has(edge.from) && oldNeighbors.has(edge.to);
		const bothInNew = newNeighbors.has(edge.from) && newNeighbors.has(edge.to);

		if (bothInOld && bothInNew) {
			sharedEdgeIds.add(edge.id);
		} else if (bothInOld) {
			departingEdgeIds.add(edge.id);
		} else if (bothInNew) {
			arrivingEdgeIds.add(edge.id);
		}
	}

	return { departing, arriving, shared, departingEdgeIds, arrivingEdgeIds, sharedEdgeIds };
}

/**
 * 012: Cancel any in-progress transition animation and clean up intermediate state.
 * Restores opacity on transitioning nodes/edges and re-hides arriving elements.
 */
export function cancelTransition() {
	if (transitionFallbackTimer !== null) {
		clearTimeout(transitionFallbackTimer);
		transitionFallbackTimer = null;
	}
	if (animFrameId !== null) {
		cancelAnimationFrame(animFrameId);
		animFrameId = null;
	}
	if (transitionState) {
		const nodes = network.body.data.nodes;
		const edges = network.body.data.edges;

		const nodeResets = [];
		for (const id of transitionState.departingNodeIds) {
			nodeResets.push({ id, opacity: 1 });
		}
		for (const id of transitionState.arrivingNodeIds) {
			nodeResets.push({ id, hidden: true, opacity: 1 });
		}
		if (nodeResets.length > 0) nodes.update(nodeResets);

		const edgeResets = [];
		for (const id of transitionState.departingEdgeIds) {
			edgeResets.push({ id, color: { opacity: 1 } });
		}
		for (const id of transitionState.arrivingEdgeIds) {
			edgeResets.push({ id, hidden: true, color: { opacity: 1 } });
		}
		if (edgeResets.length > 0) edges.update(edgeResets);

		transitionState = null;
	}
}

/**
 * 012: Apply the canonical end state after a transition completes.
 * Sets correct hidden/visible/opacity/physics state identical to the
 * instant applyEgoGraph path, then enables physics for stabilization.
 *
 * @param {string} nodeId — the new spotlight node ID
 * @param {Set<string>} visibleNodeIds — IDs of nodes that should be visible
 */
export function finalizeTransition(nodeId, visibleNodeIds) {
	const nodes = network.body.data.nodes;
	const edges = network.body.data.edges;

	const allNodes = nodes.get();
	const nodeUpdates = [];
	for (const node of allNodes) {
		const isVisible = visibleNodeIds.has(node.id);
		nodeUpdates.push({
			id: node.id,
			hidden: !isVisible,
			opacity: 1,
			physics: false,
			fixed: false,
		});
	}
	nodes.update(nodeUpdates);

	const allEdges = edges.get();
	const edgeUpdates = [];
	for (const edge of allEdges) {
		const bothVisible = visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to);
		edgeUpdates.push({
			id: edge.id,
			hidden: !bothVisible,
			color: { opacity: 1 },
		});
	}
	edges.update(edgeUpdates);

	spotlightId = nodeId;
	viewMode = "ego";

	network.selectNodes([nodeId]);

	const finalOffset = getPanelOffset({ anticipateOpen: true });
	const targetScale = isMobile() ? 0.9 : 1.5;
	network.moveTo({
		position: network.getPositions([nodeId])[nodeId],
		scale: targetScale,
		offset: finalOffset,
		animation: false,
	});

	// Brief deterministic settle: run exactly 30 physics iterations synchronously,
	// then disable physics. Gives a subtle "snap into place" without oscillation.
	const mobile = isMobile();
	const mobilePhysics = mobile
		? { enabled: true, barnesHut: { springLength: 80 } }
		: { enabled: true };
	network.setOptions({ physics: mobilePhysics });
	network.stabilize(30);
	network.setOptions({ physics: { enabled: false } });
	physicsEnabled = false;
}

/**
 * 012: Run an animated ego-to-ego transition using requestAnimationFrame.
 * Interpolates camera position, zoom dip, and node/edge opacity over 600ms.
 *
 * @param {string} newNodeId — the target spotlight node ID
 */
function runAnimatedTransition(newNodeId) {
	const oldNodeId = spotlightId;
	const diff = computeNeighborhoodDiff(oldNodeId, newNodeId);

	const newNeighbors = network.getConnectedNodes(newNodeId);
	const visibleNodeIds = new Set([newNodeId, ...newNeighbors]);

	const nodes = network.body.data.nodes;
	const edges = network.body.data.edges;

	const nodeSetup = [];
	for (const id of diff.arriving) {
		nodeSetup.push({ id, hidden: false, opacity: 0, physics: false });
	}
	if (nodeSetup.length > 0) nodes.update(nodeSetup);

	const edgeSetup = [];
	for (const id of diff.arrivingEdgeIds) {
		edgeSetup.push({ id, hidden: false, color: { opacity: 0 } });
	}
	if (edgeSetup.length > 0) edges.update(edgeSetup);

	network.selectNodes([newNodeId]);

	const positions = network.getPositions([oldNodeId, newNodeId]);
	const fromPos = positions[oldNodeId];
	const toPos = positions[newNodeId];

	const targetScale = isMobile() ? 0.9 : 1.5;
	const offset = getPanelOffset({ anticipateOpen: true });
	const duration = 600;
	const startTime = performance.now();

	transitionState = {
		fromNodeId: oldNodeId,
		toNodeId: newNodeId,
		startTime,
		duration,
		departingNodeIds: diff.departing,
		arrivingNodeIds: diff.arriving,
		sharedNodeIds: diff.shared,
		departingEdgeIds: diff.departingEdgeIds,
		arrivingEdgeIds: diff.arrivingEdgeIds,
	};

	function step(currentTime) {
		const elapsed = currentTime - startTime;
		const rawT = Math.min(elapsed / duration, 1);
		const t = easeInOutQuad(rawT);

		const x = fromPos.x + (toPos.x - fromPos.x) * t;
		const y = fromPos.y + (toPos.y - fromPos.y) * t;
		const scale = targetScale * computeZoomDip(t);

		network.moveTo({
			position: { x, y },
			scale,
			offset,
			animation: false,
		});

		const nodeUpdates = [];
		for (const id of diff.departing) {
			nodeUpdates.push({ id, opacity: 1 - t });
		}
		for (const id of diff.arriving) {
			nodeUpdates.push({ id, opacity: t });
		}
		if (nodeUpdates.length > 0) nodes.update(nodeUpdates);

		const edgeUpdates = [];
		for (const id of diff.departingEdgeIds) {
			edgeUpdates.push({ id, color: { opacity: 1 - t } });
		}
		for (const id of diff.arrivingEdgeIds) {
			edgeUpdates.push({ id, color: { opacity: t } });
		}
		if (edgeUpdates.length > 0) edges.update(edgeUpdates);

		if (rawT < 1) {
			animFrameId = requestAnimationFrame(step);
		} else {
			clearTimeout(transitionFallbackTimer);
			transitionFallbackTimer = null;
			animFrameId = null;
			transitionState = null;
			finalizeTransition(newNodeId, visibleNodeIds);
		}
	}

	animFrameId = requestAnimationFrame(step);

	// Fallback: complete transition via setTimeout if rAF stalls (e.g. background tab)
	transitionFallbackTimer = setTimeout(() => {
		if (animFrameId !== null) {
			cancelAnimationFrame(animFrameId);
			animFrameId = null;
			transitionState = null;
			transitionFallbackTimer = null;
			finalizeTransition(newNodeId, visibleNodeIds);
		}
	}, duration + 100);
}

/**
 * Initialize the ego-graph module with the vis.Network instance.
 * Must be called after createGraph().
 *
 * @param {vis.Network} net — the active vis.Network instance
 */
export function initEgoGraph(net) {
	network = net;
	viewMode = "ego";
	spotlightId = null;
	physicsEnabled = false;
	lastPhysicsIsMobile = false;
	pendingStabilizationHandler = null;
	animFrameId = null;
	transitionState = null;
	transitionFallbackTimer = null;
}

/**
 * Select a random non-company node ID from the dataset.
 * Does not apply the ego-graph — call applyEgoGraph() with the result.
 *
 * FR-001: Random selection on every load
 * FR-009: Company nodes excluded from random selection
 *
 * @param {Array<{id: string, group: string}>} nodesArray — the full nodes data array
 * @returns {string} node ID of the randomly selected non-company node
 */
export function pickRandomSpotlight(nodesArray) {
	const candidates = nodesArray.filter((n) => n.group !== "company");
	const index = Math.floor(Math.random() * candidates.length);
	return candidates[index].id;
}

/**
 * Set a new spotlight node: hide non-neighbors, show neighborhood,
 * focus camera, transition to ego mode.
 *
 * FR-002: Spotlight node centered in graph viewport
 * FR-003: Only direct neighbors visible
 * FR-005: Click neighbor → new spotlight (when called in sequence)
 * FR-006: Animated transition when spotlight changes
 *
 * Research R1: hidden property on DataSet
 * Research R2: getConnectedNodes for neighborhood
 * Research R3: physics: false on hidden nodes
 * Research R6: network.focus() for centering
 *
 * @param {string} nodeId — ID of the node to spotlight
 */
export function applyEgoGraph(nodeId) {
	if (!network) return;

	// Cancel any pending re-center from a panel-close that precedes this selection
	clearTimeout(reCenterTimer);

	// 012: Cancel any in-progress transition animation (FR-005)
	cancelTransition();

	// FR-006: Same-node click — skip neighborhood updates, re-center camera only
	if (nodeId === spotlightId) {
		const offset = getPanelOffset({ anticipateOpen: true });
		network.focus(nodeId, {
			scale: isMobile() ? 0.9 : 1.5,
			offset: offset,
			animation: {
				duration: 500,
				easingFunction: "easeInOutQuad",
			},
		});
		return;
	}

	// FR-002: Cancel any pending stabilization handler (cancel-and-replace)
	if (pendingStabilizationHandler) {
		network.off("stabilized", pendingStabilizationHandler);
		pendingStabilizationHandler = null;
	}

	// 012: Ego-to-ego navigation — animate when transitioning between spotlights
	if (spotlightId !== null && viewMode === "ego" && !prefersReducedMotion()) {
		runAnimatedTransition(nodeId);
		return;
	}

	// Instant path: initial load, from full mode, or reduced motion
	spotlightId = nodeId;
	viewMode = "ego";

	// FR-001/FR-003: Only call setOptions when physics config actually needs to change.
	// Enable physics when transitioning from disabled state or when viewport type changed.
	const mobile = isMobile();
	if (!physicsEnabled || mobile !== lastPhysicsIsMobile) {
		const mobilePhysics = mobile
			? { enabled: true, barnesHut: { springLength: 80 } }
			: { enabled: true };
		network.setOptions({ physics: mobilePhysics });
		physicsEnabled = true;
		lastPhysicsIsMobile = mobile;
	}

	const nodes = network.body.data.nodes;
	const edges = network.body.data.edges;

	// Get direct neighbors of the spotlight node
	const neighborIds = network.getConnectedNodes(nodeId);
	const visibleNodeIds = new Set([nodeId, ...neighborIds]);

	// Update node visibility and physics.
	// Pin the spotlight node (fixed: true) so physics cannot move it while
	// neighbors settle around it — prevents the visible drift-then-snap.
	const allNodes = nodes.get();
	const nodeUpdates = [];
	for (const node of allNodes) {
		const isVisible = visibleNodeIds.has(node.id);
		const isSpotlight = node.id === nodeId;
		nodeUpdates.push({
			id: node.id,
			hidden: !isVisible,
			physics: isVisible,
			fixed: isSpotlight ? { x: true, y: true } : false,
		});
	}
	nodes.update(nodeUpdates);

	// Update edge visibility: both endpoints must be visible
	const allEdges = edges.get();
	const edgeUpdates = [];
	for (const edge of allEdges) {
		const bothVisible = visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to);
		edgeUpdates.push({
			id: edge.id,
			hidden: !bothVisible,
		});
	}
	edges.update(edgeUpdates);

	// Select the spotlight node (visual highlight)
	network.selectNodes([nodeId]);

	// Focus camera on the spotlight node with animation.
	// 005: Use { x, y } offset — vertical on mobile, horizontal on desktop.
	// anticipateOpen: the detail panel always opens right after this call.
	const offset = getPanelOffset({ anticipateOpen: true });
	network.focus(nodeId, {
		scale: isMobile() ? 0.9 : 1.5,
		offset: offset,
		animation: {
			duration: 500,
			easingFunction: "easeInOutQuad",
		},
	});

	// FR-004: Once the neighborhood has settled, unpin the spotlight node and
	// disable physics to lock everything in place.
	// FR-002: Store handler reference for cancel-and-replace.
	pendingStabilizationHandler = () => {
		if (viewMode === "ego" && spotlightId) {
			nodes.update([{ id: spotlightId, fixed: false }]);
			network.setOptions({ physics: { enabled: false } });
			physicsEnabled = false;
		}
		pendingStabilizationHandler = null;
	};
	network.once("stabilized", pendingStabilizationHandler);
}

/**
 * Transition to full-graph mode: unhide all nodes/edges, restore physics,
 * fit viewport with animation.
 *
 * FR-007: "Expand All" reveals full graph
 * Research R5: fit() for viewport adjustment
 */
export function expandAll() {
	if (!network) return;

	// Cancel any pending re-center from a panel-close
	clearTimeout(reCenterTimer);

	// 012: Cancel any in-progress transition animation (FR-005)
	cancelTransition();

	// FR-002: Cancel any pending stabilization handler
	if (pendingStabilizationHandler) {
		network.off("stabilized", pendingStabilizationHandler);
		pendingStabilizationHandler = null;
	}

	spotlightId = null;
	viewMode = "full";

	// Re-enable physics so the full graph can settle.
	// Reset springLength to default (may have been shortened for mobile ego).
	network.setOptions({
		physics: { enabled: true, barnesHut: { springLength: 150 } },
	});
	// Mark physics as not-ego-configured — expandAll's physics is transient and
	// the next applyEgoGraph() call must re-apply its own config.
	physicsEnabled = false;
	lastPhysicsIsMobile = false;

	const nodes = network.body.data.nodes;
	const edges = network.body.data.edges;

	// Unhide all nodes and restore physics
	const allNodes = nodes.get();
	const nodeUpdates = [];
	for (const node of allNodes) {
		nodeUpdates.push({
			id: node.id,
			hidden: false,
			physics: true,
		});
	}
	nodes.update(nodeUpdates);

	// Unhide all edges
	const allEdges = edges.get();
	const edgeUpdates = [];
	for (const edge of allEdges) {
		edgeUpdates.push({
			id: edge.id,
			hidden: false,
		});
	}
	edges.update(edgeUpdates);

	// Deselect any selected nodes
	network.unselectAll();

	// Fit viewport to show all nodes with animation,
	// then shift to account for the detail panel (desktop only)
	network.fit({
		animation: {
			duration: 500,
			easingFunction: "easeInOutQuad",
		},
	});
	// 005: On mobile, no horizontal offset shift needed (sheet is closed during expand all)
	if (!isMobile()) {
		setTimeout(() => {
			const pos = network.getViewPosition();
			const offset = getPanelOffset();
			network.moveTo({
				position: { x: pos.x, y: pos.y },
				offset: offset,
				animation: {
					duration: 300,
					easingFunction: "easeInOutQuad",
				},
			});
		}, 550);
	}

	// Disable physics after the full graph settles to prevent ongoing drift
	pendingStabilizationHandler = () => {
		if (viewMode === "full") {
			network.setOptions({ physics: { enabled: false } });
			physicsEnabled = false;
		}
		pendingStabilizationHandler = null;
	};
	network.once("stabilized", pendingStabilizationHandler);
}

/**
 * Return the current view mode.
 * @returns {"ego" | "full"}
 */
export function getViewMode() {
	return viewMode;
}

/**
 * Return the current spotlight node ID, or null if in full mode.
 * @returns {string | null}
 */
export function getSpotlightId() {
	return spotlightId;
}

/* ============================================================
   005: Re-center on panel close, resize, and orientation change
   ============================================================ */

/**
 * 005: Re-center the graph when the detail panel closes on mobile.
 * In ego mode, re-focus on the spotlight node with zero offset.
 * In full mode, fit the full graph to the viewport.
 */
function reCenterGraph() {
	if (!network) return;

	if (viewMode === "ego" && spotlightId) {
		const offset = getPanelOffset();
		network.focus(spotlightId, {
			scale: 1.5,
			offset: offset,
			animation: {
				duration: 500,
				easingFunction: "easeInOutQuad",
			},
		});
	} else if (viewMode === "full") {
		network.fit({
			animation: {
				duration: 500,
				easingFunction: "easeInOutQuad",
			},
		});
	}
}

/**
 * 005: Delayed re-center timer — allows cancellation when a new
 * applyEgoGraph call immediately follows a panel close (avoids
 * competing focus animations that cause stuttering).
 */
let reCenterTimer = null;

// Listen for detail-panel-closed custom event (dispatched by detail-panel.js)
document.addEventListener("detail-panel-closed", () => {
	clearTimeout(reCenterTimer);
	reCenterTimer = setTimeout(() => {
		reCenterGraph();
	}, 100);
});

/**
 * 005: Debounced resize handler for re-centering after viewport changes.
 * Uses 250ms debounce to avoid excessive calls during window resize drag.
 */
let resizeTimer = null;
function handleResize() {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => {
		reCenterGraph();
	}, 250);
}

window.addEventListener("resize", handleResize);

// 005: Re-center when crossing the mobile breakpoint (e.g., orientation change)
mobileQuery.addEventListener("change", () => {
	reCenterGraph();
});
