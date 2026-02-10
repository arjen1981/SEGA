# Research: Random Ego-Graph Focus

**Feature**: 002-random-ego-focus  
**Date**: 2026-02-10

## R1: vis-network Ego-Graph Filtering via `hidden` Property

**Decision**: Use the existing `hidden` property on vis.DataSet nodes and edges to show/hide the ego neighborhood.

**Rationale**: This is the same mechanism already proven in `filters.js` (feature 001). The DataSet `.update()` method accepts batch updates with `{ id, hidden }` objects. Edges must be hidden manually — vis-network does not auto-hide edges connected to hidden nodes.

**Alternatives considered**:
- Creating a separate vis.DataSet per ego-graph → rejected (unnecessary complexity, memory overhead for 93-node dataset, breaks existing filter/search modules)
- Removing/re-adding nodes from the DataSet → rejected (loses node positions, causes full re-stabilization)

## R2: `getConnectedNodes()` for Neighborhood Discovery

**Decision**: Use `vis.Network.getConnectedNodes(nodeId)` to find one-hop neighbors of the spotlight node.

**Rationale**: Built-in method returns an array of directly connected node IDs. Works on hidden nodes too (reads from internal `node.edges` array). No need to build a custom adjacency list from edges.json.

**Alternatives considered**:
- Manual adjacency map from edges.json → rejected (reinvents what vis-network provides; getConnectedNodes is authoritative over the live dataset with the correct direction-aware results)

## R3: Physics Behavior with Hidden Nodes

**Decision**: Set both `hidden: true` AND `physics: false` on nodes excluded from the ego-graph.

**Rationale**: Hidden nodes are still part of the physics simulation by default. This causes invisible forces that push visible nodes into unexpected positions. Disabling physics on hidden nodes yields a clean layout for the visible ego neighborhood.

**Alternatives considered**:
- Only setting `hidden: true` → rejected (phantom forces from 80+ hidden nodes distort the ego-graph layout)
- Calling `network.stabilize()` after hiding → helps but doesn't address ongoing phantom forces during interaction

## R4: Programmatic Selection Does Not Fire Events

**Decision**: After programmatically selecting the spotlight node (via `network.selectNodes()`), call `openDetailPanel()` directly instead of relying on the `selectNode` event.

**Rationale**: The vis-network documentation explicitly states that `selectNodes()`, `selectEdges()`, and `setSelection()` do **not** fire events. Only user-initiated clicks fire `selectNode`. The existing `app.js` wires `network.on("selectNode", ...)` for user clicks — this will continue to work for ego-graph navigation. But the initial spotlight on load requires a direct call.

**Alternatives considered**:
- Emitting a custom event → rejected (unnecessary indirection; direct function call is simpler and testable)

## R5: Expand All → Full Graph Transition

**Decision**: When "Expand All" is clicked, set `hidden: false` and `physics: true` on all nodes and edges, then call `network.fit()` with animation to zoom out to show the full graph.

**Rationale**: `network.fit()` adjusts the viewport to fit all visible nodes. Combined with the animation option, it provides a smooth transition from ego-graph to full view. The filter toolbar becomes visible, and click-to-ego (FR-008) is wired via the existing `selectNode` event.

**Alternatives considered**:
- Using `network.moveTo()` with manual scale calculation → rejected (fit() handles this automatically)

## R6: `network.focus()` for Ego-Graph Centering

**Decision**: Reuse the existing `network.focus(nodeId, options)` pattern (already in `search.js`) for centering the spotlight node.

**Rationale**: Proven in codebase. Supports animation duration, easing, and scale. The `easeInOutQuad` easing provides smooth transitions.

**Alternatives considered**:
- `network.moveTo()` → rejected (focus() is node-aware and tracks the node if it moves during stabilization)

## R7: View Mode State Management

**Decision**: Create a new `ego-graph.js` module to hold ego-graph state (current spotlight node ID, current view mode "ego"/"full") and export functions: `applyEgoGraph(nodeId)`, `expandAll()`, `getViewMode()`, `getSpotlightId()`.

**Rationale**: Separating ego-graph logic into its own module follows the single-responsibility principle (Constitution I) and keeps `app.js` as a wiring-only bootstrap. The new module coordinates hiding/showing nodes (reusing the DataSet pattern from filters.js) and delegates detail panel and camera work to existing modules.

**Alternatives considered**:
- Adding ego-graph logic directly to `app.js` → rejected (violates single-responsibility; makes testing harder)
- Extending `filters.js` → rejected (ego-graph is conceptually different from category filters; combining them creates confusing coupling)
