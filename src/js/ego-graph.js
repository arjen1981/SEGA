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
 * Get the pixel width of the detail panel when it is open, so that
 * graph centering can offset to the visible area left of the panel.
 * @returns {number} panel width in pixels (0 if panel is not open/visible)
 */
function getPanelOffset() {
	const panel = document.querySelector(".detail-panel");
	if (panel?.classList.contains("open")) {
		return panel.offsetWidth;
	}
	// Even if the panel isn't open yet, the app always opens it after focus,
	// so anticipate the default panel width from CSS custom property.
	const raw = getComputedStyle(document.documentElement).getPropertyValue("--detail-panel-width");
	return Number.parseInt(raw, 10) || 400;
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

	spotlightId = nodeId;
	viewMode = "ego";

	const nodes = network.body.data.nodes;
	const edges = network.body.data.edges;

	// Get direct neighbors of the spotlight node
	const neighborIds = network.getConnectedNodes(nodeId);
	const visibleNodeIds = new Set([nodeId, ...neighborIds]);

	// Update node visibility and physics
	const allNodes = nodes.get();
	const nodeUpdates = [];
	for (const node of allNodes) {
		const isVisible = visibleNodeIds.has(node.id);
		nodeUpdates.push({
			id: node.id,
			hidden: !isVisible,
			physics: isVisible,
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
	// Offset X so the node centers in the area left of the detail panel.
	const panelWidth = getPanelOffset();
	network.focus(nodeId, {
		scale: 1.5,
		offset: { x: -panelWidth / 2, y: 0 },
		animation: {
			duration: 500,
			easingFunction: "easeInOutQuad",
		},
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

	spotlightId = null;
	viewMode = "full";

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
	// shifting left to account for the detail panel
	network.fit({
		animation: {
			duration: 500,
			easingFunction: "easeInOutQuad",
		},
	});
	// After fit, shift viewport left to account for the detail panel
	setTimeout(() => {
		const pos = network.getViewPosition();
		const panelWidth = getPanelOffset();
		network.moveTo({
			position: { x: pos.x, y: pos.y },
			offset: { x: -panelWidth / 2, y: 0 },
			animation: {
				duration: 300,
				easingFunction: "easeInOutQuad",
			},
		});
	}, 550);
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
