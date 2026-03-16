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
 *
 * @module ego-graph
 */

/** @type {vis.Network | null} */
let network = null;

/** @type {"ego" | "full"} */
let viewMode = "ego";

/** @type {string | null} */
let spotlightId = null;

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

	spotlightId = nodeId;
	viewMode = "ego";

	// Re-enable physics so the neighborhood can settle into position
	network.setOptions({ physics: { enabled: true } });

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

	// Once the neighborhood has settled, unpin the spotlight node and
	// disable physics to lock everything in place.
	network.once("stabilized", () => {
		if (viewMode === "ego" && spotlightId) {
			nodes.update([{ id: spotlightId, fixed: false }]);
			network.setOptions({ physics: { enabled: false } });
		}
	});
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

	spotlightId = null;
	viewMode = "full";

	// Re-enable physics so the full graph can settle
	network.setOptions({ physics: { enabled: true } });

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
	network.once("stabilized", () => {
		if (viewMode === "full") {
			network.setOptions({ physics: { enabled: false } });
		}
	});
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
