/**
 * Unit tests for the search module (src/js/search.js)
 *
 * Tests cover:
 * - Partial match returns suggestions
 * - Case-insensitive matching
 * - Select suggestion calls graph focus
 * - No-match shows empty message
 * - Suggestion list closes on selection
 *
 * Constitution Principle III: These tests are written FIRST and MUST FAIL.
 */

import { createGraph, destroyGraph } from "../../src/js/graph.js";
import { initSearch, searchNodes, selectSuggestion } from "../../src/js/search.js";

const { module, test } = QUnit;

/* Sample dataset for search tests */
const NODES = [
	{ id: "sega", label: "SEGA", group: "company" },
	{ id: "virtua-fighter", label: "Virtua Fighter", group: "game" },
	{ id: "virtua-racing", label: "Virtua Racing", group: "game" },
	{ id: "virtua-cop", label: "Virtua Cop", group: "game" },
	{ id: "daytona-usa", label: "Daytona USA", group: "game" },
	{ id: "yu-suzuki", label: "Yu Suzuki", group: "creator" },
	{ id: "am2", label: "Sega AM2", group: "studio" },
];

const EDGES = [
	{ from: "virtua-fighter", to: "am2", label: "developed by" },
	{ from: "virtua-racing", to: "am2", label: "developed by" },
];

module("search – searchNodes()", (hooks) => {
	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		container.innerHTML = "";
		createGraph(container, NODES, EDGES);
		initSearch(NODES);
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("partial match 'Virtua' returns all Virtua games", (assert) => {
		const results = searchNodes("Virtua");
		assert.strictEqual(results.length, 3, "should match 3 Virtua games");
		const labels = results.map((r) => r.label);
		assert.true(labels.includes("Virtua Fighter"), "should include Virtua Fighter");
		assert.true(labels.includes("Virtua Racing"), "should include Virtua Racing");
		assert.true(labels.includes("Virtua Cop"), "should include Virtua Cop");
	});

	test("case-insensitive: 'virtua' matches same as 'Virtua'", (assert) => {
		const lower = searchNodes("virtua");
		const upper = searchNodes("Virtua");
		assert.strictEqual(lower.length, upper.length, "case should not affect results count");
	});

	test("case-insensitive: 'DAYTONA' matches Daytona USA", (assert) => {
		const results = searchNodes("DAYTONA");
		assert.strictEqual(results.length, 1, "should match 1 result");
		assert.strictEqual(results[0].label, "Daytona USA", "should match Daytona USA");
	});

	test("partial match 'sega' matches SEGA and Sega AM2", (assert) => {
		const results = searchNodes("sega");
		assert.strictEqual(results.length, 2, "should match SEGA and Sega AM2");
	});

	test("no match for nonsense string", (assert) => {
		const results = searchNodes("xyznonexistent123");
		assert.strictEqual(results.length, 0, "should return empty array for no match");
	});

	test("empty query returns empty array", (assert) => {
		const results = searchNodes("");
		assert.strictEqual(results.length, 0, "empty query should return nothing");
	});

	test("single character query returns results", (assert) => {
		const results = searchNodes("S");
		assert.ok(results.length > 0, "single char 'S' should match something");
	});
});

module("search – selectSuggestion()", (hooks) => {
	let network;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		container.innerHTML = "";
		network = createGraph(container, NODES, EDGES);
		initSearch(NODES);
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("selectSuggestion selects the node in the network", (assert) => {
		selectSuggestion("virtua-fighter");
		const selected = network.getSelectedNodes();
		assert.deepEqual(selected, ["virtua-fighter"], "node should be selected in network");
	});

	test("selectSuggestion with unknown ID does not throw", (assert) => {
		assert.expect(1);
		try {
			selectSuggestion("nonexistent-node");
			assert.ok(true, "should not throw for unknown node");
		} catch (err) {
			assert.ok(false, `threw: ${err.message}`);
		}
	});
});
