/**
 * Unit tests for the icons module (src/js/icons.js)
 *
 * Tests cover:
 * - svgToDataUri() produces valid data URIs
 * - getIconDataUri() returns correct icon per group
 * - getIconDataUri() gender-based creator icon selection
 * - getIconDataUri() neutral fallback when gender missing
 * - assignNodeIcons() sets image and shape on each node
 * - Legend/filter swatch icons (US4 — T013)
 *
 * Constitution Principle III: Tests written FIRST.
 */

import {
	assignNodeIcons,
	COMPANY_SEGA,
	CREATOR_FEMALE,
	CREATOR_MALE,
	CREATOR_NEUTRAL,
	GAME_JAMMA_PCB,
	getIconDataUri,
	PLATFORM_SYSTEM_BOARD,
	STUDIO_BUILDING,
	svgToDataUri,
} from "../../src/js/icons.js";

const { module, test } = QUnit;

// ---------------------------------------------------------------------------
// svgToDataUri()
// ---------------------------------------------------------------------------

module("icons – svgToDataUri()", () => {
	test("returns a string starting with data:image/svg+xml,", (assert) => {
		const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>';
		const uri = svgToDataUri(svg);
		assert.ok(uri.startsWith("data:image/svg+xml,"), "should start with data:image/svg+xml,");
	});

	test("encodes the SVG content", (assert) => {
		const svg =
			'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><text>Hello</text></svg>';
		const uri = svgToDataUri(svg);
		assert.ok(uri.includes("Hello"), "should contain the SVG content");
		assert.ok(uri.length > "data:image/svg+xml,".length, "should have encoded content");
	});

	test("uses encodeURIComponent (not base64)", (assert) => {
		const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>';
		const uri = svgToDataUri(svg);
		assert.false(uri.includes(";base64,"), "should NOT use base64 encoding");
	});
});

// ---------------------------------------------------------------------------
// SVG constants
// ---------------------------------------------------------------------------

module("icons – SVG constants", () => {
	test("all SVG constants include required xmlns attribute", (assert) => {
		const icons = [
			PLATFORM_SYSTEM_BOARD,
			GAME_JAMMA_PCB,
			CREATOR_MALE,
			CREATOR_FEMALE,
			CREATOR_NEUTRAL,
			STUDIO_BUILDING,
			COMPANY_SEGA,
		];
		for (const svg of icons) {
			assert.ok(
				svg.includes('xmlns="http://www.w3.org/2000/svg"'),
				"should contain xmlns attribute",
			);
		}
	});

	test("all SVG constants include width and height attributes", (assert) => {
		const icons = [
			PLATFORM_SYSTEM_BOARD,
			GAME_JAMMA_PCB,
			CREATOR_MALE,
			CREATOR_FEMALE,
			CREATOR_NEUTRAL,
			STUDIO_BUILDING,
			COMPANY_SEGA,
		];
		for (const svg of icons) {
			assert.ok(svg.includes('width="64"'), "should contain width=64");
			assert.ok(svg.includes('height="64"'), "should contain height=64");
		}
	});

	test("all SVG constants use 64×64 viewBox", (assert) => {
		const icons = [
			PLATFORM_SYSTEM_BOARD,
			GAME_JAMMA_PCB,
			CREATOR_MALE,
			CREATOR_FEMALE,
			CREATOR_NEUTRAL,
			STUDIO_BUILDING,
			COMPANY_SEGA,
		];
		for (const svg of icons) {
			assert.ok(svg.includes('viewBox="0 0 64 64"'), "should use 64×64 viewBox");
		}
	});
});

// ---------------------------------------------------------------------------
// getIconDataUri()
// ---------------------------------------------------------------------------

module("icons – getIconDataUri()", () => {
	test("returns a data URI for platform group", (assert) => {
		const uri = getIconDataUri("platform");
		assert.ok(uri.startsWith("data:image/svg+xml,"), "should return a data URI");
		assert.ok(uri.includes("2a9d8f"), "should contain platform green color");
	});

	test("returns a data URI for game group", (assert) => {
		const uri = getIconDataUri("game");
		assert.ok(uri.startsWith("data:image/svg+xml,"), "should return a data URI");
		assert.ok(uri.includes("e9a820"), "should contain game amber color");
	});

	test("returns a data URI for company group", (assert) => {
		const uri = getIconDataUri("company");
		assert.ok(uri.startsWith("data:image/svg+xml,"), "should return a data URI");
		assert.ok(uri.includes("e63946"), "should contain company red color");
	});

	test("returns a data URI for studio group", (assert) => {
		const uri = getIconDataUri("studio");
		assert.ok(uri.startsWith("data:image/svg+xml,"), "should return a data URI");
		assert.ok(uri.includes("457b9d"), "should contain studio blue color");
	});

	test("creator male returns a data URI with male icon", (assert) => {
		const uri = getIconDataUri("creator", "male");
		assert.ok(uri.startsWith("data:image/svg+xml,"), "should return a data URI");
		assert.ok(uri.includes("7b2d8e"), "should contain creator purple color");
	});

	test("creator female returns a different URI than male", (assert) => {
		const maleUri = getIconDataUri("creator", "male");
		const femaleUri = getIconDataUri("creator", "female");
		assert.notStrictEqual(maleUri, femaleUri, "male and female URIs should differ");
	});

	test("creator with no gender returns neutral icon", (assert) => {
		const neutralUri = getIconDataUri("creator");
		const maleUri = getIconDataUri("creator", "male");
		const femaleUri = getIconDataUri("creator", "female");
		assert.notStrictEqual(neutralUri, maleUri, "neutral should differ from male");
		assert.notStrictEqual(neutralUri, femaleUri, "neutral should differ from female");
		assert.ok(neutralUri.startsWith("data:image/svg+xml,"), "should return a data URI");
	});

	test("creator with undefined gender returns neutral icon", (assert) => {
		const neutralUri = getIconDataUri("creator", undefined);
		const noGenderUri = getIconDataUri("creator");
		assert.strictEqual(neutralUri, noGenderUri, "undefined gender should equal no-gender call");
	});
});

// ---------------------------------------------------------------------------
// assignNodeIcons()
// ---------------------------------------------------------------------------

module("icons – assignNodeIcons()", () => {
	test("sets image and shape on each node", (assert) => {
		const nodes = [
			{ id: "sega", group: "company" },
			{ id: "am2", group: "studio" },
			{ id: "model2", group: "platform" },
			{ id: "vf", group: "game" },
			{ id: "yu", group: "creator", gender: "male" },
		];

		assignNodeIcons(nodes);

		for (const node of nodes) {
			assert.ok(node.image, `node "${node.id}" should have an image property`);
			assert.strictEqual(node.shape, "image", `node "${node.id}" shape should be "image"`);
			assert.ok(
				node.image.startsWith("data:image/svg+xml,"),
				`node "${node.id}" image should be a data URI`,
			);
		}
	});

	test("assigns gender-specific icons for creators", (assert) => {
		const nodes = [
			{ id: "male-creator", group: "creator", gender: "male" },
			{ id: "female-creator", group: "creator", gender: "female" },
		];

		assignNodeIcons(nodes);

		assert.notStrictEqual(
			nodes[0].image,
			nodes[1].image,
			"male and female creators should have different icons",
		);
	});

	test("creator without gender gets neutral icon", (assert) => {
		const nodes = [{ id: "unknown-creator", group: "creator" }];

		assignNodeIcons(nodes);

		const neutralUri = getIconDataUri("creator");
		assert.strictEqual(
			nodes[0].image,
			neutralUri,
			"creator without gender should get neutral icon",
		);
	});

	test("does not modify non-icon properties", (assert) => {
		const nodes = [{ id: "sega", label: "SEGA", group: "company", summary: "Test" }];

		assignNodeIcons(nodes);

		assert.strictEqual(nodes[0].id, "sega", "id should be unchanged");
		assert.strictEqual(nodes[0].label, "SEGA", "label should be unchanged");
		assert.strictEqual(nodes[0].summary, "Test", "summary should be unchanged");
	});
});

// ---------------------------------------------------------------------------
// US4: Legend/filter swatch icons (T013)
// ---------------------------------------------------------------------------

module("icons – legend/filter swatch icons (US4)", () => {
	test("getIconDataUri returns valid data URI for each legend group", (assert) => {
		const groups = ["company", "studio", "platform", "game", "creator"];
		for (const group of groups) {
			const uri = getIconDataUri(group);
			assert.ok(
				uri.startsWith("data:image/svg+xml,"),
				`"${group}" swatch should return a valid data URI`,
			);
		}
	});

	test("creator swatch uses neutral icon when no gender specified", (assert) => {
		const swatchUri = getIconDataUri("creator");
		const neutralUri = getIconDataUri("creator", undefined);
		assert.strictEqual(
			swatchUri,
			neutralUri,
			"creator swatch without gender should use neutral icon",
		);
	});
});
