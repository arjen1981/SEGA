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
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("click neighbor → new ego-graph centered on clicked node", (assert) => {
		// Start with sonic-team spotlight
		applyEgoGraph("sonic-team");
		openDetailPanel("sonic-team");

		assert.strictEqual(getSpotlightId(), "sonic-team", "initial spotlight is sonic-team");

		// User clicks on "sonic" (a visible neighbor)
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
		// Start at sega (unlikely in real use but valid for testing)
		applyEgoGraph("sega");
		assert.strictEqual(getSpotlightId(), "sega");

		// Navigate to sonic-team
		applyEgoGraph("sonic-team");
		assert.strictEqual(getSpotlightId(), "sonic-team");

		// Navigate to sonic
		applyEgoGraph("sonic");
		assert.strictEqual(getSpotlightId(), "sonic");

		// Verify each navigation updates the visible set
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
		closeDetailPanel();
		destroyGraph();
	});

	QUnit.test("T016: rapid sequential navigation applies only final spotlight", (assert) => {
		// Simulate rapid clicks through 3 nodes
		applyEgoGraph("sonic-team");
		applyEgoGraph("sega");
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
