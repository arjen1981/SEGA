/**
 * Unit tests for the filters module (src/js/filters.js)
 *
 * Tests cover:
 * - Toggle single category hides nodes
 * - Toggle hides connected edges
 * - Multiple toggles combine correctly
 * - SEGA company node is always visible
 * - Re-enabling restores nodes and edges
 *
 * Constitution Principle III: These tests are written FIRST and MUST FAIL.
 */

import { getVisibleGroups, initFilters, toggleGroup } from "../../src/js/filters.js";
import { createGraph, destroyGraph } from "../../src/js/graph.js";

const { module, test } = QUnit;

/* Sample dataset for filter tests */
const NODES = [
	{ id: "sega", label: "SEGA", group: "company" },
	{ id: "am2", label: "AM2", group: "studio" },
	{ id: "naomi", label: "NAOMI", group: "platform" },
	{ id: "virtua-fighter", label: "Virtua Fighter", group: "game" },
	{ id: "yu-suzuki", label: "Yu Suzuki", group: "creator" },
];

const EDGES = [
	{ from: "am2", to: "sega", label: "division of" },
	{ from: "virtua-fighter", to: "am2", label: "developed by" },
	{ from: "virtua-fighter", to: "naomi", label: "runs on" },
	{ from: "yu-suzuki", to: "am2", label: "worked at" },
	{ from: "yu-suzuki", to: "virtua-fighter", label: "created" },
];

module("filters – toggle visibility", (hooks) => {
	let container;
	let network;

	hooks.beforeEach(() => {
		container = document.getElementById("graph-container");
		container.innerHTML = "";
		network = createGraph(container, NODES, EDGES);
		initFilters(network);
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("all groups visible by default", (assert) => {
		const visible = getVisibleGroups();
		assert.deepEqual(
			visible.sort(),
			["company", "creator", "game", "platform", "studio"],
			"all 5 groups should be visible initially",
		);
	});

	test("toggling games hides game nodes", (assert) => {
		toggleGroup("game", false);
		const nodeIds = network.body.data.nodes.getIds({
			filter: (item) => !item.hidden,
		});
		assert.false(nodeIds.includes("virtua-fighter"), "game node should be hidden");
		assert.true(nodeIds.includes("sega"), "SEGA should remain visible");
		assert.true(nodeIds.includes("am2"), "studio should remain visible");
	});

	test("toggling games hides edges to game nodes", (assert) => {
		toggleGroup("game", false);
		const visibleEdges = network.body.data.edges.get({
			filter: (item) => !item.hidden,
		});
		const edgeTargetsAndSources = visibleEdges.flatMap((e) => [e.from, e.to]);
		assert.false(
			edgeTargetsAndSources.includes("virtua-fighter"),
			"no visible edge should reference hidden game node",
		);
	});

	test("re-enabling games restores game nodes", (assert) => {
		toggleGroup("game", false);
		toggleGroup("game", true);
		const nodeIds = network.body.data.nodes.getIds({
			filter: (item) => !item.hidden,
		});
		assert.true(nodeIds.includes("virtua-fighter"), "game node should be visible again");
	});

	test("re-enabling games restores edges", (assert) => {
		toggleGroup("game", false);
		toggleGroup("game", true);
		const visibleEdges = network.body.data.edges.get({
			filter: (item) => !item.hidden,
		});
		assert.ok(visibleEdges.length >= 4, "edges should be restored");
	});

	test("SEGA company node is always visible regardless of toggles", (assert) => {
		toggleGroup("studio", false);
		toggleGroup("platform", false);
		toggleGroup("game", false);
		toggleGroup("creator", false);

		const nodeIds = network.body.data.nodes.getIds({
			filter: (item) => !item.hidden,
		});
		assert.true(nodeIds.includes("sega"), "SEGA must always be visible");
	});

	test("multiple toggles combine: only studios and SEGA visible", (assert) => {
		toggleGroup("platform", false);
		toggleGroup("game", false);
		toggleGroup("creator", false);

		const nodeIds = network.body.data.nodes.getIds({
			filter: (item) => !item.hidden,
		});
		assert.true(nodeIds.includes("sega"), "SEGA should be visible");
		assert.true(nodeIds.includes("am2"), "studio should be visible");
		assert.false(nodeIds.includes("naomi"), "platform should be hidden");
		assert.false(nodeIds.includes("virtua-fighter"), "game should be hidden");
		assert.false(nodeIds.includes("yu-suzuki"), "creator should be hidden");
	});

	test("getVisibleGroups reflects current filter state", (assert) => {
		toggleGroup("game", false);
		toggleGroup("creator", false);
		const visible = getVisibleGroups();
		assert.true(visible.includes("company"), "company should be visible");
		assert.true(visible.includes("studio"), "studio should be visible");
		assert.true(visible.includes("platform"), "platform should be visible");
		assert.false(visible.includes("game"), "game should not be visible");
		assert.false(visible.includes("creator"), "creator should not be visible");
	});
});
