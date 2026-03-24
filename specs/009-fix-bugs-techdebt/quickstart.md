# Quickstart: Fix Ego-Graph Physics Jank

**Date**: 2026-03-24
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## What Changed

The ego-graph module (`src/js/ego-graph.js`) now tracks physics engine state to avoid redundant `setOptions()` calls that caused visual jitter during rapid node navigation.

## Key Changes

### 1. Physics State Tracking
- New module-level variables `physicsEnabled` and `lastPhysicsIsMobile` track the current physics configuration
- `setOptions({ physics: ... })` is only called when the configuration actually needs to change (transition from full→ego, or viewport change)

### 2. Stabilization Handler Cancel-and-Replace
- A `pendingStabilizationHandler` reference is maintained
- Before registering a new `once("stabilized")` handler, the previous one is cancelled via `network.off("stabilized", handler)`
- Prevents stale handlers from firing and corrupting spotlight state during rapid clicks

### 3. Same-Node Early Return (FR-006)
- Clicking the currently spotlighted node skips all neighborhood/visibility updates
- Camera re-centers on the spotlight node (useful when user has panned away)

### 4. Expand All Cleanup
- `expandAll()` uses the same cancel-and-replace pattern for consistency
- Resets physics tracking state when switching to full mode

## How to Test

1. Open the graph in a browser: `.\serve.ps1` then navigate to `http://localhost:8080`
2. Let the initial ego-graph load
3. **Rapid navigation test**: Click through 5+ neighbor nodes in quick succession — no jitter should occur
4. **Same-node test**: Click the currently spotlighted (centered) node — camera should re-center without layout changes
5. **Mode transition test**: Click "Expand All", then click a node — smooth transition from full→ego mode
6. **Mobile test**: Resize browser to ≤767px and repeat steps 3–5

## Files Modified

| File | Change |
|------|--------|
| `src/js/ego-graph.js` | Physics state tracking, handler cancel-and-replace, same-node guard |

## Running Tests

```powershell
.\serve.ps1
# Open http://localhost:8080/tests/ in browser
```

All existing ego-graph unit and integration tests should pass without modification. New tests will verify physics skip logic and same-node click behavior.
