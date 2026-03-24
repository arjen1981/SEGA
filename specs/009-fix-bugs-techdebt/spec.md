# Feature Specification: Fix Ego-Graph Physics Jank

**Feature Branch**: `009-fix-bugs-techdebt`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Fix bugs and tech debt — physics re-enabled on every ego-graph switch causing visual jank"

## Investigation Summary

The user reported four potential bugs. After code investigation, **three of four are already resolved** in the current codebase:

| # | Reported Issue | Status | Finding |
|---|---------------|--------|---------|
| 1 | `disambiguateLabels()` called but not defined | **Already resolved** | Function exists in app.js (line 290). Appends group type to duplicate labels. |
| 2 | Null-checks missing in search.js | **Already resolved** | `selectSuggestion()` already guards with `if (!network) return;`. Search input listeners are only wired after data loads. |
| 3 | SVG data-URIs regenerated without caching | **Already resolved** | `icons.js` already has `DATA_URI_CACHE` with memoization in `getIconDataUri()`. |
| 4 | Physics re-enabled on every ego-graph switch | **Confirmed bug** | `applyEgoGraph()` unconditionally calls `network.setOptions({ physics: ... })` on every invocation, triggering a full physics-settle cycle even when switching rapidly between nodes. |

This specification addresses **item 4** — the only confirmed defect.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Smooth Rapid Node Navigation (Priority: P1)

A user exploring the SEGA arcade graph clicks through multiple nodes in quick succession (e.g., clicking a creator, then a game, then a platform within a few seconds). Each click triggers an ego-graph transition. Currently, every transition unconditionally re-enables physics simulation, causing the graph layout to "jump" or "jitter" as nodes resettle — even though the previous layout was already stable. The experience should be smooth: nodes should transition fluidly without unnecessary physics recalculations when the graph is already in ego mode with physics active.

**Why this priority**: This is the only confirmed defect. It directly degrades the core user interaction (navigating between nodes) and is noticeable on every click in ego-graph mode.

**Independent Test**: Open the graph, let it load into ego-graph mode. Rapidly click 3–4 different neighbor nodes in sequence. Observe whether the graph layout jitters/resets between each transition.

**Acceptance Scenarios**:

1. **Given** the graph is in ego mode with a spotlight node displayed, **When** the user clicks a neighbor node, **Then** the transition to the new spotlight completes without visible layout jitter from unnecessary physics recalculation.
2. **Given** the graph is in ego mode and physics has already stabilized, **When** the user clicks a new neighbor, **Then** physics is not redundantly re-enabled if it is already active with the correct settings.
3. **Given** the graph is in full mode and the user clicks a node to enter ego mode, **When** physics needs to be enabled for the neighborhood to settle, **Then** physics is enabled exactly once and disabled after stabilization.
4. **Given** the user clicks several nodes in rapid succession (< 500ms between clicks), **When** two transitions overlap, **Then** only the most recent spotlight is applied and the earlier pending stabilization is cancelled.

---

### User Story 2 - Consistent Mobile vs Desktop Physics (Priority: P2)

On mobile, the ego-graph uses a shorter spring length (80px) compared to desktop (default). When switching from a desktop-width viewport to mobile (or vice versa) during navigation, the physics configuration should update to match the current viewport. However, within the same viewport, repeated clicks should not re-apply the same settings.

**Why this priority**: Mobile users experience the jank more noticeably on lower-powered devices. Ensuring the physics parameters only change when necessary reduces wasted computation.

**Independent Test**: On a mobile viewport, click through 3 nodes rapidly and confirm no visible jitter. Resize to desktop and repeat.

**Acceptance Scenarios**:

1. **Given** the user is on a mobile device in ego mode, **When** they click through multiple neighbors, **Then** the spring length remains at 80px without re-applying settings on each click.
2. **Given** the user resizes from mobile to desktop while in ego mode, **When** they click a new neighbor, **Then** the physics settings update to the desktop spring length.

### Edge Cases

- **Same-node click**: When the user clicks the currently spotlighted node, the system skips the full neighborhood update but re-centers the camera on the spotlight node (useful if the user dragged the view away).
- **Overlapping transitions**: When the user clicks a node while a previous stabilization is still in progress, the system cancels the pending stabilization handler and registers a new one for the latest transition (cancel-and-replace pattern). This prevents stale handlers from corrupting state (e.g., unpinning a node that is no longer the spotlight).
- What happens if the user clicks "Expand All" while a stabilization from a rapid ego-graph switch is pending?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST NOT unconditionally re-enable physics on every ego-graph transition when physics is already active with the correct configuration.
- **FR-002**: The system MUST explicitly cancel any pending stabilization handler from a previous ego-graph transition before registering a new one (cancel-and-replace), preventing stale handlers from firing and corrupting spotlight state.
- **FR-003**: The system MUST still enable physics when transitioning from full mode to ego mode, or when the viewport type changes (mobile ↔ desktop) between transitions.
- **FR-004**: The system MUST disable physics after the neighborhood has stabilized, preventing nodes from drifting after the layout settles.
- **FR-005**: The system MUST NOT introduce any visual regression — the ego-graph spotlight, node pinning, camera focus, and panel offset behavior must remain identical to the current implementation.
- **FR-006**: When the user clicks the currently spotlighted node, the system MUST skip the full neighborhood update and MUST re-center the camera on the spotlight node without re-enabling physics.

## Clarifications

### Session 2026-03-24

- Q: What happens when the user clicks the currently spotlighted node (same node, not a neighbor)? → A: No-op on node updates, but re-center camera on the spotlight node.
- Q: How does the system handle a click on a node while a previous stabilization is still in progress? → A: Cancel the pending stabilization handler before registering a new one (cancel-and-replace).

## Assumptions

- The physics re-enable is the root cause of the observed jank; no other factors (e.g., dataset batch updates) contribute significantly.
- The vis-network `setOptions({ physics: ... })` call is the expensive operation that triggers re-layout; simply checking whether physics is already enabled before calling it is sufficient to prevent jank.
- The "stabilized" event listener cleanup is needed to prevent stale handlers from firing after a rapid sequence of ego-graph transitions.
- Standard vis-network behavior is that `network.once("stabilized", ...)` registers a one-time handler, but if a new handler is registered before the previous fires, both will fire sequentially unless the previous is explicitly removed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can click through 5 consecutive neighbor nodes in under 3 seconds without visible layout jitter or node "jumping."
- **SC-002**: No visual regressions in ego-graph transitions — spotlight centering, panel offset, and node pinning behavior remain unchanged.
- **SC-003**: On mobile devices, rapid node navigation (3+ clicks in 2 seconds) completes without dropped frames or perceived lag.
- **SC-004**: All existing ego-graph unit and integration tests continue to pass without modification.
