/**
 * Unit tests for the ego-graph module.
 *
 * T004: pickRandomSpotlight tests (FR-001, FR-009)
 * T005: Neighborhood computation tests (FR-003)
 * T006: getViewMode / getSpotlightId tests (mode transitions)
 * T010: applyEgoGraph tests (US1)
 * T015: Ego-graph navigation tests (US2)
 * T019: expandAll tests (US3)
 *
 * @module ego-graph.test
 */

import {
	applyEgoGraph,
	expandAll,
	getSpotlightId,
	getViewMode,
	initEgoGraph,
	pickRandomSpotlight,
} from "../../src/js/ego-graph.js";
import { createGraph, destroyGraph, getNetwork } from "../../src/js/graph.js";

/* ============================================================
   Test data — small graph for predictable assertions
   ============================================================ */

/**
 * Minimal graph:
 *   company (SEGA) ── studio (Sonic Team) ── game (Sonic)
 *                   └─ platform (Genesis)
 *                   └─ creator (Yu Suzuki) ── game (OutRun)
 *
 * company node should never be picked by pickRandomSpotlight.
 */
const TEST_NODES = [
	{ id: "sega", label: "SEGA", group: "company" },
	{ id: "sonic-team", label: "Sonic Team", group: "studio" },
	{ id: "genesis", label: "Genesis", group: "platform" },
	{ id: "sonic", label: "Sonic the Hedgehog", group: "game" },
	{ id: "yu-suzuki", label: "Yu Suzuki", group: "creator" },
	{ id: "outrun", label: "OutRun", group: "game" },
];

const TEST_EDGES = [
	{ id: "e1", from: "sega", to: "sonic-team" },
	{ id: "e2", from: "sega", to: "genesis" },
	{ id: "e3", from: "sonic-team", to: "sonic" },
	{ id: "e4", from: "sega", to: "yu-suzuki" },
	{ id: "e5", from: "yu-suzuki", to: "outrun" },
];

/* ============================================================
   Helpers
   ============================================================ */

function setupGraph() {
	const container = document.getElementById("graph-container");
	const network = createGraph(container, TEST_NODES, TEST_EDGES);
	initEgoGraph(network);
	return network;
}

function teardownGraph() {
	destroyGraph();
}

/* ============================================================
   T004: pickRandomSpotlight (FR-001, FR-009)
   ============================================================ */

QUnit.module("ego-graph — pickRandomSpotlight", () => {
	QUnit.test("returns a non-company node ID", (assert) => {
		const id = pickRandomSpotlight(TEST_NODES);
		assert.ok(id, "returns a truthy node ID");

		const node = TEST_NODES.find((n) => n.id === id);
		assert.ok(node, "returned ID exists in nodes array");
		assert.notEqual(node.group, "company", "returned node is not a company");
	});

	QUnit.test("never returns a company node over 100 iterations", (assert) => {
		const companyIds = TEST_NODES.filter((n) => n.group === "company").map((n) => n.id);

		for (let i = 0; i < 100; i++) {
			const id = pickRandomSpotlight(TEST_NODES);
			assert.false(companyIds.includes(id), `iteration ${i}: ${id} is not a company node`);
		}
	});

	QUnit.test("returns different nodes across multiple calls (probabilistic)", (assert) => {
		const results = new Set();
		for (let i = 0; i < 50; i++) {
			results.add(pickRandomSpotlight(TEST_NODES));
		}
		assert.ok(results.size > 1, `got ${results.size} distinct results (expected > 1)`);
	});
});

/* ============================================================
   T005: Neighborhood computation via applyEgoGraph (FR-003)
   ============================================================ */

QUnit.module("ego-graph — neighborhood computation", (hooks) => {
	hooks.beforeEach(() => {
		setupGraph();
	});

	hooks.afterEach(() => {
		teardownGraph();
	});

	QUnit.test("applyEgoGraph shows only spotlight + direct neighbors", (assert) => {
		// Spotlight on "sonic-team": neighbors are sega (e1) and sonic (e3)
		applyEgoGraph("sonic-team");
		const network = getNetwork();
		const nodes = network.body.data.nodes;

		const visibleIds = nodes
			.get()
			.filter((n) => !n.hidden)
			.map((n) => n.id);
		assert.deepEqual(
			visibleIds.sort(),
			["sega", "sonic", "sonic-team"].sort(),
			"only spotlight + direct neighbors are visible",
		);
	});

	QUnit.test("hidden nodes have physics disabled", (assert) => {
		applyEgoGraph("sonic-team");
		const network = getNetwork();
		const nodes = network.body.data.nodes;

		const hiddenNodes = nodes.get().filter((n) => n.hidden);
		for (const node of hiddenNodes) {
			assert.strictEqual(node.physics, false, `hidden node ${node.id} has physics: false`);
		}
	});

	QUnit.test("edges with hidden endpoints are hidden", (assert) => {
		applyEgoGraph("sonic-team");
		const network = getNetwork();
		const edges = network.body.data.edges;

		// e4 (sega→yu-suzuki): yu-suzuki is hidden → edge hidden
		const e4 = edges.get("e4");
		assert.true(e4.hidden, "edge e4 (sega→yu-suzuki) is hidden because yu-suzuki is hidden");

		// e5 (yu-suzuki→outrun): both hidden → edge hidden
		const e5 = edges.get("e5");
		assert.true(e5.hidden, "edge e5 (yu-suzuki→outrun) is hidden");

		// e1 (sega→sonic-team): both visible → edge not hidden
		const e1 = edges.get("e1");
		assert.false(e1.hidden, "edge e1 (sega→sonic-team) is visible");
	});

	QUnit.test("spotlight on leaf node shows only it and its parent", (assert) => {
		// "sonic" connects to sonic-team only (via e3)
		applyEgoGraph("sonic");
		const network = getNetwork();
		const nodes = network.body.data.nodes;

		const visibleIds = nodes
			.get()
			.filter((n) => !n.hidden)
			.map((n) => n.id);
		assert.deepEqual(
			visibleIds.sort(),
			["sonic", "sonic-team"].sort(),
			"leaf spotlight shows only itself and connected parent",
		);
	});
});

/* ============================================================
   T006: getViewMode / getSpotlightId (mode transitions)
   ============================================================ */

QUnit.module("ego-graph — view mode state", (hooks) => {
	hooks.beforeEach(() => {
		setupGraph();
	});

	hooks.afterEach(() => {
		teardownGraph();
	});

	QUnit.test("initial mode after initEgoGraph is 'ego' pending first apply", (assert) => {
		// After init but before applyEgoGraph, mode should be "ego"
		assert.strictEqual(getViewMode(), "ego", "default mode is ego");
	});

	QUnit.test("applyEgoGraph sets mode to ego with spotlightId", (assert) => {
		applyEgoGraph("sonic-team");
		assert.strictEqual(getViewMode(), "ego", "mode is ego after applyEgoGraph");
		assert.strictEqual(getSpotlightId(), "sonic-team", "spotlightId matches applied node");
	});

	QUnit.test("expandAll sets mode to full with null spotlightId", (assert) => {
		applyEgoGraph("sonic-team");
		expandAll();
		assert.strictEqual(getViewMode(), "full", "mode is full after expandAll");
		assert.strictEqual(getSpotlightId(), null, "spotlightId is null in full mode");
	});

	QUnit.test("applyEgoGraph after expandAll returns to ego mode", (assert) => {
		applyEgoGraph("sonic-team");
		expandAll();
		applyEgoGraph("genesis");
		assert.strictEqual(getViewMode(), "ego", "mode returns to ego");
		assert.strictEqual(getSpotlightId(), "genesis", "spotlightId updated to new node");
	});
});
