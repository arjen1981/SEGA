# Research: Fix Ego-Graph Physics Jank

**Date**: 2026-03-24
**Feature**: [spec.md](spec.md)

## R1: vis-network `setOptions({ physics: ... })` Behavior

**Decision**: Track physics state in a module-level variable and only call `setOptions` when configuration actually changes.

**Rationale**: `setOptions({ physics: ... })` is NOT a no-op when called redundantly — it merges options via `selectiveNotDeepExtend()` and calls `this.init()` which reinitializes the physics solver and resets the timestep. While it doesn't trigger re-stabilization automatically, the solver reinitialization causes the graph to "resettle," producing visible jitter. Skipping the call entirely when physics is already configured correctly eliminates this overhead.

**Alternatives considered**:
- **Always call setOptions** (current behavior, rejected): Causes unnecessary solver reinitialization and visible jitter on every ego-graph transition.
- **Use a debounce on setOptions calls** (rejected): Adds latency to the first transition from full→ego mode; doesn't solve the root cause.
- **Check vis-network internal state** (rejected): No public API to query current physics state (`network.physics.enabled` does not exist).

## R2: `network.once("stabilized", ...)` Handler Stacking

**Decision**: Use cancel-and-replace pattern — store a reference to the pending handler and call `network.off("stabilized", handler)` before registering a new one.

**Rationale**: Multiple `once("stabilized")` handlers can be registered independently and ALL will fire when stabilization completes. In rapid-click scenarios, stale handlers from earlier transitions fire alongside the current one. The stale handler may unpin a node that is no longer the spotlight or disable physics prematurely. The `network.off(event, handler)` API is documented and works correctly for removing pending `once` handlers — the function reference must match exactly.

**Alternatives considered**:
- **Let all handlers fire but make them idempotent** (rejected): Requires every handler to validate `spotlightId` matches, which is fragile and doesn't prevent the physics-disable race.
- **Use a counter/generation number** (rejected): Over-engineered for this use case; cancel-and-replace is simpler and sufficient.

## R3: Physics State Tracking

**Decision**: Introduce two module-level variables: `physicsEnabled` (boolean) and `lastPhysicsIsMobile` (boolean) to track whether physics is currently active and which viewport-specific configuration was last applied.

**Rationale**: vis-network does not expose any public API to query the current physics engine state. Tracking it with module-level variables is the standard approach used elsewhere in this codebase (e.g., `viewMode`, `spotlightId`, `reCenterTimer`). Two variables are needed because the physics configuration differs between mobile (springLength: 80) and desktop (default springLength), and we need to detect viewport changes as a trigger for re-applying settings.

**Alternatives considered**:
- **Single boolean `physicsEnabled`** (rejected): Doesn't track mobile/desktop difference — would miss the case where viewport changes between transitions.
- **Object with full config** (rejected): Over-engineered; the only axis of variation is mobile vs. desktop, which is boolean.

## R4: Same-Node Click Behavior (FR-006)

**Decision**: Add an early return guard in `applyEgoGraph()` that checks `nodeId === spotlightId`. When matched, skip all neighborhood/visibility updates and only re-center the camera using `network.focus()`.

**Rationale**: The clarification session decided that same-node clicks should re-center (useful when user panned away) but not re-run the full neighborhood computation. This is the simplest implementation: a single `if` guard at the top of the function, before any state mutation.

**Alternatives considered**:
- **Full no-op** (rejected by clarification): User feedback that re-centering is a useful affordance.
- **Full re-run** (rejected by clarification): Wasteful; same neighborhood, same node set.

## R5: Expand All During Pending Stabilization

**Decision**: `expandAll()` already resets all state (`spotlightId = null`, `viewMode = "full"`) and calls `clearTimeout(reCenterTimer)`. The cancel-and-replace pattern for the stabilization handler will naturally handle this case — the pending ego-graph handler is cancelled, and `expandAll` registers its own.

**Rationale**: No special handling needed. The same `network.off("stabilized", pendingHandler)` call at the top of both `applyEgoGraph()` and `expandAll()` ensures only one stabilization handler is active at any time.

**Alternatives considered**: None — the general solution covers this edge case.
