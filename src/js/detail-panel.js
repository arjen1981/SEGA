/**
 * Detail panel module — displays Wikipedia-sourced information for a selected node.
 *
 * Exports:
 *   initDetailPanel(nodeMap)       — initialize with a Map of node data
 *   openDetailPanel(nodeId)        — render and show the panel for a node
 *   closeDetailPanel()             — hide the panel
 *
 * Per-group rendering:
 *   company  → founded, headquarters
 *   studio   → founded, status, focus
 *   platform → releaseYear, generation, notableFeatures
 *   game     → releaseYear, genre
 *   creator  → birthYear, notableRoles
 *
 * @module detail-panel
 */

/** @type {Map<string, object>} */
let nodeMap = new Map();

/** @type {HTMLElement} */
let panelEl;

/** @type {HTMLElement} */
let contentEl;

/** @type {HTMLButtonElement} */
let closeBtn;

/**
 * Initialize the detail panel with a node data lookup map.
 * Also wires the close button event listener.
 *
 * @param {Map<string, object>} map — Map where key = node.id, value = node object
 */
export function initDetailPanel(map) {
	nodeMap = map;
	panelEl = document.getElementById("detail-panel");
	contentEl = document.getElementById("detail-content");
	closeBtn = document.getElementById("detail-close");

	// Wire close button
	closeBtn.addEventListener("click", closeDetailPanel);
}

/**
 * Open the detail panel and render data for the given node ID.
 * @param {string} nodeId
 */
export function openDetailPanel(nodeId) {
	const node = nodeMap.get(nodeId);
	if (!node) {
		contentEl.innerHTML = renderNoData("Unknown entity");
		panelEl.classList.add("open");
		panelEl.removeAttribute("hidden");
		panelEl.setAttribute("aria-expanded", "true"); // 005 FR-015
		return;
	}

	contentEl.innerHTML = renderNode(node);
	panelEl.classList.add("open");
	panelEl.removeAttribute("hidden");
	panelEl.setAttribute("aria-expanded", "true"); // 005 FR-015
}

/**
 * Close the detail panel.
 * 005: Dispatches a "detail-panel-closed" CustomEvent for re-centering.
 */
export function closeDetailPanel() {
	if (panelEl) {
		panelEl.classList.remove("open");
		panelEl.setAttribute("aria-expanded", "false"); // 005 FR-015
		document.dispatchEvent(new CustomEvent("detail-panel-closed")); // 005: notify ego-graph
	}
}

/* ============================================================
   Private rendering helpers
   ============================================================ */

/**
 * Render the full detail panel content for a node.
 * @param {object} node
 * @returns {string} HTML string
 */
function renderNode(node) {
	const parts = [];

	// Entity name
	parts.push(`<h2>${escapeHtml(node.label)}</h2>`);

	// Group badge
	parts.push(
		`<span class="detail-group-badge badge-${node.group}">${escapeHtml(node.group)}</span>`,
	);

	// Role badges (FR-015)
	if (node.roles && node.roles.length > 0) {
		const badges = node.roles
			.map((r) => `<span class="role-badge">${escapeHtml(r)}</span>`)
			.join("");
		parts.push(`<div class="detail-roles">${badges}</div>`);
	}

	// Thumbnail (if available)
	if (node.thumbnail) {
		parts.push(
			`<img class="detail-thumbnail" src="${escapeHtml(node.thumbnail)}" alt="${escapeHtml(node.label)} thumbnail" loading="lazy">`,
		);
	}

	// Summary or FR-009 fallback
	if (node.summary && node.summary.trim() !== "") {
		parts.push(`<p class="detail-summary">${escapeHtml(node.summary)}</p>`);
	} else {
		parts.push(renderNoData(node.label));
	}

	// Per-group facts
	const facts = getGroupFacts(node);
	if (facts.length > 0) {
		parts.push('<ul class="detail-facts">');
		for (const { label, value } of facts) {
			parts.push(`<li><strong>${escapeHtml(label)}</strong> ${escapeHtml(String(value))}</li>`);
		}
		parts.push("</ul>");
	}

	// Wikipedia link
	if (node.wikipediaUrl) {
		parts.push(
			`<a class="detail-wiki-link" href="${escapeHtml(node.wikipediaUrl)}" target="_blank" rel="noopener noreferrer">View on Wikipedia ↗</a>`,
		);
	}

	return parts.join("\n");
}

/**
 * Get the fact list for a node based on its group type.
 * Only includes facts that have a value.
 *
 * @param {object} node
 * @returns {Array<{label: string, value: string|number}>}
 */
function getGroupFacts(node) {
	const facts = [];

	switch (node.group) {
		case "company":
			if (node.founded) facts.push({ label: "Founded", value: node.founded });
			if (node.headquarters) facts.push({ label: "Headquarters", value: node.headquarters });
			break;

		case "studio":
			if (node.founded) facts.push({ label: "Founded", value: node.founded });
			if (node.status) facts.push({ label: "Status", value: node.status });
			if (node.focus) facts.push({ label: "Focus", value: node.focus });
			break;

		case "platform":
			if (node.releaseYear) facts.push({ label: "Released", value: node.releaseYear });
			if (node.generation) facts.push({ label: "Generation", value: node.generation });
			if (node.notableFeatures) facts.push({ label: "Features", value: node.notableFeatures });
			break;

		case "game":
			if (node.releaseYear) facts.push({ label: "Released", value: node.releaseYear });
			if (node.genre) facts.push({ label: "Genre", value: node.genre });
			break;

		case "creator":
			if (node.birthYear) facts.push({ label: "Born", value: node.birthYear });
			if (node.notableRoles) facts.push({ label: "Roles", value: node.notableRoles });
			break;
	}

	return facts;
}

/**
 * Render the FR-009 "no data available" fallback.
 * Includes a Wikipedia search link so the user can look up the entity.
 *
 * @param {string} entityLabel — display name for the search query
 * @returns {string} HTML string
 */
function renderNoData(entityLabel) {
	const searchQuery = encodeURIComponent(entityLabel);
	return `
		<p class="detail-no-data">
			No Wikipedia data available for this entity.
		</p>
		<a class="detail-wiki-link" href="https://en.wikipedia.org/wiki/Special:Search/${searchQuery}" target="_blank" rel="noopener noreferrer">
			Search Wikipedia for "${escapeHtml(entityLabel)}" ↗
		</a>
	`;
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}
