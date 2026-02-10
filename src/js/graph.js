/**
 * Graph module — creates and manages the vis-network force-directed graph.
 *
 * Exports:
 *   createGraph(container, nodesArray, edgesArray) → vis.Network
 *   getNetwork()  → vis.Network | null
 *   destroyGraph() → void
 *   GROUP_CONFIG   → object with 5 group definitions
 *
 * @module graph
 */

/**
 * Node-group visual configuration.
 * Each group defines a distinct shape and color matching the CSS custom properties.
 *
 * Spec: FR-002 — five visual groups (company, studio, platform, game, creator)
 * Plan: company=star/red, studio=dot/blue, platform=diamond/green,
 *       game=square/orange, creator=triangle/purple
 */
export const GROUP_CONFIG = {
	company: {
		shape: "star",
		size: 30,
		color: {
			background: "#e63946",
			border: "#b02a35",
			highlight: { background: "#ff4d5a", border: "#e63946" },
			hover: { background: "#ff4d5a", border: "#e63946" },
		},
		font: { color: "#e6edf3", size: 16, face: "system-ui, sans-serif", bold: true },
	},
	studio: {
		shape: "dot",
		size: 20,
		color: {
			background: "#457b9d",
			border: "#35607a",
			highlight: { background: "#5a96ba", border: "#457b9d" },
			hover: { background: "#5a96ba", border: "#457b9d" },
		},
		font: { color: "#e6edf3", size: 14, face: "system-ui, sans-serif" },
	},
	platform: {
		shape: "diamond",
		size: 18,
		color: {
			background: "#2a9d8f",
			border: "#1f7a6f",
			highlight: { background: "#3cb8a9", border: "#2a9d8f" },
			hover: { background: "#3cb8a9", border: "#2a9d8f" },
		},
		font: { color: "#e6edf3", size: 13, face: "system-ui, sans-serif" },
	},
	game: {
		shape: "square",
		size: 14,
		color: {
			background: "#e9a820",
			border: "#c08b18",
			highlight: { background: "#ffc233", border: "#e9a820" },
			hover: { background: "#ffc233", border: "#e9a820" },
		},
		font: { color: "#e6edf3", size: 12, face: "system-ui, sans-serif" },
	},
	creator: {
		shape: "triangle",
		size: 18,
		color: {
			background: "#7b2d8e",
			border: "#5e2270",
			highlight: { background: "#9b3fb0", border: "#7b2d8e" },
			hover: { background: "#9b3fb0", border: "#7b2d8e" },
		},
		font: { color: "#e6edf3", size: 13, face: "system-ui, sans-serif" },
	},
};

/** @type {vis.Network | null} */
let network = null;

/**
 * Create the vis-network graph inside the given container element.
 *
 * @param {HTMLElement} container  — DOM element to render into
 * @param {Array}       nodesArray — array of node objects (id, label, group, …)
 * @param {Array}       edgesArray — array of edge objects (from, to, label, …)
 * @returns {vis.Network} the network instance
 */
export function createGraph(container, nodesArray, edgesArray) {
	// Destroy any previous instance
	if (network) {
		network.destroy();
		network = null;
	}

	const nodes = new vis.DataSet(nodesArray);
	const edges = new vis.DataSet(edgesArray);

	/** @type {vis.Options} */
	const options = {
		groups: GROUP_CONFIG,
		physics: {
			solver: "barnesHut",
			barnesHut: {
				gravitationalConstant: -3000,
				centralGravity: 0.3,
				springLength: 150,
				springConstant: 0.04,
				damping: 0.09,
				avoidOverlap: 0.2,
			},
			stabilization: {
				enabled: true,
				iterations: 500,
				updateInterval: 25,
			},
		},
		edges: {
			arrows: { to: { enabled: true, scaleFactor: 0.6 } },
			color: { color: "#484f58", highlight: "#8b949e", hover: "#8b949e" },
			font: {
				color: "#8b949e",
				size: 11,
				face: "system-ui, sans-serif",
				strokeWidth: 3,
				strokeColor: "#0d1117",
				align: "middle",
			},
			smooth: {
				enabled: true,
				type: "continuous",
			},
			width: 1.2,
			hoverWidth: 2,
		},
		interaction: {
			hover: true,
			tooltipDelay: 200,
			zoomView: true,
			dragView: true,
			dragNodes: true,
			multiselect: false,
			navigationButtons: false,
		},
		layout: {
			improvedLayout: true,
			randomSeed: 42,
		},
	};

	network = new vis.Network(container, { nodes, edges }, options);

	return network;
}

/**
 * Returns the active vis.Network instance, or null if none exists.
 * @returns {vis.Network | null}
 */
export function getNetwork() {
	return network;
}

/**
 * Destroys the current network and releases resources.
 */
export function destroyGraph() {
	if (network) {
		network.destroy();
		network = null;
	}
}
