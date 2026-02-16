/**
 * Unit tests for the graph module (src/js/graph.js)
 *
 * Tests cover:
 * - Network initialization returns a vis.Network instance
 * - 5 node groups configured with distinct colors and shapes
 * - barnesHut physics solver configuration
 * - Edge label rendering configuration
 * - Network cleanup / destroy
 *
 * Constitution Principle III: These tests are written FIRST and MUST FAIL
 * before any implementation exists.
 */

import { createGraph, destroyGraph, GROUP_CONFIG, getNetwork } from "../../src/js/graph.js";

const { module, test } = QUnit;

module("graph – createGraph()", (hooks) => {
	let container;

	hooks.beforeEach(() => {
		container = document.getElementById("graph-container");
		// Ensure a clean container for every test
		container.innerHTML = "";
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("returns a vis.Network instance", (assert) => {
		const network = createGraph(container, [], []);
		assert.ok(network instanceof vis.Network, "should return a vis.Network");
	});

	test("getNetwork() returns the active network", (assert) => {
		const network = createGraph(container, [], []);
		assert.strictEqual(getNetwork(), network, "getNetwork() should return the same instance");
	});

	test("getNetwork() returns null before initialization", (assert) => {
		assert.strictEqual(getNetwork(), null, "should be null before createGraph()");
	});

	test("destroyGraph() cleans up the network", (assert) => {
		createGraph(container, [], []);
		destroyGraph();
		assert.strictEqual(getNetwork(), null, "should be null after destroyGraph()");
	});

	test("renders nodes from provided data", (assert) => {
		const nodes = [
			{ id: "sega", label: "SEGA", group: "company" },
			{ id: "am2", label: "AM2", group: "studio" },
		];
		const edges = [{ from: "am2", to: "sega", label: "division of" }];

		const network = createGraph(container, nodes, edges);
		const body = network.body;

		assert.strictEqual(Object.keys(body.nodes).length, 2, "should have 2 nodes");
		assert.strictEqual(Object.keys(body.edges).length, 1, "should have 1 edge");
	});
});

module("graph – GROUP_CONFIG", () => {
	test("defines exactly 5 node groups", (assert) => {
		const groups = Object.keys(GROUP_CONFIG);
		assert.strictEqual(groups.length, 5, "should have 5 groups");
	});

	test("contains all required group names", (assert) => {
		const expected = ["company", "studio", "platform", "game", "creator"];
		for (const name of expected) {
			assert.ok(GROUP_CONFIG[name], `should have group "${name}"`);
		}
	});

	test("each group has a distinct color", (assert) => {
		const colors = new Set();
		for (const [name, config] of Object.entries(GROUP_CONFIG)) {
			const color = config.color?.background || config.color;
			assert.ok(color, `group "${name}" should have a color`);
			assert.false(colors.has(color), `group "${name}" color should be unique`);
			colors.add(color);
		}
	});

	test("each group has a shape", (assert) => {
		for (const [name, config] of Object.entries(GROUP_CONFIG)) {
			assert.ok(config.shape, `group "${name}" should have a shape`);
		}
	});

	test("all groups use image shape for SVG icons", (assert) => {
		for (const [name, config] of Object.entries(GROUP_CONFIG)) {
			assert.strictEqual(config.shape, "image", `group "${name}" should use shape "image"`);
		}
	});

	test("each group has a truthy image property", (assert) => {
		for (const [name, config] of Object.entries(GROUP_CONFIG)) {
			assert.ok(config.image, `group "${name}" should have an image data URI`);
			assert.ok(
				config.image.startsWith("data:image/svg+xml,"),
				`group "${name}" image should be a data URI`,
			);
		}
	});

	test("company group uses image shape and red color", (assert) => {
		const company = GROUP_CONFIG.company;
		assert.strictEqual(company.shape, "image", "company shape should be image");
		assert.ok(
			company.color?.background?.includes("#e63946") || company.color === "#e63946",
			"company color should be red (#e63946)",
		);
	});

	test("studio group uses image shape and blue color", (assert) => {
		const studio = GROUP_CONFIG.studio;
		assert.strictEqual(studio.shape, "image", "studio shape should be image");
		assert.ok(
			studio.color?.background?.includes("#457b9d") || studio.color === "#457b9d",
			"studio color should be blue (#457b9d)",
		);
	});

	test("platform group uses image shape and green color", (assert) => {
		const platform = GROUP_CONFIG.platform;
		assert.strictEqual(platform.shape, "image", "platform shape should be image");
		assert.ok(
			platform.color?.background?.includes("#2a9d8f") || platform.color === "#2a9d8f",
			"platform color should be green (#2a9d8f)",
		);
	});

	test("game group uses image shape and orange color", (assert) => {
		const game = GROUP_CONFIG.game;
		assert.strictEqual(game.shape, "image", "game shape should be image");
		assert.ok(
			game.color?.background?.includes("#e9a820") || game.color === "#e9a820",
			"game color should be orange (#e9a820)",
		);
	});

	test("creator group uses image shape and purple color", (assert) => {
		const creator = GROUP_CONFIG.creator;
		assert.strictEqual(creator.shape, "image", "creator shape should be image");
		assert.ok(
			creator.color?.background?.includes("#7b2d8e") || creator.color === "#7b2d8e",
			"creator color should be purple (#7b2d8e)",
		);
	});
});

module("graph – physics configuration", (hooks) => {
	let container;

	hooks.beforeEach(() => {
		container = document.getElementById("graph-container");
		container.innerHTML = "";
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("uses barnesHut physics solver", (assert) => {
		const nodes = [{ id: "sega", label: "SEGA", group: "company" }];
		const network = createGraph(container, nodes, []);
		const physicsOptions = network.physics.options;

		assert.strictEqual(physicsOptions.solver, "barnesHut", "solver should be barnesHut");
	});

	test("physics stabilizes within reasonable iterations", (assert) => {
		const nodes = [
			{ id: "sega", label: "SEGA", group: "company" },
			{ id: "am2", label: "AM2", group: "studio" },
		];
		const edges = [{ from: "am2", to: "sega", label: "division of" }];
		const network = createGraph(container, nodes, edges);

		const stabilization = network.physics.options.stabilization;
		assert.ok(stabilization.iterations >= 100, "should have at least 100 stabilization iterations");
		assert.ok(
			stabilization.iterations <= 2000,
			"should have at most 2000 stabilization iterations",
		);
	});
});

module("graph – edge configuration", (hooks) => {
	let container;

	hooks.beforeEach(() => {
		container = document.getElementById("graph-container");
		container.innerHTML = "";
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("edges display labels from data", (assert) => {
		const nodes = [
			{ id: "sega", label: "SEGA", group: "company" },
			{ id: "am2", label: "AM2", group: "studio" },
		];
		const edges = [{ from: "am2", to: "sega", label: "division of" }];
		const network = createGraph(container, nodes, edges);

		const edgeIds = network.body.data.edges.getIds();
		assert.strictEqual(edgeIds.length, 1, "should have 1 edge");

		const edgeData = network.body.data.edges.get(edgeIds[0]);
		assert.strictEqual(edgeData.label, "division of", "edge label should be preserved");
	});

	test("edges are drawn with arrows", (assert) => {
		const nodes = [
			{ id: "sega", label: "SEGA", group: "company" },
			{ id: "am2", label: "AM2", group: "studio" },
		];
		const edges = [{ from: "am2", to: "sega", label: "division of" }];
		const network = createGraph(container, nodes, edges);

		const edgeOptions = network.edgesHandler.options;
		assert.ok(
			edgeOptions.arrows?.to === true || edgeOptions.arrows?.to?.enabled === true,
			"edges should have arrows pointing to target",
		);
	});

	test("edges use SEGA blue color (#0044FF)", (assert) => {
		const nodes = [
			{ id: "sega", label: "SEGA", group: "company" },
			{ id: "am2", label: "AM2", group: "studio" },
		];
		const edges = [{ from: "am2", to: "sega", label: "division of" }];
		const network = createGraph(container, nodes, edges);

		const edgeOptions = network.edgesHandler.options;
		const edgeColor = edgeOptions.color?.color;
		assert.strictEqual(edgeColor, "#0044FF", "edge base color should be SEGA blue (#0044FF)");
	});
});

module("graph – interaction options", (hooks) => {
	let container;

	hooks.beforeEach(() => {
		container = document.getElementById("graph-container");
		container.innerHTML = "";
	});

	hooks.afterEach(() => {
		destroyGraph();
	});

	test("zoom is enabled", (assert) => {
		const network = createGraph(container, [], []);
		const interactionOptions = network.interactionHandler.options;
		assert.notStrictEqual(interactionOptions.zoomView, false, "zoom should be enabled");
	});

	test("drag/pan is enabled", (assert) => {
		const network = createGraph(container, [], []);
		const interactionOptions = network.interactionHandler.options;
		assert.notStrictEqual(interactionOptions.dragView, false, "drag/pan should be enabled");
	});

	test("node dragging is enabled", (assert) => {
		const network = createGraph(container, [], []);
		const interactionOptions = network.interactionHandler.options;
		assert.notStrictEqual(interactionOptions.dragNodes, false, "node dragging should be enabled");
	});
});
