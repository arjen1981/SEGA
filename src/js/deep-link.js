/**
 * URL-based deep linking for the SEGA Arcade Graph.
 *
 * Reads and writes `#node=<nodeId>` URL hash fragments to enable
 * shareable, bookmarkable links to specific graph nodes.
 *
 * @module deep-link
 */

/**
 * Parse a URL hash string into a node ID.
 * @param {string} hash — the hash string (e.g., "#node=virtua-fighter")
 * @returns {{ nodeId: string | null }}
 */
export function parseHash(hash) {
	if (!hash || !hash.startsWith("#node=")) {
		return { nodeId: null };
	}
	const value = decodeURIComponent(hash.slice("#node=".length));
	if (!value) {
		return { nodeId: null };
	}
	return { nodeId: value };
}

/** @type {Map<string, object>|null} */
let storedNodeMap = null;

/** @type {{ onNavigate: function, onInvalidNode: function }|null} */
let storedOptions = null;

/**
 * Initialize the deep-link module.
 * Sets up popstate listener for browser back/forward navigation.
 * @param {Map<string, object>} nodeMap — Map of node ID → node data
 * @param {{ onNavigate: function, onInvalidNode: function }} options
 * @returns {{ initialNodeId: string | null }}
 */
export function initDeepLink(nodeMap, options) {
	storedNodeMap = nodeMap;
	storedOptions = options;

	// Set up popstate listener for back/forward
	window.addEventListener("popstate", handlePopState);

	// Parse the initial hash
	const { nodeId } = parseHash(location.hash);
	if (!nodeId) {
		return { initialNodeId: null };
	}
	if (nodeMap.has(nodeId)) {
		return { initialNodeId: nodeId };
	}
	// Valid format but unknown node
	options.onInvalidNode(nodeId);
	return { initialNodeId: null };
}

/**
 * Handle popstate events (browser back/forward).
 */
function handlePopState() {
	const { nodeId } = parseHash(location.hash);
	if (!nodeId) {
		// Hash cleared — deselect
		if (storedOptions) storedOptions.onNavigate(null);
		return;
	}
	if (storedNodeMap?.has(nodeId)) {
		if (storedOptions) storedOptions.onNavigate(nodeId);
	} else {
		if (storedOptions) storedOptions.onInvalidNode(nodeId);
	}
}

/**
 * Update the URL hash to reflect the currently selected node.
 * Uses history.pushState to avoid triggering popstate/hashchange.
 * @param {string} nodeId
 */
export function updateHash(nodeId) {
	history.pushState(null, "", `#node=${nodeId}`);
}

/**
 * Remove the hash from the URL when no node is selected.
 * Uses history.pushState to avoid triggering popstate.
 */
export function clearHash() {
	history.pushState(null, "", location.pathname + location.search);
}
