/**
 * Filters module — toggle visibility of node categories in the graph.
 *
 * Exports:
 *   initFilters(network)            — initialize with vis.Network instance
 *   toggleGroup(group, visible)     — show/hide all nodes of a group
 *   getVisibleGroups()              — return array of currently visible group names
 *
 * The SEGA company node is always visible — it cannot be filtered out.
 * When a node is hidden, all edges connected to it are also hidden.
 * Re-enabling a group restores its nodes and edges.
 *
 * @module filters
 */

/** @type {vis.Network | null} */
let network = null;

/** Set of currently hidden groups */
const hiddenGroups = new Set();

/** All valid filterable group names (company is always visible) */
const FILTERABLE_GROUPS = ["studio", "platform", "game", "creator"];
const ALL_GROUPS = ["company", ...FILTERABLE_GROUPS];

/**
 * Initialize the filters module with a vis.Network instance.
 * @param {vis.Network} net
 */
export function initFilters(net) {
	network = net;
	hiddenGroups.clear();
}

/**
 * Toggle visibility of all nodes belonging to a group.
 * Edges connected to hidden nodes are also hidden.
 * The company group (SEGA root) cannot be hidden.
 *
 * @param {string} group — group name (studio, platform, game, creator)
 * @param {boolean} visible — true to show, false to hide
 */
export function toggleGroup(group, visible) {
	if (!network) return;
	if (group === "company") return; // SEGA is always visible

	if (visible) {
		hiddenGroups.delete(group);
	} else {
		hiddenGroups.add(group);
	}

	applyFilters();
}

/**
 * Return an array of currently visible group names.
 * @returns {string[]}
 */
export function getVisibleGroups() {
	return ALL_GROUPS.filter((g) => !hiddenGroups.has(g));
}

/* ============================================================
   Private helpers
   ============================================================ */

/**
 * Apply the current filter state to the network's DataSet.
 * Updates the `hidden` property on nodes and edges.
 */
function applyFilters() {
	const nodes = network.body.data.nodes;
	const edges = network.body.data.edges;

	// Build set of hidden node IDs
	const hiddenNodeIds = new Set();
	const allNodes = nodes.get();
	const updates = [];

	for (const node of allNodes) {
		const shouldHide = hiddenGroups.has(node.group);
		if (shouldHide) {
			hiddenNodeIds.add(node.id);
		}
		updates.push({ id: node.id, hidden: shouldHide });
	}

	nodes.update(updates);

	// Hide edges where either endpoint is hidden
	const allEdges = edges.get();
	const edgeUpdates = [];

	for (const edge of allEdges) {
		const shouldHide = hiddenNodeIds.has(edge.from) || hiddenNodeIds.has(edge.to);
		edgeUpdates.push({ id: edge.id, hidden: shouldHide });
	}

	edges.update(edgeUpdates);
}
