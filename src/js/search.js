/**
 * Search module — autocomplete search with graph focus/highlight.
 *
 * Exports:
 *   initSearch(nodesArray)          — initialize with the nodes data array
 *   searchNodes(query)              — return matching nodes for a query
 *   selectSuggestion(nodeId)        — focus/zoom the graph to a node
 *
 * @module search
 */

import { applyEgoGraph } from "./ego-graph.js";
import { getNetwork } from "./graph.js";

/** @type {Array<{id: string, label: string, group: string}>} */
let allNodes = [];

/**
 * Initialize the search module with the nodes data.
 * @param {Array} nodesArray — array of node objects
 */
export function initSearch(nodesArray) {
	allNodes = nodesArray.map((n) => ({
		id: n.id,
		label: n.label,
		group: n.group,
	}));
}

/**
 * Search for nodes matching a case-insensitive substring query.
 * Returns an empty array for empty queries.
 *
 * @param {string} query — search string
 * @returns {Array<{id: string, label: string, group: string}>} matching nodes
 */
export function searchNodes(query) {
	if (!query || query.trim() === "") {
		return [];
	}

	const lowerQuery = query.toLowerCase();
	return allNodes.filter((node) => node.label.toLowerCase().includes(lowerQuery));
}

/**
 * Select and focus the graph on a specific node.
 * In ego mode or full mode, triggers applyEgoGraph to show the
 * ego-graph centered on the selected node (FR-012).
 *
 * @param {string} nodeId — ID of the node to focus on
 */
export function selectSuggestion(nodeId) {
	const network = getNetwork();
	if (!network) return;

	// Check the node exists in the dataset
	const nodeData = network.body.data.nodes.get(nodeId);
	if (!nodeData) return;

	// FR-012: Search result → ego-graph mode on selected node
	applyEgoGraph(nodeId);
}
