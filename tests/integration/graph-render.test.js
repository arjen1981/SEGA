/**
 * Integration test for graph rendering.
 *
 * Tests cover:
 * - Fetching nodes.json and edges.json from src/data/
 * - Initializing the graph with real data
 * - Verifying node count matches data files
 * - Verifying SEGA root node exists
 * - Verifying all edge labels are present
 *
 * Constitution Principle III: These tests are written FIRST and MUST FAIL
 * before any implementation exists.
 */

import { createGraph, destroyGraph } from "../../src/js/graph.js";

const { module, test } = QUnit;

/**
 * Helper: fetch JSON data from the data directory.
 * In integration tests we use a path relative to where the test runner
 * is served from (tests/index.html → ../src/data/).
 */
async function fetchData(path) {
	const response = await fetch(path);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${path}: ${response.status}`);
	}
	return response.json();
}

module("integration – graph rendering", (hooks) => {
	let container;
	let nodesData;
	let edgesData;

	hooks.before(async () => {
		nodesData = await fetchData("../src/data/nodes.json");
		edgesData = await fetchData("../src/data/edges.json");
	});

	hooks.beforeEach(() => {
		container = document.getElementById("graph-container");
		container.innerHTML = "";
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("nodes.json contains at least 50 nodes", (assert) => {
		assert.ok(nodesData.length >= 50, `should have ≥ 50 nodes, got ${nodesData.length}`);
	});

	test("edges.json contains at least 50 edges", (assert) => {
		assert.ok(edgesData.length >= 50, `should have ≥ 50 edges, got ${edgesData.length}`);
	});

	test("graph initializes with all data nodes", (assert) => {
		const network = createGraph(container, nodesData, edgesData);
		const nodeIds = network.body.data.nodes.getIds();
		assert.strictEqual(
			nodeIds.length,
			nodesData.length,
			`network should have ${nodesData.length} nodes`,
		);
	});

	test("graph initializes with all data edges", (assert) => {
		const network = createGraph(container, nodesData, edgesData);
		const edgeIds = network.body.data.edges.getIds();
		assert.strictEqual(
			edgeIds.length,
			edgesData.length,
			`network should have ${edgesData.length} edges`,
		);
	});

	test("SEGA root node exists in the graph", (assert) => {
		const network = createGraph(container, nodesData, edgesData);
		const segaNode = network.body.data.nodes.get("sega");
		assert.ok(segaNode, "SEGA node should exist");
		assert.strictEqual(segaNode.group, "company", "SEGA should be in the company group");
	});

	test("all five node groups are represented", (assert) => {
		const groups = new Set(nodesData.map((n) => n.group));
		const expected = ["company", "studio", "platform", "game", "creator"];
		for (const g of expected) {
			assert.ok(groups.has(g), `group "${g}" should be present in data`);
		}
	});

	test("all edge labels are valid relationship types", (assert) => {
		const validLabels = new Set([
			"division of",
			"developed by",
			"runs on",
			"worked at",
			"created",
			"directed",
			"produced",
			"designed",
			"programmed",
			"composed for",
			"artwork for",
		]);
		for (const edge of edgesData) {
			assert.ok(
				validLabels.has(edge.label),
				`edge "${edge.from}" → "${edge.to}" should have valid label, got "${edge.label}"`,
			);
		}
	});

	test("every edge references existing nodes", (assert) => {
		const nodeIds = new Set(nodesData.map((n) => n.id));
		for (const edge of edgesData) {
			assert.ok(nodeIds.has(edge.from), `edge source "${edge.from}" should exist in nodes`);
			assert.ok(nodeIds.has(edge.to), `edge target "${edge.to}" should exist in nodes`);
		}
	});

	test("graph renders without throwing", (assert) => {
		assert.expect(1);
		try {
			createGraph(container, nodesData, edgesData);
			assert.ok(true, "graph created successfully");
		} catch (err) {
			assert.ok(false, `graph creation threw: ${err.message}`);
		}
	});
});
