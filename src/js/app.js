/**
 * Application bootstrap — entry point for the SEGA Arcade Graph.
 *
 * Responsibilities:
 * 1. Fetch nodes.json and edges.json
 * 2. Initialize the graph via graph.js
 * 3. Hide the loading spinner on success
 * 4. Display user-visible error on fetch failure
 *
 * @module app
 */

import { closeDetailPanel, initDetailPanel, openDetailPanel } from "./detail-panel.js";
import {
	applyEgoGraph,
	expandAll,
	getViewMode,
	initEgoGraph,
	pickRandomSpotlight,
} from "./ego-graph.js";
import { initFilters, toggleGroup } from "./filters.js";
import { createGraph } from "./graph.js";
import { initSearch, searchNodes, selectSuggestion } from "./search.js";

/** Base path for data files (relative to index.html) */
const DATA_BASE = "data";

/**
 * Fetch and parse a JSON file from the data directory.
 * @param {string} filename — name of the JSON file (e.g., "nodes.json")
 * @returns {Promise<Array>} parsed JSON array
 */
async function fetchJSON(filename) {
	const response = await fetch(`${DATA_BASE}/${filename}`);
	if (!response.ok) {
		throw new Error(`Failed to load ${filename} (HTTP ${response.status})`);
	}
	return response.json();
}

/**
 * Show an error message to the user inside the graph container.
 * @param {HTMLElement} container
 * @param {string} message
 */
function showError(container, message) {
	container.innerHTML = `
		<div class="error-message" role="alert">
			<h2>Unable to load graph</h2>
			<p>${message}</p>
			<p>Try refreshing the page. If the problem persists, check that the data files are available.</p>
		</div>
	`;
}

/**
 * Hide the loading spinner element.
 */
function hideSpinner() {
	const spinner = document.getElementById("loading-spinner");
	if (spinner) {
		spinner.hidden = true;
	}
}

/**
 * Main initialization — called when the DOM is ready.
 */
async function init() {
	const container = document.getElementById("graph-container");
	if (!container) {
		console.error("Graph container element #graph-container not found");
		return;
	}

	try {
		// Fetch both data files in parallel
		const [nodesData, edgesData] = await Promise.all([
			fetchJSON("nodes.json"),
			fetchJSON("edges.json"),
		]);

		// T032: Disambiguate duplicate display names
		disambiguateLabels(nodesData);

		// Initialize the graph
		const network = createGraph(container, nodesData, edgesData);

		// Build node lookup map and initialize detail panel
		const nodeMap = new Map();
		for (const node of nodesData) {
			nodeMap.set(node.id, node);
		}
		initDetailPanel(nodeMap);

		// Initialize ego-graph module
		initEgoGraph(network);

		// DOM references for ego-graph UI
		const expandAllBtn = document.getElementById("expand-all-btn");
		const filterToolbar = document.getElementById("filter-toolbar");

		// Wire node click → ego-graph or detail panel based on mode
		network.on("selectNode", (params) => {
			if (params.nodes.length > 0) {
				const clickedId = params.nodes[0];
				if (getViewMode() === "full") {
					// FR-008: Click node in full mode → ego mode
					applyEgoGraph(clickedId);
					openDetailPanel(clickedId);
					if (filterToolbar) filterToolbar.classList.add("hidden");
					if (expandAllBtn) expandAllBtn.hidden = false;
				} else {
					// FR-005: Click neighbor in ego mode → new spotlight
					applyEgoGraph(clickedId);
					openDetailPanel(clickedId);
				}
			}
		});

		// Wire deselect → close detail panel
		network.on("deselectNode", () => {
			closeDetailPanel();
		});

		// Initialize filters module
		initFilters(network);

		// Wire filter toolbar checkboxes
		if (filterToolbar) {
			filterToolbar.addEventListener("change", (event) => {
				const checkbox = event.target;
				if (checkbox.dataset.group) {
					toggleGroup(checkbox.dataset.group, checkbox.checked);
				}
			});
		}

		// Initialize search module
		initSearch(nodesData);

		// Wire search input → autocomplete suggestions
		const searchInput = document.getElementById("search-input");
		const suggestionsList = document.getElementById("search-suggestions");

		if (searchInput && suggestionsList) {
			searchInput.addEventListener("input", () => {
				const query = searchInput.value.trim();
				const results = searchNodes(query);
				renderSuggestions(suggestionsList, results);
			});

			// Close suggestions when clicking outside
			document.addEventListener("click", (event) => {
				if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
					suggestionsList.hidden = true;
				}
			});

			// Handle keyboard navigation in suggestions
			searchInput.addEventListener("keydown", (event) => {
				if (event.key === "Escape") {
					suggestionsList.hidden = true;
					searchInput.blur();
				}
			});
		}

		// Wire "Expand All" button (FR-007)
		if (expandAllBtn) {
			expandAllBtn.addEventListener("click", () => {
				expandAll();
				closeDetailPanel();
				if (filterToolbar) filterToolbar.classList.remove("hidden");
				expandAllBtn.hidden = true;
			});

			// T026: Keyboard support for Expand All button
			expandAllBtn.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					expandAllBtn.click();
				}
			});
		}

		// Hide spinner once physics stabilization completes, then apply ego-graph
		network.once("stabilizationIterationsDone", () => {
			hideSpinner();

			// Apply ego-graph spotlight on initial load (FR-001)
			const spotlightNodeId = pickRandomSpotlight(nodesData);
			applyEgoGraph(spotlightNodeId);
			openDetailPanel(spotlightNodeId);

			// FR-011: Hide filter toolbar in ego mode
			if (filterToolbar) filterToolbar.classList.add("hidden");
			// FR-015: Show Expand All button in ego mode
			if (expandAllBtn) expandAllBtn.hidden = false;
		});

		// Safety fallback: hide spinner after stabilization finishes completely
		network.once("stabilized", () => {
			hideSpinner();
		});
	} catch (error) {
		console.error("Failed to initialize graph:", error);
		hideSpinner();
		showError(container, error.message);
	}
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}

/**
 * Render search suggestion items into the dropdown list.
 * @param {HTMLUListElement} list
 * @param {Array<{id: string, label: string, group: string}>} results
 */
function renderSuggestions(list, results) {
	list.innerHTML = "";

	if (results.length === 0) {
		const searchInput = document.getElementById("search-input");
		if (searchInput && searchInput.value.trim() !== "") {
			const li = document.createElement("li");
			li.className = "search-no-results";
			li.textContent = "No results found";
			list.appendChild(li);
			list.hidden = false;
		} else {
			list.hidden = true;
		}
		return;
	}

	for (const node of results.slice(0, 10)) {
		const li = document.createElement("li");
		li.className = "search-suggestion-item";
		li.setAttribute("role", "option");
		li.dataset.nodeId = node.id;
		li.innerHTML = `
			<span class="suggestion-swatch badge-${node.group}"></span>
			<span class="suggestion-label">${escapeHtml(node.label)}</span>
			<span class="suggestion-group">${escapeHtml(node.group)}</span>
		`;
		li.addEventListener("click", () => {
			selectSuggestion(node.id);
			openDetailPanel(node.id);
			// Ensure ego-mode UI state when search triggers ego-graph (FR-012)
			const filterToolbar = document.getElementById("filter-toolbar");
			const expandAllBtn = document.getElementById("expand-all-btn");
			if (filterToolbar) filterToolbar.classList.add("hidden");
			if (expandAllBtn) expandAllBtn.hidden = false;
			list.hidden = true;
			document.getElementById("search-input").value = node.label;
		});
		list.appendChild(li);
	}

	list.hidden = false;
}

/**
 * Escape HTML special characters.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}

/**
 * T032: Disambiguate duplicate display names.
 * When two or more nodes share the same label, append the group type
 * in parentheses, e.g. "Sonic Team (Studio)".
 *
 * @param {Array} nodesData — array of node objects (mutated in place)
 */
function disambiguateLabels(nodesData) {
	// Count occurrences of each label
	const labelCounts = new Map();
	for (const node of nodesData) {
		const lower = node.label.toLowerCase();
		labelCounts.set(lower, (labelCounts.get(lower) || 0) + 1);
	}

	// Append group type for duplicates
	for (const node of nodesData) {
		const lower = node.label.toLowerCase();
		if (labelCounts.get(lower) > 1) {
			const groupLabel = node.group.charAt(0).toUpperCase() + node.group.slice(1);
			node.label = `${node.label} (${groupLabel})`;
		}
	}
}
