# Feature Specification: Random Ego-Graph Focus

**Feature Branch**: `002-random-ego-focus`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "When visiting index.html, a random creator/game/platform/studio is selected, centered in the graph, its detail panel is opened, and only its direct neighbor nodes are visible — matching the ego-graph pattern of victorianengineeringconnections.net."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Random Spotlight on Load (Priority: P1)

As a visitor, when I open the application I want to immediately see a single highlighted entity in the center of the graph surrounded only by its directly connected nodes and relationships, so that I get an engaging, focused introduction to the SEGA arcade universe without being overwhelmed by the full graph.

**Why this priority**: This is the core experience change. Without it the full graph renders on load, which is visually noisy and gives no clear entry point. The reference site (victorianengineeringconnections.net) demonstrates this ego-graph pattern as its primary UX.

**Independent Test**: Open `index.html` in a browser. A single non-company node should be centered (randomly chosen from studios, platforms, games, or creators). Only its direct neighbors and their connecting edges are visible. The detail panel for the centered node is open. Refreshing the page centers a different random node.

**Acceptance Scenarios**:

1. **Given** the page loads for the first time, **When** the graph stabilizes, **Then** a random node (not the SEGA company node) is centered, selected, and its detail panel is open.
2. **Given** the page loads, **When** the graph renders, **Then** only the centered node, its direct neighbors (nodes connected by an edge to the center), and all edges between visible nodes are shown. All other nodes and edges are hidden.
3. **Given** the page has loaded with a random spotlight node, **When** the user refreshes the page, **Then** a different random node is likely selected (non-deterministic, but the selection pool includes all non-company nodes).
4. **Given** the page loads, **When** the spotlight node has fewer than 2 neighbors, **Then** the system still functions correctly, displaying whatever neighbors exist.

---

### User Story 2 — Navigate from Spotlight to Neighbors (Priority: P2)

As a visitor, when I see the ego-graph spotlight view I want to click on any visible neighbor node to shift the spotlight to that node and see its direct connections, so that I can naturally explore the graph one hop at a time.

**Why this priority**: Without navigation, the spotlight is a dead end. The ego-graph exploration pattern requires the ability to "walk" from node to node, each click revealing a new neighborhood — matching the reference site's behavior.

**Independent Test**: Open the page (spotlight view appears). Click a visible neighbor node. The graph smoothly transitions: the clicked node becomes the new center, its neighbors become visible, and non-neighbors fade out. The detail panel updates to show the clicked node's information.

**Acceptance Scenarios**:

1. **Given** the spotlight view is showing node A with neighbors B, C, D, **When** the user clicks node B, **Then** node B becomes the new center, its direct neighbors (which may include A) are shown, and all non-neighbors of B are hidden.
2. **Given** the user navigates from node A to node B, **When** node B's detail panel opens, **Then** it shows the correct Wikipedia-sourced data for node B.
3. **Given** the user clicks a neighbor, **When** the graph transitions, **Then** the transition is smooth (animated pan/zoom to the new center node).

---

### User Story 3 — Expand to Full Graph View (Priority: P3)

As a visitor, after exploring the ego-graph spotlights I want to be able to view the complete graph with all nodes visible, so that I can see the full picture of the SEGA arcade ecosystem.

**Why this priority**: Some users will want to switch from the focused ego-graph mode to the full overview. This must be available but is lower priority because the ego-graph is the primary experience.

**Independent Test**: Open the page (spotlight view). Click an "Expand All" button or control. All nodes and edges become visible. The graph shows the full network. The filters and search from the previous feature remain functional.

**Acceptance Scenarios**:

1. **Given** the spotlight view is active, **When** the user clicks an "Expand All" control, **Then** all nodes and edges become visible after a smooth transition.
2. **Given** the full graph view is active, **When** the user clicks any node, **Then** the graph returns to ego-graph mode centered on the clicked node with only its neighbors visible.
3. **Given** the full graph view is active, **When** the user uses filters or search, **Then** they function as they currently do in feature 001.

---

### Edge Cases

- What happens when the randomly selected node has only 1 neighbor (e.g., a game with only a "developed by" edge)? → The ego-graph shows just the center node and its single neighbor.
- What happens when the randomly selected node has 0 neighbors (shouldn't occur per data validation rule 7, but defensive)? → Show the node centered with no neighbors; the detail panel still opens.
- What happens when the SEGA company node is a neighbor of the spotlight node? → It is shown as a regular neighbor (it participates in ego-graphs but is never randomly selected as the center).
- What happens when two neighbor nodes of the spotlight are also connected to each other? → Both the neighbor-to-center edges AND the neighbor-to-neighbor edges are shown (all edges where both endpoints are visible).
- What happens when the user uses search (US4 from feature 001) to select a node? → The search result navigates to ego-graph mode centered on the searched node, showing only its direct neighbors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On page load, the system MUST randomly select one non-company node (studio, platform, game, or creator) as the spotlight node.
- **FR-002**: The system MUST center and zoom the graph view on the spotlight node after physics stabilization.
- **FR-003**: The system MUST show only the spotlight node, its direct neighbors (nodes connected by at least one edge), and all edges between visible nodes. All other nodes and edges MUST be hidden.
- **FR-004**: The system MUST automatically open the detail panel for the spotlight node on load, displaying its Wikipedia-sourced information.
- **FR-005**: When a user clicks any visible neighbor node, the system MUST transition the spotlight to the clicked node: center it, show its direct neighbors, hide non-neighbors, and update the detail panel.
- **FR-006**: The spotlight transition (US2) MUST include a smooth animated pan/zoom to the new center node.
- **FR-007**: The system MUST provide an "Expand All" control that reveals the complete graph (all nodes and edges visible).
- **FR-008**: When the full graph is active and a user clicks any node, the system MUST return to ego-graph mode centered on the clicked node.
- **FR-009**: The random selection MUST exclude the SEGA company node — it may appear as a neighbor but never as the random center.
- **FR-010**: All existing functionality from feature 001 (filters, search, detail panel, legend, attribution) MUST continue to work in full-graph mode.
- **FR-011**: The category filter toolbar MUST be hidden while in spotlight (ego) mode and MUST become visible when the user switches to full-graph mode.
- **FR-012**: The search input MUST remain visible in both ego and full-graph modes. Selecting a search result MUST switch to ego-graph mode centered on the selected node.
- **FR-013**: In full-graph mode, the only way to return to ego mode is by clicking a node or selecting a search result. There MUST NOT be a separate "random spotlight" or "focus mode" button.
- **FR-014**: The legend bar MUST remain visible with all categories in both ego and full-graph modes.
- **FR-015**: The "Expand All" control MUST be placed in the header bar, next to the search input.

### Key Entities

- **Spotlight Node**: The currently centered node in the ego-graph view. Exactly one spotlight is active at any time when in ego-graph mode.
- **Ego-Graph Neighborhood**: The set of nodes directly connected to the spotlight node (one-hop distance), plus the spotlight node itself, plus all edges where both endpoints are in this set.
- **View Mode**: The graph operates in one of two modes — "ego" (spotlight active, only neighborhood visible) or "full" (all nodes visible, behaves as feature 001).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On every page load, a random non-company node is centered and its ego-graph is displayed within 3 seconds of the page becoming interactive.
- **SC-002**: Navigating from one spotlight node to a neighbor completes (pan/zoom animation + detail panel update) within 1 second.
- **SC-003**: Expanding from ego-graph to full graph view completes within 2 seconds.
- **SC-004**: Users can reach any node in the graph within 5 clicks from the initial random spotlight by navigating through ego-graph hops or using search.
- **SC-005**: The ego-graph view shows between 2 and 20 nodes on average per spotlight selection, keeping the view uncluttered compared to the full 93-node graph.

## Clarifications

### Session 2026-02-10

- Q: How do category filters (feature 001 toolbar) interact with spotlight view? → A: Filter toolbar is hidden during spotlight view, visible only in full-graph view.
- Q: Is the search input visible during spotlight view? → A: Search always visible; selecting a result switches to that node's ego-graph.
- Q: Can the user return from full-graph to ego mode without clicking a node? → A: No. The only way back to ego mode is clicking a specific node. No "Random Spotlight" button.
- Q: Is the legend bar visible in spotlight mode? → A: Legend always visible with all categories in both modes.
- Q: Where is the "Expand All" button placed in the UI? → A: In the header bar, next to the search input.

## Assumptions

- The existing data set (93 nodes, 156 edges) from feature 001 is used unchanged.
- The vis-network library supports showing/hiding nodes dynamically via the `hidden` property on the DataSet — this is already proven by the filters module (feature 001).
- The existing `graph.js`, `app.js`, `detail-panel.js`, `filters.js`, and `search.js` modules will be extended, not replaced.
- The random selection uses `Math.random()` — no cryptographic randomness needed.
- "Direct neighbor" means nodes exactly one edge away (not transitive/multi-hop).
