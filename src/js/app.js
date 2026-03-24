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

import { clearHash, initDeepLink, updateHash } from "./deep-link.js";
import { closeDetailPanel, initDetailPanel, openDetailPanel } from "./detail-panel.js";
import { applyEgoGraph, getViewMode, initEgoGraph, pickRandomSpotlight } from "./ego-graph.js";
import { initFilters, toggleGroup } from "./filters.js";
import { createGraph } from "./graph.js";
import { assignNodeIcons, getIconDataUri } from "./icons.js";
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
 * Show a transient toast notification that auto-dismisses after 4 seconds.
 * @param {string} message — plain-text message to display
 */
function showToast(message) {
	let container = document.getElementById("toast-container");
	if (!container) {
		container = document.createElement("div");
		container.id = "toast-container";
		container.className = "toast-container";
		container.setAttribute("role", "status");
		container.setAttribute("aria-live", "polite");
		document.body.appendChild(container);
	}
	const toast = document.createElement("div");
	toast.className = "toast";
	toast.textContent = message;
	container.appendChild(toast);
	setTimeout(() => {
		toast.classList.add("fade-out");
		toast.addEventListener("transitionend", () => toast.remove());
	}, 4000);
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

		// 003: Assign retro SVG icons to each node based on group/gender
		assignNodeIcons(nodesData);

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

		// Initialize deep-link module (011: URL-based deep linking)
		const { initialNodeId } = initDeepLink(nodeMap, {
			onNavigate: (nodeId) => {
				if (nodeId === null) {
					closeDetailPanel();
					return;
				}
				applyEgoGraph(nodeId);
				openDetailPanel(nodeId);
				const ft = document.getElementById("filter-toolbar");
				if (ft) ft.classList.add("hidden");
			},
			onInvalidNode: (nodeId) => {
				showToast(`Node "${nodeId}" was not found`);
			},
		});

		// DOM references for ego-graph UI
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
				} else {
					// FR-005: Click neighbor in ego mode → new spotlight
					applyEgoGraph(clickedId);
					openDetailPanel(clickedId);
				}
				// 011: Update URL hash on node selection
				updateHash(clickedId);
			}
		});

		// Wire deselect → close detail panel
		network.on("deselectNode", () => {
			closeDetailPanel();
			// 011: Clear URL hash on deselection
			clearHash();
		});

		// Initialize filters module
		initFilters(network);

		// 003: Assign retro SVG icons to legend and filter swatches
		initSwatchIcons();

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
			/** Index of the currently highlighted suggestion (-1 = none) */
			let highlightIndex = -1;

			/**
			 * Update the visual highlight and ARIA state for the suggestion list.
			 * @param {number} newIndex — new highlight index (-1 to clear)
			 */
			function updateHighlight(newIndex) {
				const items = suggestionsList.querySelectorAll(".search-suggestion-item");
				// Remove previous highlight
				if (highlightIndex >= 0 && highlightIndex < items.length) {
					items[highlightIndex].classList.remove("highlighted");
					items[highlightIndex].setAttribute("aria-selected", "false");
				}
				highlightIndex = newIndex;
				if (highlightIndex >= 0 && highlightIndex < items.length) {
					items[highlightIndex].classList.add("highlighted");
					items[highlightIndex].setAttribute("aria-selected", "true");
					searchInput.setAttribute("aria-activedescendant", items[highlightIndex].id);
					// Scroll into view if needed
					items[highlightIndex].scrollIntoView({ block: "nearest" });
				} else {
					searchInput.setAttribute("aria-activedescendant", "");
				}
			}

			searchInput.addEventListener("input", () => {
				highlightIndex = -1;
				searchInput.setAttribute("aria-activedescendant", "");
				const query = searchInput.value.trim();
				const results = searchNodes(query);
				renderSuggestions(suggestionsList, results);
			});

			// Close suggestions when clicking outside
			document.addEventListener("click", (event) => {
				if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
					suggestionsList.hidden = true;
					searchInput.setAttribute("aria-expanded", "false");
					highlightIndex = -1;
					searchInput.setAttribute("aria-activedescendant", "");
				}
			});

			// Handle keyboard navigation in suggestions
			searchInput.addEventListener("keydown", (event) => {
				const items = suggestionsList.querySelectorAll(".search-suggestion-item");
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
							const nodeId = selectedItem.dataset.nodeId;
							selectSuggestion(nodeId);
							openDetailPanel(nodeId);
							const filterToolbar = document.getElementById("filter-toolbar");
							if (filterToolbar) filterToolbar.classList.add("hidden");
							suggestionsList.hidden = true;
							searchInput.setAttribute("aria-expanded", "false");
							searchInput.value = selectedItem.querySelector(".suggestion-label").textContent;
							highlightIndex = -1;
							searchInput.setAttribute("aria-activedescendant", "");
						}
						break;
					}
					case "Escape": {
						suggestionsList.hidden = true;
						searchInput.setAttribute("aria-expanded", "false");
						highlightIndex = -1;
						searchInput.setAttribute("aria-activedescendant", "");
						break;
					}
				}
			});
		}

		// Hide spinner once physics stabilization completes, then apply ego-graph
		network.once("stabilizationIterationsDone", () => {
			hideSpinner();

			// 011: Use deep-link node if present, otherwise random spotlight
			const spotlightNodeId = initialNodeId || pickRandomSpotlight(nodesData);
			applyEgoGraph(spotlightNodeId);
			openDetailPanel(spotlightNodeId);
			if (!initialNodeId) {
				// Only update hash for deep-linked nodes (random spotlight gets no hash)
			} else {
				updateHash(spotlightNodeId);
			}

			// FR-011: Hide filter toolbar in ego mode
			if (filterToolbar) filterToolbar.classList.add("hidden");
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

	const searchInput = document.getElementById("search-input");

	if (results.length === 0) {
		if (searchInput && searchInput.value.trim() !== "") {
			const li = document.createElement("li");
			li.className = "search-no-results";
			li.textContent = "No results found";
			list.appendChild(li);
			list.hidden = false;
			if (searchInput) searchInput.setAttribute("aria-expanded", "true");
		} else {
			list.hidden = true;
			if (searchInput) searchInput.setAttribute("aria-expanded", "false");
		}
		return;
	}

	for (const [index, node] of results.slice(0, 10).entries()) {
		const li = document.createElement("li");
		li.className = "search-suggestion-item";
		li.setAttribute("role", "option");
		li.id = `search-suggestion-${index}`;
		li.setAttribute("aria-selected", "false");
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
			if (filterToolbar) filterToolbar.classList.add("hidden");
			list.hidden = true;
			if (searchInput) searchInput.setAttribute("aria-expanded", "false");
			document.getElementById("search-input").value = node.label;
		});
		list.appendChild(li);
	}

	list.hidden = false;
	if (searchInput) searchInput.setAttribute("aria-expanded", "true");
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
 * 003: Initialize legend and filter swatch elements with SVG icon backgrounds.
 * Queries all elements with [data-group] attribute and sets their
 * background-image to the corresponding icon data URI.
 */
function initSwatchIcons() {
	const swatches = document.querySelectorAll("[data-group]");
	for (const swatch of swatches) {
		// Skip checkboxes — only style swatch spans
		if (swatch.tagName === "INPUT") continue;
		const group = swatch.dataset.group;
		if (!group) continue;
		const uri = getIconDataUri(group);
		swatch.style.backgroundImage = `url('${uri}')`;
		swatch.style.backgroundSize = "contain";
		swatch.style.backgroundRepeat = "no-repeat";
		swatch.style.backgroundPosition = "center";
		swatch.style.backgroundColor = "transparent";
	}
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
