/**
 * Integration tests for deep-link navigation flow.
 *
 * Tests cover:
 * - Invalid hash shows toast and falls back to default view
 * - Malformed hashes are silently ignored
 *
 * Constitution Principle III: Tests written FIRST, MUST FAIL before implementation.
 */

import { initDeepLink, parseHash } from "../../src/js/deep-link.js";

const { module, test } = QUnit;

module("deep-link integration – invalid hash handling", (hooks) => {
	let originalHash;

	hooks.beforeEach(() => {
		originalHash = location.hash;
	});

	hooks.afterEach(() => {
		history.replaceState(null, "", originalHash || location.pathname);
	});

	test("onInvalidNode is called for non-existent node ID", (assert) => {
		history.replaceState(null, "", "#node=nonexistent-game");
		const nodeMap = new Map([
			["sega", { id: "sega", label: "SEGA" }],
			["sega-am2", { id: "sega-am2", label: "AM2" }],
		]);
		let invalidId = null;
		const result = initDeepLink(nodeMap, {
			onNavigate: () => {},
			onInvalidNode: (nodeId) => {
				invalidId = nodeId;
			},
		});
		assert.strictEqual(result.initialNodeId, null, "initialNodeId should be null");
		assert.strictEqual(invalidId, "nonexistent-game", "onInvalidNode should receive the bad ID");
	});

	test("malformed hash #nonsense is silently ignored", (assert) => {
		history.replaceState(null, "", "#nonsense");
		const nodeMap = new Map([["sega", { id: "sega" }]]);
		let invalidCalled = false;
		const result = initDeepLink(nodeMap, {
			onNavigate: () => {},
			onInvalidNode: () => {
				invalidCalled = true;
			},
		});
		assert.strictEqual(result.initialNodeId, null, "initialNodeId should be null");
		assert.notOk(invalidCalled, "onInvalidNode should not be called for malformed hashes");
	});

	test("empty hash # is silently ignored", (assert) => {
		history.replaceState(null, "", "#");
		const nodeMap = new Map([["sega", { id: "sega" }]]);
		let invalidCalled = false;
		const result = initDeepLink(nodeMap, {
			onNavigate: () => {},
			onInvalidNode: () => {
				invalidCalled = true;
			},
		});
		assert.strictEqual(result.initialNodeId, null, "initialNodeId should be null");
		assert.notOk(invalidCalled, "onInvalidNode should not be called for empty hash");
	});

	test("parseHash + nodeMap validation correctly identifies valid vs invalid", (assert) => {
		const nodeMap = new Map([
			["sonic-the-hedgehog", { id: "sonic-the-hedgehog" }],
			["virtua-fighter", { id: "virtua-fighter" }],
		]);

		// Valid
		const valid = parseHash("#node=sonic-the-hedgehog");
		assert.ok(nodeMap.has(valid.nodeId), "sonic-the-hedgehog should be in nodeMap");

		// Invalid
		const invalid = parseHash("#node=fake-game");
		assert.ok(invalid.nodeId !== null, "parseHash should extract an ID");
		assert.notOk(nodeMap.has(invalid.nodeId), "fake-game should NOT be in nodeMap");

		// Malformed
		const malformed = parseHash("#random-text");
		assert.strictEqual(malformed.nodeId, null, "malformed hash should return null nodeId");
	});
});
