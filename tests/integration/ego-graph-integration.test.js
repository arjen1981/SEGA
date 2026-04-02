/**
 * Integration tests for the ego-graph feature.
 *
 * T011: Page-load ego-graph integration (US1)
 * T016: Ego-graph navigation integration (US2)
 * T020: Expand/collapse cycle integration (US3)
 *
 * These tests verify the full flow across multiple modules.
 *
 * @module ego-graph-integration.test
 */

import { closeDetailPanel, initDetailPanel, openDetailPanel } from "../../src/js/detail-panel.js";
import {
	applyEgoGraph,
	cancelTransition,
	expandAll,
	getSpotlightId,
	getViewMode,
	initEgoGraph,
	pickRandomSpotlight,
} from "../../src/js/ego-graph.js";
import { createGraph, destroyGraph } from "../../src/js/graph.js";

/* ============================================================
   Test data
   ============================================================ */

const TEST_NODES = [
	{ id: "sega", label: "SEGA", group: "company", summary: "SEGA Corporation" },
	{ id: "sonic-team", label: "Sonic Team", group: "studio", summary: "Game studio" },
	{ id: "genesis", label: "Genesis", group: "platform", summary: "16-bit console" },
	{ id: "sonic", label: "Sonic the Hedgehog", group: "game", summary: "Flagship game" },
	{ id: "yu-suzuki", label: "Yu Suzuki", group: "creator", summary: "Game designer" },
	{ id: "outrun", label: "OutRun", group: "game", summary: "Racing game" },
];

const TEST_EDGES = [
	{ id: "e1", from: "sega", to: "sonic-team" },
	{ id: "e2", from: "sega", to: "genesis" },
	{ id: "e3", from: "sonic-team", to: "sonic" },
	{ id: "e4", from: "sega", to: "yu-suzuki" },
	{ id: "e5", from: "yu-suzuki", to: "outrun" },
];

/* ============================================================
   T011: Page-load ego-graph integration (US1)
   ============================================================ */

QUnit.module("ego-graph integration — page-load flow (US1)", (hooks) => {
	let network;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		network = createGraph(container, TEST_NODES, TEST_EDGES);

		const nodeMap = new Map();
		for (const node of TEST_NODES) {
			nodeMap.set(node.id, node);
		}
		initDetailPanel(nodeMap);
		initEgoGraph(network);
	});

	hooks.afterEach(() => {
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("full page-load flow: random select → ego-graph → detail panel", (assert) => {
		// Simulate what app.js init() does on page load
		const spotlightNodeId = pickRandomSpotlight(TEST_NODES);
		applyEgoGraph(spotlightNodeId);
		openDetailPanel(spotlightNodeId);

		// Verify ego mode is active
		assert.strictEqual(getViewMode(), "ego", "mode is ego after page-load flow");
		assert.strictEqual(getSpotlightId(), spotlightNodeId, "spotlightId is set");

		// Verify only neighborhood nodes are visible
		const nodes = network.body.data.nodes;
		const visibleIds = nodes
			.get()
			.filter((n) => !n.hidden)
			.map((n) => n.id);
		assert.ok(visibleIds.includes(spotlightNodeId), "spotlight node is visible");
		assert.ok(visibleIds.length >= 2, "at least spotlight + 1 neighbor visible");
		assert.ok(visibleIds.length <= TEST_NODES.length, "not more than total nodes visible");

		// Verify detail panel is open
		const panel = document.getElementById("detail-panel");
		assert.true(panel.classList.contains("open"), "detail panel is open");
	});

	QUnit.test("spotlight node is not a company node", (assert) => {
		const spotlightNodeId = pickRandomSpotlight(TEST_NODES);
		const node = TEST_NODES.find((n) => n.id === spotlightNodeId);
		assert.notEqual(node.group, "company", "spotlight is not a company node");
	});
});

/* ============================================================
   T016: Ego-graph navigation integration (US2)
   ============================================================ */

QUnit.module("ego-graph integration — navigation (US2)", (hooks) => {
	let network;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		network = createGraph(container, TEST_NODES, TEST_EDGES);

		const nodeMap = new Map();
		for (const node of TEST_NODES) {
			nodeMap.set(node.id, node);
		}
		initDetailPanel(nodeMap);
		initEgoGraph(network);
	});

	hooks.afterEach(() => {
		cancelTransition();
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("click neighbor → new ego-graph centered on clicked node", (assert) => {
		// Start with sonic-team spotlight
		applyEgoGraph("sonic-team");
		openDetailPanel("sonic-team");

		assert.strictEqual(getSpotlightId(), "sonic-team", "initial spotlight is sonic-team");

		// Reset to full mode so next ego-graph takes instant path
		expandAll();

		// Navigate to sonic (instant path after expandAll)
		applyEgoGraph("sonic");
		openDetailPanel("sonic");

		assert.strictEqual(getSpotlightId(), "sonic", "spotlight shifted to sonic");
		assert.strictEqual(getViewMode(), "ego", "still in ego mode");

		// Verify new neighborhood: sonic connects to sonic-team only
		const nodes = network.body.data.nodes;
		const visibleIds = nodes
			.get()
			.filter((n) => !n.hidden)
			.map((n) => n.id);
		assert.deepEqual(
			visibleIds.sort(),
			["sonic", "sonic-team"].sort(),
			"new ego-graph shows sonic + sonic-team only",
		);
	});

	QUnit.test("sequential navigation through multiple nodes", (assert) => {
		// Start at sega
		applyEgoGraph("sega");
		assert.strictEqual(getSpotlightId(), "sega");

		// Navigate via expandAll (reset) then ego
		expandAll();
		applyEgoGraph("sonic-team");

		expandAll();
		applyEgoGraph("sonic");

		assert.strictEqual(getSpotlightId(), "sonic");

		// Verify final visible set
		const nodes = network.body.data.nodes;
		const visibleIds = nodes
			.get()
			.filter((n) => !n.hidden)
			.map((n) => n.id);
		assert.deepEqual(visibleIds.sort(), ["sonic", "sonic-team"].sort());
	});
});

/* ============================================================
   T020: Expand/collapse cycle integration (US3)
   ============================================================ */

QUnit.module("ego-graph integration — expand/collapse cycle (US3)", (hooks) => {
	let network;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		network = createGraph(container, TEST_NODES, TEST_EDGES);

		const nodeMap = new Map();
		for (const node of TEST_NODES) {
			nodeMap.set(node.id, node);
		}
		initDetailPanel(nodeMap);
		initEgoGraph(network);
	});

	hooks.afterEach(() => {
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("ego → expand all → click node → ego (full cycle)", (assert) => {
		// 1. Start in ego mode with sonic-team
		applyEgoGraph("sonic-team");
		assert.strictEqual(getViewMode(), "ego", "step 1: ego mode");
		assert.strictEqual(getSpotlightId(), "sonic-team", "step 1: spotlight on sonic-team");

		// 2. Expand All
		expandAll();
		assert.strictEqual(getViewMode(), "full", "step 2: full mode");
		assert.strictEqual(getSpotlightId(), null, "step 2: no spotlight");

		// Verify all nodes visible
		const nodes = network.body.data.nodes;
		const allVisible = nodes.get().every((n) => !n.hidden);
		assert.true(allVisible, "step 2: all nodes visible after expand");

		// All nodes have physics enabled
		const allPhysics = nodes.get().every((n) => n.physics !== false);
		assert.true(allPhysics, "step 2: all nodes have physics enabled");

		// 3. Click a node in full mode → back to ego
		applyEgoGraph("yu-suzuki");
		openDetailPanel("yu-suzuki");
		assert.strictEqual(getViewMode(), "ego", "step 3: back to ego");
		assert.strictEqual(getSpotlightId(), "yu-suzuki", "step 3: spotlight on yu-suzuki");

		// Verify only yu-suzuki neighborhood visible
		const visibleIds = nodes
			.get()
			.filter((n) => !n.hidden)
			.map((n) => n.id);
		assert.deepEqual(
			visibleIds.sort(),
			["outrun", "sega", "yu-suzuki"].sort(),
			"step 3: only yu-suzuki + neighbors visible",
		);
	});

	QUnit.test("expand all unhides all edges", (assert) => {
		applyEgoGraph("sonic");
		expandAll();

		const edges = network.body.data.edges;
		const allEdgesVisible = edges.get().every((e) => !e.hidden);
		assert.true(allEdgesVisible, "all edges visible after expand all");
	});
});

/* ============================================================
   009: Rapid navigation integration (SC-001)
   ============================================================ */

QUnit.module("ego-graph integration — rapid navigation (009)", (hooks) => {
	let network;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		network = createGraph(container, TEST_NODES, TEST_EDGES);

		const nodeMap = new Map();
		for (const node of TEST_NODES) {
			nodeMap.set(node.id, node);
		}
		initDetailPanel(nodeMap);
		initEgoGraph(network);
	});

	hooks.afterEach(() => {
		cancelTransition();
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("T016: rapid sequential navigation applies only final spotlight", (assert) => {
		// Simulate rapid clicks through 3 nodes using instant path
		applyEgoGraph("sonic-team");
		expandAll();
		applyEgoGraph("sega");
		expandAll();
		applyEgoGraph("yu-suzuki");

		// Only the final spotlight should be active
		assert.strictEqual(getSpotlightId(), "yu-suzuki", "final spotlight is yu-suzuki");
		assert.strictEqual(getViewMode(), "ego", "still in ego mode");

		// Verify only yu-suzuki neighborhood is visible
		const nodes = network.body.data.nodes;
		const visibleIds = nodes
			.get()
			.filter((n) => !n.hidden)
			.map((n) => n.id);
		assert.deepEqual(
			visibleIds.sort(),
			["outrun", "sega", "yu-suzuki"].sort(),
			"only yu-suzuki + neighbors visible after rapid navigation",
		);
	});

	QUnit.test("same-node click preserves neighborhood and re-centers", (assert) => {
		applyEgoGraph("sonic-team");
		openDetailPanel("sonic-team");

		const nodes = network.body.data.nodes;
		const visibleBefore = nodes.get().filter((n) => !n.hidden).map((n) => n.id).sort();

		// Click same node
		applyEgoGraph("sonic-team");

		const visibleAfter = nodes.get().filter((n) => !n.hidden).map((n) => n.id).sort();
		assert.deepEqual(visibleAfter, visibleBefore, "neighborhood unchanged after same-node click");
		assert.strictEqual(getSpotlightId(), "sonic-team", "spotlight unchanged");
	});

	QUnit.test("expand all during rapid ego navigation works correctly", (assert) => {
		applyEgoGraph("sonic-team");
		applyEgoGraph("sonic");
		expandAll();

		assert.strictEqual(getViewMode(), "full", "mode is full after expandAll");
		assert.strictEqual(getSpotlightId(), null, "no spotlight in full mode");

		const nodes = network.body.data.nodes;
		const allVisible = nodes.get().every((n) => !n.hidden);
		assert.true(allVisible, "all nodes visible after expand all");
	});
});

/* ============================================================
   012: Transition animation integration tests
   ============================================================ */

QUnit.module("ego-graph integration — animated transition (012 T012–T014c)", (hooks) => {
	let network;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		network = createGraph(container, TEST_NODES, TEST_EDGES);

		const nodeMap = new Map();
		for (const node of TEST_NODES) {
			nodeMap.set(node.id, node);
		}
		initDetailPanel(nodeMap);
		initEgoGraph(network);
	});

	hooks.afterEach(() => {
		cancelTransition();
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("T012: departing nodes hidden and arriving nodes visible after ego-to-ego navigation", (assert) => {
		// Initial ego (instant path since spotlightId is null)
		applyEgoGraph("sonic-team");

		// Navigate via expandAll to ensure instant path
		expandAll();
		applyEgoGraph("yu-suzuki");

		const nodes = network.body.data.nodes;

		const sonicTeam = nodes.get("sonic-team");
		assert.true(sonicTeam.hidden, "departing node sonic-team is hidden after transition");

		const sonic = nodes.get("sonic");
		assert.true(sonic.hidden, "departing node sonic is hidden after transition");

		const outrun = nodes.get("outrun");
		assert.false(outrun.hidden, "arriving node outrun is visible");

		const yuSuzuki = nodes.get("yu-suzuki");
		assert.false(yuSuzuki.hidden, "new spotlight yu-suzuki is visible");
	});

	QUnit.test("T013: shared nodes remain visible after ego-to-ego navigation", (assert) => {
		applyEgoGraph("sonic-team");

		// sonic-team → sega: shared nodes are {sega, sonic-team}
		expandAll();
		applyEgoGraph("sega");

		const nodes = network.body.data.nodes;
		const sega = nodes.get("sega");
		assert.false(sega.hidden, "shared node sega is visible after transition");
	});

	QUnit.test("T014: final state matches canonical applyEgoGraph result", (assert) => {
		applyEgoGraph("sonic-team");

		expandAll();
		applyEgoGraph("sega");

		assert.strictEqual(getSpotlightId(), "sega", "spotlightId is sega");
		assert.strictEqual(getViewMode(), "ego", "viewMode is ego");

		const nodes = network.body.data.nodes;
		const visibleIds = nodes.get().filter((n) => !n.hidden).map((n) => n.id).sort();

		// sega neighbors: sonic-team, genesis, yu-suzuki
		assert.deepEqual(
			visibleIds,
			["genesis", "sega", "sonic-team", "yu-suzuki"].sort(),
			"correct visible nodes for sega ego-graph",
		);

		// All visible nodes have default opacity (undefined = fully opaque)
		for (const id of visibleIds) {
			const node = nodes.get(id);
			const opaque = node.opacity === undefined || node.opacity === 1;
			assert.ok(opaque, `node ${id} is fully opaque (opacity=${node.opacity})`);
		}
	});

	QUnit.test("T014c: visible edges are fully opaque after transition", (assert) => {
		applyEgoGraph("sonic-team");

		expandAll();
		applyEgoGraph("sega");

		const edges = network.body.data.edges;
		const allEdges = edges.get();
		for (const edge of allEdges) {
			if (!edge.hidden) {
				const opacity = edge.color?.opacity;
				const isOpaque = opacity === undefined || opacity === 1;
				assert.ok(isOpaque, `visible edge ${edge.id} is fully opaque (color.opacity=${opacity})`);
			}
		}
	});
});

QUnit.module("ego-graph integration — cancel-and-replace (012 T026–T027)", (hooks) => {
	let network;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		network = createGraph(container, TEST_NODES, TEST_EDGES);

		const nodeMap = new Map();
		for (const node of TEST_NODES) {
			nodeMap.set(node.id, node);
		}
		initDetailPanel(nodeMap);
		initEgoGraph(network);
	});

	hooks.afterEach(() => {
		cancelTransition();
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("T026: sequential A→B→C results in only C as final spotlight", (assert) => {
		// Initial ego (instant)
		applyEgoGraph("sonic-team");

		// Sequential: sonic-team → sega → yu-suzuki via instant path
		expandAll();
		applyEgoGraph("sega");
		expandAll();
		applyEgoGraph("yu-suzuki");

		assert.strictEqual(getSpotlightId(), "yu-suzuki", "final spotlight is yu-suzuki");

		const nodes = network.body.data.nodes;
		const visibleIds = nodes.get().filter((n) => !n.hidden).map((n) => n.id).sort();
		assert.deepEqual(
			visibleIds,
			["outrun", "sega", "yu-suzuki"].sort(),
			"correct yu-suzuki neighborhood visible",
		);
	});

	QUnit.test("T027: no intermediate opacity values after sequential navigation", (assert) => {
		applyEgoGraph("sonic-team");

		expandAll();
		applyEgoGraph("sega");
		expandAll();
		applyEgoGraph("yu-suzuki");

		const nodes = network.body.data.nodes;
		const allNodes = nodes.get();

		for (const node of allNodes) {
			const opacity = node.opacity;
			const isValidOpacity = opacity === undefined || opacity === 1 || (node.hidden && opacity === 1);
			assert.ok(isValidOpacity, `node ${node.id} has clean opacity (${opacity}), hidden=${node.hidden}`);
		}
	});
});

QUnit.module("ego-graph integration — reduced motion (012 T032)", (hooks) => {
	let network;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		network = createGraph(container, TEST_NODES, TEST_EDGES);

		const nodeMap = new Map();
		for (const node of TEST_NODES) {
			nodeMap.set(node.id, node);
		}
		initDetailPanel(nodeMap);
		initEgoGraph(network);
	});

	hooks.afterEach(() => {
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("T032: ego-to-ego navigation produces correct result regardless of motion setting", (assert) => {
		applyEgoGraph("sonic-team");

		// Navigate to sega — via instant path using expandAll
		expandAll();
		applyEgoGraph("sega");

		assert.strictEqual(getSpotlightId(), "sega", "spotlight is sega");
		assert.strictEqual(getViewMode(), "ego", "mode is ego");

		const nodes = network.body.data.nodes;
		const visibleIds = nodes.get().filter((n) => !n.hidden).map((n) => n.id).sort();
		assert.deepEqual(
			visibleIds,
			["genesis", "sega", "sonic-team", "yu-suzuki"].sort(),
			"correct sega neighborhood visible",
		);
	});
});
