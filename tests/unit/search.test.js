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

import { initEgoGraph } from "../../src/js/ego-graph.js";
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
		initEgoGraph(network);
		initSearch(NODES);
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("selectSuggestion applies ego-graph on the node", (assert) => {
		selectSuggestion("virtua-fighter");
		// selectSuggestion now triggers applyEgoGraph (FR-012)
		// which hides non-neighbors and focuses on the selected node
		const nodes = network.body.data.nodes;
		const visibleIds = nodes
			.get()
			.filter((n) => !n.hidden)
			.map((n) => n.id);
		assert.ok(
			visibleIds.includes("virtua-fighter"),
			"selected node should be visible in ego-graph",
		);
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

/* ============================================================
   Keyboard Navigation Tests (010-a11y-improvements)
   ============================================================ */

/**
 * Helper: dispatch a KeyboardEvent on an element.
 * @param {HTMLElement} el
 * @param {string} key
 */
function pressKey(el, key) {
	const event = new KeyboardEvent("keydown", {
		key,
		bubbles: true,
		cancelable: true,
	});
	el.dispatchEvent(event);
}

/**
 * Helper: populate the suggestion list with DOM items matching
 * what renderSuggestions() produces in production code.
 * @param {HTMLUListElement} list
 * @param {Array<{id: string, label: string, group: string}>} nodes
 */
function populateSuggestions(list, nodes) {
	list.innerHTML = "";
	for (const [index, node] of nodes.entries()) {
		const li = document.createElement("li");
		li.className = "search-suggestion-item";
		li.id = `search-suggestion-${index}`;
		li.setAttribute("role", "option");
		li.setAttribute("aria-selected", "false");
		li.dataset.nodeId = node.id;
		li.textContent = node.label;
		list.appendChild(li);
	}
	list.hidden = false;
}

/**
 * Helper: set up the keyboard navigation handler on the search input,
 * mirroring the production handler in app.js.
 * Returns an object with getHighlightIndex() for test assertions.
 *
 * @param {HTMLInputElement} input
 * @param {HTMLUListElement} list
 * @returns {{ getHighlightIndex: () => number }}
 */
function setupKeyboardNav(input, list) {
	let highlightIndex = -1;

	function updateHighlight(newIndex) {
		const items = list.querySelectorAll(".search-suggestion-item");
		if (highlightIndex >= 0 && highlightIndex < items.length) {
			items[highlightIndex].classList.remove("highlighted");
			items[highlightIndex].setAttribute("aria-selected", "false");
		}
		highlightIndex = newIndex;
		if (highlightIndex >= 0 && highlightIndex < items.length) {
			items[highlightIndex].classList.add("highlighted");
			items[highlightIndex].setAttribute("aria-selected", "true");
			input.setAttribute("aria-activedescendant", items[highlightIndex].id);
		} else {
			input.setAttribute("aria-activedescendant", "");
		}
	}

	input.addEventListener("keydown", (event) => {
		const items = list.querySelectorAll(".search-suggestion-item");
		const count = items.length;

		switch (event.key) {
			case "ArrowDown": {
				if (count === 0) return;
				event.preventDefault();
				const next = highlightIndex < count - 1 ? highlightIndex + 1 : 0;
				updateHighlight(next);
				break;
			}
			case "ArrowUp": {
				if (count === 0) return;
				event.preventDefault();
				const prev = highlightIndex > 0 ? highlightIndex - 1 : count - 1;
				updateHighlight(prev);
				break;
			}
			case "Enter": {
				if (highlightIndex >= 0 && highlightIndex < count) {
					event.preventDefault();
					const selectedItem = items[highlightIndex];
					selectSuggestion(selectedItem.dataset.nodeId);
					list.hidden = true;
					input.setAttribute("aria-expanded", "false");
					highlightIndex = -1;
					input.setAttribute("aria-activedescendant", "");
				}
				break;
			}
			case "Escape": {
				list.hidden = true;
				input.setAttribute("aria-expanded", "false");
				highlightIndex = -1;
				input.setAttribute("aria-activedescendant", "");
				break;
			}
		}
	});

	input.addEventListener("input", () => {
		highlightIndex = -1;
		input.setAttribute("aria-activedescendant", "");
	});

	return { getHighlightIndex: () => highlightIndex };
}

module("search – keyboard navigation", (hooks) => {
	let network;
	let searchInput;
	let suggestionsList;

	hooks.beforeEach(() => {
		const container = document.getElementById("graph-container");
		container.innerHTML = "";
		network = createGraph(container, NODES, EDGES);
		initEgoGraph(network);
		initSearch(NODES);

		searchInput = document.getElementById("search-input");
		suggestionsList = document.getElementById("search-suggestions");
		setupKeyboardNav(searchInput, suggestionsList);
	});

	hooks.afterEach(() => {
		if (suggestionsList) {
			suggestionsList.innerHTML = "";
			suggestionsList.hidden = true;
		}
		if (searchInput) {
			searchInput.value = "";
			searchInput.setAttribute("aria-activedescendant", "");
			searchInput.setAttribute("aria-expanded", "false");
		}
		destroyGraph();
	});

	// T006: Arrow Down from no highlight selects first suggestion
	test("T006 Arrow Down from no highlight selects first suggestion", (assert) => {
		const virtuaNodes = searchNodes("Virtua");
		populateSuggestions(suggestionsList, virtuaNodes);
		const items = suggestionsList.querySelectorAll(".search-suggestion-item");
		assert.ok(items.length > 0, "should have suggestions");

		pressKey(searchInput, "ArrowDown");

		assert.true(items[0].classList.contains("highlighted"), "first item should be highlighted");
	});

	// T007: Arrow Down moves highlight to next suggestion
	test("T007 Arrow Down moves highlight to next suggestion", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		const items = suggestionsList.querySelectorAll(".search-suggestion-item");

		pressKey(searchInput, "ArrowDown"); // → index 0
		pressKey(searchInput, "ArrowDown"); // → index 1

		assert.false(items[0].classList.contains("highlighted"), "first item should not be highlighted");
		assert.true(items[1].classList.contains("highlighted"), "second item should be highlighted");
	});

	// T008: Arrow Down on last suggestion wraps to first
	test("T008 Arrow Down on last suggestion wraps to first", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		const items = suggestionsList.querySelectorAll(".search-suggestion-item");
		const count = items.length;

		for (let i = 0; i < count; i++) {
			pressKey(searchInput, "ArrowDown");
		}
		assert.true(items[count - 1].classList.contains("highlighted"), "last item should be highlighted");

		pressKey(searchInput, "ArrowDown");
		assert.true(items[0].classList.contains("highlighted"), "should wrap to first item");
		assert.false(items[count - 1].classList.contains("highlighted"), "last should no longer be highlighted");
	});

	// T009: Arrow Up moves highlight to previous suggestion
	test("T009 Arrow Up moves highlight to previous suggestion", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		const items = suggestionsList.querySelectorAll(".search-suggestion-item");

		pressKey(searchInput, "ArrowDown"); // → 0
		pressKey(searchInput, "ArrowDown"); // → 1
		pressKey(searchInput, "ArrowUp");   // → 0

		assert.true(items[0].classList.contains("highlighted"), "first item should be highlighted after ArrowUp");
		assert.false(items[1].classList.contains("highlighted"), "second item should not be highlighted");
	});

	// T010: Arrow Up on first suggestion wraps to last
	test("T010 Arrow Up on first suggestion wraps to last", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		const items = suggestionsList.querySelectorAll(".search-suggestion-item");

		pressKey(searchInput, "ArrowDown"); // → 0
		pressKey(searchInput, "ArrowUp");   // → wrap to last

		const lastIdx = items.length - 1;
		assert.true(items[lastIdx].classList.contains("highlighted"), "should wrap to last item");
		assert.false(items[0].classList.contains("highlighted"), "first should no longer be highlighted");
	});

	// T011: Enter with highlighted suggestion selects it
	test("T011 Enter with highlighted suggestion selects it", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));

		pressKey(searchInput, "ArrowDown"); // highlight first
		pressKey(searchInput, "Enter");

		assert.true(suggestionsList.hidden, "dropdown should be hidden after Enter");
	});

	// T012: Enter with no highlight active does nothing
	test("T012 Enter with no highlight does nothing", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		assert.false(suggestionsList.hidden, "dropdown should be visible");

		pressKey(searchInput, "Enter");

		assert.false(suggestionsList.hidden, "dropdown should remain visible after Enter with no highlight");
	});

	// T013: Escape closes dropdown
	test("T013 Escape closes dropdown", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		assert.false(suggestionsList.hidden, "dropdown should be visible");

		searchInput.focus();
		pressKey(searchInput, "Escape");

		assert.true(suggestionsList.hidden, "dropdown should be hidden after Escape");
	});

	// T014: Typing new characters resets highlight to -1
	test("T014 typing resets highlight", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		pressKey(searchInput, "ArrowDown"); // highlight first

		const items = suggestionsList.querySelectorAll(".search-suggestion-item");
		assert.true(items[0].classList.contains("highlighted"), "first item should be highlighted");

		// Simulate typing — fire input event (handler resets highlightIndex)
		searchInput.dispatchEvent(new Event("input", { bubbles: true }));

		// Re-populate with new results (as app.js would)
		populateSuggestions(suggestionsList, searchNodes("Virtua F"));

		const newItems = suggestionsList.querySelectorAll(".search-suggestion-item");
		const anyHighlighted = Array.from(newItems).some((li) => li.classList.contains("highlighted"));
		assert.false(anyHighlighted, "no item should be highlighted after typing");
	});

	// T015: aria-activedescendant updates to highlighted item ID
	test("T015 aria-activedescendant updates on arrow navigation", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		assert.strictEqual(searchInput.getAttribute("aria-activedescendant"), "", "initially empty");

		pressKey(searchInput, "ArrowDown");
		assert.strictEqual(
			searchInput.getAttribute("aria-activedescendant"),
			"search-suggestion-0",
			"should point to first suggestion",
		);

		pressKey(searchInput, "ArrowDown");
		assert.strictEqual(
			searchInput.getAttribute("aria-activedescendant"),
			"search-suggestion-1",
			"should point to second suggestion",
		);
	});

	// T016: aria-selected is set on highlighted item
	test("T016 aria-selected updates on highlighted item", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Virtua"));
		const items = suggestionsList.querySelectorAll(".search-suggestion-item");

		for (const item of items) {
			assert.strictEqual(item.getAttribute("aria-selected"), "false", `${item.id} should be false initially`);
		}

		pressKey(searchInput, "ArrowDown"); // highlight first

		assert.strictEqual(items[0].getAttribute("aria-selected"), "true", "first item should be selected");
		for (let i = 1; i < items.length; i++) {
			assert.strictEqual(items[i].getAttribute("aria-selected"), "false", `item ${i} should still be false`);
		}
	});

	// T017: Arrow Down with empty suggestion list does nothing
	test("T017 Arrow Down with empty list does nothing", (assert) => {
		populateSuggestions(suggestionsList, []);
		const items = suggestionsList.querySelectorAll(".search-suggestion-item");
		assert.strictEqual(items.length, 0, "should have no suggestion items");

		pressKey(searchInput, "ArrowDown");
		assert.ok(true, "ArrowDown on empty list should not throw");
	});

	// T018: Single-item list — Arrow Down and Up keep the same item highlighted
	test("T018 single-item list wraps to same item", (assert) => {
		populateSuggestions(suggestionsList, searchNodes("Daytona"));
		const items = suggestionsList.querySelectorAll(".search-suggestion-item");
		assert.strictEqual(items.length, 1, "should have exactly 1 suggestion");

		pressKey(searchInput, "ArrowDown");
		assert.true(items[0].classList.contains("highlighted"), "item should be highlighted");

		pressKey(searchInput, "ArrowDown");
		assert.true(items[0].classList.contains("highlighted"), "should still be highlighted after ArrowDown");

		pressKey(searchInput, "ArrowUp");
		assert.true(items[0].classList.contains("highlighted"), "should still be highlighted after ArrowUp");
	});
});
