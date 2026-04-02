# Feature Specification: Node Transition Animation

**Feature Branch**: `012-node-transition-animation`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Animatie bij node-transitie — een subtiel zoom/pan-effect wanneer je van de ene naar de andere ego-graph springt, in plaats van een abrupte switch."

## Clarifications

### Session 2026-04-02

- Q: Should the transition be multi-phase sequential (zoom-out → pan → zoom-in), a single continuous camera move with zoom dip, or a simple direct pan+zoom? → A: Single continuous camera move with a slight zoom dip mid-transit.
- Q: Should departing/arriving nodes use opacity fade, scale fade, or instant show/hide? → A: Opacity fade — nodes gradually become transparent when leaving and opaque when arriving.
- Q: Should edges fade in sync with their nodes, switch instantly, or fade independently? → A: Edges fade in sync with their connected nodes (same opacity curve).
- Q: What should the target transition duration be (400ms / 600ms / 800ms)? → A: 600ms total — balanced feel, similar to existing 500ms focus animation.
- Q: How is the old spotlight node categorized during a transition? → A: Always a shared node (stays visible) — edges are undirected so the old spotlight is always a neighbor of the new spotlight.
- Q: How should the 60 fps performance target (SC-006) be validated? → A: Semi-automated — a dev-only `--perf` flag that logs frame times via `performance.now()`, but no CI enforcement.
- Q: Should the transition animation apply to keyboard-triggered node navigation? → A: Yes, applies to all triggers — animation hooks into `applyEgoGraph`, so all entry points (click, keyboard, deep-link, search) get it automatically.
- Q: What happens when `expandAll()` or a canvas background click occurs during an in-progress transition? → A: Cancel the transition immediately, then execute the action normally (expandAll / deselect).
- Q: Should the animation still play when there are zero departing or zero arriving nodes? → A: Yes, still animate — the camera move and zoom dip provide spatial continuity; empty node sets are a no-op for opacity logic.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Smooth Zoom-Out / Zoom-In When Navigating Between Ego-Graphs (Priority: P1)

As a visitor exploring the SEGA graph, when I click a neighbor node to navigate from one ego-graph to another, I want to see a smooth animated transition (a single continuous camera move with a slight zoom dip mid-transit) instead of the current abrupt switch where old nodes vanish and new nodes appear instantly.

**Why this priority**: This is the core of the feature. The current transition is jarring — neighborhood nodes disappear and reappear in a single frame, breaking the sense of spatial continuity. A smooth transition gives users spatial context ("I came from over there") and makes the experience feel polished and intentional.

**Independent Test**: Open the page (ego-graph spotlight is active). Click a visible neighbor node. Observe: the camera performs a single continuous move from the old spotlight to the new spotlight, with the zoom level dipping slightly mid-transit to provide spatial context, then settling at the target zoom. The transition should feel continuous with no hard cut between old and new states.

**Acceptance Scenarios**:

1. **Given** the ego-graph is focused on node A, **When** the user clicks neighbor node B, **Then** the camera smoothly animates from A's position to B's position instead of snapping instantly.
2. **Given** the user triggers a node transition, **When** the animation plays, **Then** outgoing nodes (neighbors of A that are not neighbors of B) gradually become transparent (opacity fade to zero) and incoming nodes (neighbors of B that are not neighbors of A) gradually become opaque (opacity fade from zero to full).
3. **Given** the user triggers a node transition, **When** nodes exist in both neighborhoods (shared neighbors), **Then** those shared nodes remain visible throughout the transition without flickering or fading.
4. **Given** any node transition, **When** the transition animation completes, **Then** the final state is identical to what `applyEgoGraph` produces today — the correct nodes are visible, the spotlight is centered, and physics have settled.

---

### User Story 2 — Transition Respects Device and Viewport (Priority: P2)

As a visitor on a mobile device or desktop, when a node transition occurs the animation should be appropriate for my device — taking into account the detail panel offset and viewport size — so the transition looks correct regardless of screen size.

**Why this priority**: The graph already handles desktop vs. mobile layout differences (side panel vs. bottom sheet, zoom levels). The transition animation must respect these existing patterns to avoid visual glitches.

**Independent Test**: On a desktop viewport (>767px), trigger a node transition — the animation should account for the side detail panel offset. On a mobile viewport (≤767px), trigger the same transition — the animation should account for the bottom sheet offset and use the mobile zoom scale.

**Acceptance Scenarios**:

1. **Given** a desktop viewport with the detail panel open, **When** a node transition occurs, **Then** the animation centers the new spotlight node offset to the left of the detail panel, matching existing desktop centering behavior.
2. **Given** a mobile viewport with the bottom sheet open, **When** a node transition occurs, **Then** the animation centers the new spotlight node offset above the bottom sheet, matching existing mobile centering behavior.
3. **Given** a viewport resize occurs during a transition, **When** the transition completes, **Then** the final position uses the correct offset for the new viewport size.

---

### User Story 3 — Transition Does Not Block Interaction (Priority: P2)

As a visitor, if I click another node while a transition animation is still playing, I want the current animation to be canceled and a new transition to the latest target to begin immediately, so I never feel stuck waiting for an animation to complete.

**Why this priority**: Users who rapidly explore the graph should not be gated by in-progress animations. The cancel-and-replace pattern already exists for stabilization handlers; the transition animation needs the same behavior.

**Independent Test**: Click a neighbor node and immediately click a second neighbor while the first transition is still running. The first transition should be interrupted, and the graph should animate directly to the second node without completing the first animation or reaching an inconsistent state.

**Acceptance Scenarios**:

1. **Given** a transition to node B is in progress, **When** the user clicks node C, **Then** the transition to B is canceled and a new transition to C begins from the current camera position.
2. **Given** rapid sequential clicks (node B, then C, then D), **When** each click fires before the prior transition finishes, **Then** only the last click (node D) results in a completed transition with the correct neighborhood visible.
3. **Given** a transition is interrupted mid-animation, **When** the new transition starts, **Then** there are no visual artifacts such as partially faded nodes or orphaned edges.

---

### User Story 4 — Reduced Motion Preference (Priority: P3)

As a visitor who has enabled the "prefers-reduced-motion" accessibility setting in my operating system, I want the node transition to skip the animated zoom/pan/fade effects and switch directly (similar to the current behavior) so that the motion does not cause discomfort.

**Why this priority**: Accessibility is important but this user story affects a smaller audience. The correct behavior is straightforward — when reduced motion is preferred, use the existing instant-switch behavior.

**Independent Test**: Enable "prefers-reduced-motion: reduce" in OS or browser settings. Click a neighbor node. The ego-graph should switch instantly without any zoom, pan, or fade animation.

**Acceptance Scenarios**:

1. **Given** the user has `prefers-reduced-motion: reduce` enabled, **When** they click a neighbor node, **Then** the graph switches to the new ego-graph instantly without any animated transition.
2. **Given** the user toggles reduced motion off (back to normal), **When** they click a neighbor node, **Then** the animated transition plays normally.

---

### Edge Cases

- What happens when the new spotlight node is very far from the old one in the graph layout? The animation should still complete in the same duration (not speed-adjust) to maintain consistent pacing.
- What happens when the old and new neighborhoods are identical (e.g., clicking the only neighbor of a leaf node that leads back)? The animation should still play but will appear as a simple re-centering since shared nodes remain visible.
- What happens when `applyEgoGraph` is called with the same node ID that is already the spotlight? This already re-centers without neighborhood changes — the existing behavior should be preserved.
- What happens on initial page load (first ego-graph, no transition from a previous one)? No transition animation plays — the initial spotlight uses the current fade-in behavior as-is.
- What happens when transitioning from "Expand All" (full graph mode) back to an ego-graph? This is not a node-to-node transition — the existing expandAll → applyEgoGraph flow should not be affected by this feature.
- What happens when `expandAll()` or a canvas background click occurs during an in-progress transition? The transition is canceled immediately and the action (expand all / deselect) executes normally — no queuing or blocking.
- What happens when the old spotlight has zero neighbors (isolated node) or the new spotlight's only neighbor is the old spotlight? The animation still plays — the camera move and zoom dip provide spatial continuity even with empty departing or arriving node sets. The opacity logic iterates over empty sets (no-op).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST animate the camera as a single continuous move from the old spotlight position to the new spotlight position, with the zoom level dipping to approximately 70% of the target scale at the midpoint (~30% dip) to provide spatial context before settling at the target zoom level.
- **FR-002**: System MUST fade out departing nodes (neighbors of the old spotlight that are not neighbors of the new spotlight) by gradually reducing their opacity to zero, and fade in arriving nodes by gradually increasing their opacity from zero to full, during the transition.
- **FR-003**: System MUST keep shared nodes (present in both old and new neighborhoods) visible and stable throughout the transition — no flicker, no fade-out/fade-in cycle. The old spotlight node is always classified as a shared node because all edges are undirected, guaranteeing the old spotlight is a neighbor of the new spotlight.
- **FR-004**: System MUST complete the full transition (camera move + node/edge opacity changes) within a fixed 600ms duration regardless of the spatial distance between old and new spotlight nodes.
- **FR-005**: System MUST cancel any in-progress transition animation when a new ego-graph navigation is triggered, or when a non-ego action occurs (e.g., `expandAll()`, canvas background click/deselect), and proceed with the new action from the current state.
- **FR-006**: System MUST produce an end state after each transition that is identical to the current `applyEgoGraph` result — correct visible nodes, correct spotlight centering, correct physics state.
- **FR-007**: System MUST skip all transition animations and switch instantly when the user's system indicates `prefers-reduced-motion: reduce`.
- **FR-008**: System MUST apply the correct panel offset (desktop side panel or mobile bottom sheet) to the animated camera target position, matching existing centering behavior.
- **FR-009**: System MUST NOT play a transition animation on the initial page load spotlight (`spotlightId` is null) or when transitioning from full-graph mode (`viewMode !== "ego"`) — the animated transition applies only to ego-to-ego navigations triggered by user interaction.
- **FR-010**: System MUST NOT alter the behavior of "Expand All" or the transition from full-graph mode back to ego-graph mode.
- **FR-011**: System MUST fade edges in sync with their connected nodes during transitions — an edge whose endpoint node is fading out MUST fade at the same rate, and edges for arriving nodes MUST fade in alongside those nodes.
- **FR-012**: System MUST apply the transition animation to all ego-to-ego navigations regardless of trigger source (mouse click, keyboard, deep-link, search result selection) — the animation is implemented at the `applyEgoGraph` level, not at individual event handlers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No frame exists during an ego-to-ego transition where departing nodes are fully hidden and arriving nodes are not yet visible — verified by the absence of any instant-swap frame during node-to-node navigation.
- **SC-002**: The transition animation completes within 600 milliseconds, keeping navigation responsive and consistent with the existing 500ms focus animation feel.
- **SC-003**: Rapid consecutive node clicks (3+ within 1 second) result in only the final target ego-graph being displayed, with no visual artifacts or broken states.
- **SC-004**: On devices with `prefers-reduced-motion: reduce` enabled, transition behavior is indistinguishable from the current instant switch.
- **SC-005**: Existing automated tests for ego-graph, graph rendering, and deep linking continue to pass without modification beyond accommodating the new animation timing.
- **SC-006**: The transition is visually smooth at 60 frames per second on the current graph size (~50-100 nodes), validated via a dev-only perf flag that logs frame durations using `performance.now()` — no CI enforcement required.

## Assumptions

- The vis.js Network library supports the animation APIs needed (e.g., `network.focus()` with animation options, `network.moveTo()`) — this is confirmed by the existing codebase.
- Node fade-in/fade-out can be achieved via vis.js DataSet updates to opacity/color or via CSS transitions on the canvas-rendered nodes — the exact mechanism is an implementation detail.
- The current graph size (~50-100 nodes) does not require performance optimization for the transition; the animation can operate on the full node set without frame drops.
- The existing `applyEgoGraph` function will be extended rather than replaced — the same function signature and external behavior are preserved.
