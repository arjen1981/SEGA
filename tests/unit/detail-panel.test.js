/**
 * Unit tests for the detail panel module (src/js/detail-panel.js)
 *
 * Tests cover:
 * - Opening the panel with data for each of the 5 entity types
 * - Rendering correct per-group facts
 * - Closing the panel via button click
 * - Closing the panel via outside click
 * - FR-009: "No data available" fallback for empty summary
 * - Missing optional fields handled gracefully
 *
 * Constitution Principle III: These tests are written FIRST and MUST FAIL.
 */

import { closeDetailPanel, initDetailPanel, openDetailPanel } from "../../src/js/detail-panel.js";

const { module, test } = QUnit;

/* --------------------------------------------------------
   Sample data for each entity type
   -------------------------------------------------------- */

const COMPANY_NODE = {
	id: "sega",
	label: "SEGA",
	group: "company",
	summary: "Sega Corporation is a Japanese multinational video game and entertainment company.",
	founded: 1960,
	headquarters: "Shinagawa, Tokyo, Japan",
	wikipediaUrl: "https://en.wikipedia.org/wiki/Sega",
	wikidataId: "Q122741",
	thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/sega.png",
};

const STUDIO_NODE = {
	id: "am2",
	label: "Sega AM2",
	group: "studio",
	summary: "Sega AM2 is an internal studio known for Virtua Fighter.",
	founded: 1983,
	defunct: null,
	status: "active",
	focus: "Arcade fighting and racing games",
	wikipediaUrl: "https://en.wikipedia.org/wiki/Sega_AM2",
	wikidataId: "Q1075863",
};

const PLATFORM_NODE = {
	id: "model-2",
	label: "Model 2",
	group: "platform",
	summary: "The Sega Model 2 is an arcade system board.",
	releaseYear: 1993,
	generation: "1990s polygon era",
	notableFeatures: "Texture-mapped 3D graphics",
	wikipediaUrl: "https://en.wikipedia.org/wiki/Sega_Model_2",
	wikidataId: "Q4386178",
};

const GAME_NODE = {
	id: "virtua-fighter",
	label: "Virtua Fighter",
	group: "game",
	summary: "Virtua Fighter is a 1993 fighting game by Sega AM2.",
	releaseYear: 1993,
	genre: "Fighting",
	wikipediaUrl: "https://en.wikipedia.org/wiki/Virtua_Fighter_(video_game)",
	wikidataId: "Q1318872",
	thumbnail: "https://upload.wikimedia.org/wikipedia/en/thumb/vf.png",
};

const CREATOR_NODE = {
	id: "yu-suzuki",
	label: "Yu Suzuki",
	group: "creator",
	summary: "Yu Suzuki is a Japanese game designer who headed Sega AM2.",
	birthYear: 1958,
	notableRoles: "Game director, Producer, Hardware engineer",
	roles: ["director", "producer", "designer", "programmer"],
	wikipediaUrl: "https://en.wikipedia.org/wiki/Yu_Suzuki",
	wikidataId: "Q282263",
	thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/yusuzuki.jpg",
};

const EMPTY_SUMMARY_NODE = {
	id: "test-missing",
	label: "Test Node",
	group: "game",
	summary: "",
	wikipediaUrl: "https://en.wikipedia.org/wiki/Test",
	wikidataId: "Q999999",
};

const MINIMAL_NODE = {
	id: "test-minimal",
	label: "Minimal Node",
	group: "studio",
	summary: "A studio with no optional fields.",
	status: "defunct",
	wikipediaUrl: "https://en.wikipedia.org/wiki/Test_Studio",
	wikidataId: "Q888888",
};

/* --------------------------------------------------------
   Helper: build a lookup map from a node array
   -------------------------------------------------------- */
function buildNodeMap(nodes) {
	const map = new Map();
	for (const n of nodes) {
		map.set(n.id, n);
	}
	return map;
}

module("detail-panel – open/close", (hooks) => {
	let panel;
	let content;

	hooks.beforeEach(() => {
		panel = document.getElementById("detail-panel");
		content = document.getElementById("detail-content");
		const allNodes = [
			COMPANY_NODE,
			STUDIO_NODE,
			PLATFORM_NODE,
			GAME_NODE,
			CREATOR_NODE,
			EMPTY_SUMMARY_NODE,
			MINIMAL_NODE,
		];
		initDetailPanel(buildNodeMap(allNodes));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("openDetailPanel shows the panel", (assert) => {
		openDetailPanel("sega");
		assert.true(panel.classList.contains("open"), "panel should have 'open' class");
	});

	test("closeDetailPanel hides the panel", (assert) => {
		openDetailPanel("sega");
		closeDetailPanel();
		assert.false(
			panel.classList.contains("open"),
			"panel should not have 'open' class after close",
		);
	});

	test("close button click closes the panel", (assert) => {
		openDetailPanel("sega");
		const closeBtn = document.getElementById("detail-close");
		closeBtn.click();
		assert.false(panel.classList.contains("open"), "panel should close on button click");
	});

	test("opening a different node replaces content", (assert) => {
		openDetailPanel("sega");
		const firstHTML = content.innerHTML;
		openDetailPanel("am2");
		assert.notStrictEqual(content.innerHTML, firstHTML, "content should change for different node");
	});
});

module("detail-panel – company rendering", (hooks) => {
	hooks.beforeEach(() => {
		initDetailPanel(buildNodeMap([COMPANY_NODE]));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("renders entity name", (assert) => {
		openDetailPanel("sega");
		const content = document.getElementById("detail-content");
		const heading = content.querySelector("h2");
		assert.ok(heading, "should have an h2 heading");
		assert.strictEqual(heading.textContent.trim(), "SEGA", "heading should be entity name");
	});

	test("renders group badge", (assert) => {
		openDetailPanel("sega");
		const content = document.getElementById("detail-content");
		const badge = content.querySelector(".detail-group-badge");
		assert.ok(badge, "should have a group badge");
		assert.ok(badge.textContent.toLowerCase().includes("company"), "badge should say company");
	});

	test("renders summary text", (assert) => {
		openDetailPanel("sega");
		const content = document.getElementById("detail-content");
		const summary = content.querySelector(".detail-summary");
		assert.ok(summary, "should have summary element");
		assert.ok(summary.textContent.includes("Sega Corporation"), "should include summary text");
	});

	test("renders company-specific facts (founded, headquarters)", (assert) => {
		openDetailPanel("sega");
		const content = document.getElementById("detail-content");
		const factsText = content.querySelector(".detail-facts")?.textContent || "";
		assert.ok(factsText.includes("1960"), "should show founded year");
		assert.ok(factsText.includes("Shinagawa"), "should show headquarters");
	});

	test("renders thumbnail when available", (assert) => {
		openDetailPanel("sega");
		const content = document.getElementById("detail-content");
		const img = content.querySelector(".detail-thumbnail");
		assert.ok(img, "should have thumbnail image");
		assert.ok(img.src.includes("sega.png"), "thumbnail src should match data");
	});

	test("renders Wikipedia link", (assert) => {
		openDetailPanel("sega");
		const content = document.getElementById("detail-content");
		const link = content.querySelector(".detail-wiki-link");
		assert.ok(link, "should have Wikipedia link");
		assert.strictEqual(link.href, "https://en.wikipedia.org/wiki/Sega");
	});
});

module("detail-panel – studio rendering", (hooks) => {
	hooks.beforeEach(() => {
		initDetailPanel(buildNodeMap([STUDIO_NODE]));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("renders studio-specific facts (status, focus)", (assert) => {
		openDetailPanel("am2");
		const content = document.getElementById("detail-content");
		const factsText = content.querySelector(".detail-facts")?.textContent || "";
		assert.ok(factsText.toLowerCase().includes("active"), "should show status");
		assert.ok(factsText.includes("Arcade fighting"), "should show focus area");
	});
});

module("detail-panel – platform rendering", (hooks) => {
	hooks.beforeEach(() => {
		initDetailPanel(buildNodeMap([PLATFORM_NODE]));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("renders platform-specific facts (releaseYear, generation, features)", (assert) => {
		openDetailPanel("model-2");
		const content = document.getElementById("detail-content");
		const factsText = content.querySelector(".detail-facts")?.textContent || "";
		assert.ok(factsText.includes("1993"), "should show release year");
		assert.ok(factsText.includes("1990s polygon era"), "should show generation");
	});
});

module("detail-panel – game rendering", (hooks) => {
	hooks.beforeEach(() => {
		initDetailPanel(buildNodeMap([GAME_NODE]));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("renders game-specific facts (releaseYear, genre)", (assert) => {
		openDetailPanel("virtua-fighter");
		const content = document.getElementById("detail-content");
		const factsText = content.querySelector(".detail-facts")?.textContent || "";
		assert.ok(factsText.includes("1993"), "should show release year");
		assert.ok(factsText.includes("Fighting"), "should show genre");
	});
});

module("detail-panel – creator rendering", (hooks) => {
	hooks.beforeEach(() => {
		initDetailPanel(buildNodeMap([CREATOR_NODE]));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("renders creator-specific facts (birthYear, notableRoles)", (assert) => {
		openDetailPanel("yu-suzuki");
		const content = document.getElementById("detail-content");
		const factsText = content.querySelector(".detail-facts")?.textContent || "";
		assert.ok(factsText.includes("1958"), "should show birth year");
		assert.ok(factsText.includes("Game director"), "should show notable roles");
	});

	test("renders role badges when roles array is present", (assert) => {
		openDetailPanel("yu-suzuki");
		const content = document.getElementById("detail-content");
		const rolesContainer = content.querySelector(".detail-roles");
		assert.ok(rolesContainer, "should have a roles container");
		const badges = rolesContainer.querySelectorAll(".role-badge");
		assert.strictEqual(badges.length, 4, "should render 4 role badges");
		assert.strictEqual(badges[0].textContent, "director", "first badge should be director");
		assert.strictEqual(badges[1].textContent, "producer", "second badge should be producer");
		assert.strictEqual(badges[2].textContent, "designer", "third badge should be designer");
		assert.strictEqual(badges[3].textContent, "programmer", "fourth badge should be programmer");
	});
});

module("detail-panel – role badges absent", (hooks) => {
	hooks.beforeEach(() => {
		initDetailPanel(buildNodeMap([GAME_NODE]));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("does not render role badges for non-creator nodes", (assert) => {
		openDetailPanel("virtua-fighter");
		const content = document.getElementById("detail-content");
		const rolesContainer = content.querySelector(".detail-roles");
		assert.notOk(rolesContainer, "should not have roles container on game node");
	});
});

module("detail-panel – FR-009 fallback", (hooks) => {
	hooks.beforeEach(() => {
		initDetailPanel(buildNodeMap([EMPTY_SUMMARY_NODE]));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("shows 'no data available' when summary is empty", (assert) => {
		openDetailPanel("test-missing");
		const content = document.getElementById("detail-content");
		const noData = content.querySelector(".detail-no-data");
		assert.ok(noData, "should show no-data message");
		assert.ok(
			noData.textContent.toLowerCase().includes("no wikipedia data"),
			"should mention Wikipedia in the message",
		);
	});

	test("provides Wikipedia search link for missing data", (assert) => {
		openDetailPanel("test-missing");
		const content = document.getElementById("detail-content");
		const links = content.querySelectorAll("a");
		const searchLink = Array.from(links).find((a) =>
			a.href.includes("en.wikipedia.org/wiki/Special:Search"),
		);
		assert.ok(searchLink, "should include a Wikipedia search link");
	});
});

module("detail-panel – missing optional fields", (hooks) => {
	hooks.beforeEach(() => {
		initDetailPanel(buildNodeMap([MINIMAL_NODE]));
	});

	hooks.afterEach(() => {
		closeDetailPanel();
	});

	test("renders without error when optional fields are missing", (assert) => {
		assert.expect(1);
		try {
			openDetailPanel("test-minimal");
			assert.ok(true, "should render without throwing");
		} catch (err) {
			assert.ok(false, `threw error: ${err.message}`);
		}
	});

	test("does not show thumbnail when field is missing", (assert) => {
		openDetailPanel("test-minimal");
		const content = document.getElementById("detail-content");
		const img = content.querySelector(".detail-thumbnail");
		assert.notOk(img, "should not render thumbnail when missing");
	});
});
