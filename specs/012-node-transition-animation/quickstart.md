# Quickstart: Node Transition Animation

**Feature**: 012-node-transition-animation  
**Date**: 2026-04-02

## What This Feature Does

Replaces the abrupt ego-graph switch (instant hide/show of nodes) with a smooth 600ms animated transition. When navigating from one spotlight node to another, the camera performs a continuous move with a slight zoom dip mid-transit, departing nodes/edges fade out via opacity, and arriving nodes/edges fade in. Shared nodes remain stable throughout.

## Key Files

| File | Role |
|------|------|
| `src/js/ego-graph.js` | **MODIFIED** — Add transition animation logic (rAF loop, opacity interpolation, zoom dip) |
| `tests/unit/ego-graph.test.js` | **MODIFIED** — Add unit tests for transition state management |
| `tests/integration/ego-graph-integration.test.js` | **MODIFIED** — Add integration tests for animated transitions |

## How It Works

### Animation Flow (ego-graph to ego-graph)

```
User clicks neighbor B (while spotlight is on A)
    │
    ├─ prefers-reduced-motion? ──YES──► Instant switch (current behavior)
    │
    NO
    │
    ├─ Transition already running? ──YES──► cancelAnimationFrame(), clean up
    │
    ▼
    Compute neighborhoods:
      departing  = neighbors(A) - neighbors(B)
      arriving   = neighbors(B) - neighbors(A)
      shared     = neighbors(A) ∩ neighbors(B)
    │
    ▼
    Unhide arriving nodes (hidden:false, opacity:0)
    Show arriving edges (hidden:false, color.opacity:0)
    │
    ▼
    Start rAF loop (600ms):
      Each frame:
        t = elapsed / 600ms (clamped to 0–1)
        eased = easeInOutQuad(t)
        │
        ├─ Camera: moveTo(lerp(posA, posB, eased), scale * zoomDip(eased))
        ├─ Departing nodes: opacity = 1 - eased
        ├─ Arriving nodes: opacity = eased
        ├─ Departing edges: color.opacity = 1 - eased
        └─ Arriving edges: color.opacity = eased
    │
    ▼
    Animation complete:
      Set final ego-graph state (identical to current applyEgoGraph result):
        - departing nodes: hidden=true, opacity=1 (reset)
        - arriving nodes: opacity=1
        - all edges: correct hidden state, color.opacity=1
      Disable physics, unpin spotlight
```

### Zoom Dip Curve

```
Scale
  1.5 ─── ●                                              ● ───
           \                                            /
  1.05 ─── ─\──────────────────────────────────────────/─────
               \                                    /
                 \              ●                  /
                  └────────── 1.05 ──────────────┘
  
         t=0                 t=0.5                    t=1
         (start)            (midpoint)               (end)
```

The zoom level dips to ~70% of the target scale at the midpoint, creating a subtle "pull back and approach" effect.

### Cancel-and-Replace

```javascript
// Pseudocode — when a new click arrives during transition:
if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    // Clean up intermediate opacity states
    // Reset departing/arriving nodes to correct state for new transition
}
// Start new transition from current camera position
```

## API Changes

### ego-graph.js — No signature changes

The public API remains identical:

```javascript
export function applyEgoGraph(nodeId)   // Now animates when transitioning between spotlights
export function expandAll()             // Unchanged
export function initEgoGraph(net)       // Unchanged
export function getViewMode()           // Unchanged
export function getSpotlightId()        // Unchanged
export function pickRandomSpotlight(arr) // Unchanged
```

### Behavioral change in applyEgoGraph:

| Scenario | Before | After |
|----------|--------|-------|
| First call (no prior spotlight) | Instant ego-graph setup | Same — no animation (FR-009) |
| Same node click | Re-center camera (500ms) | Same — re-center only |
| New node while in ego mode | Instant swap + 500ms focus | 600ms animated transition |
| New node from full mode | Instant swap + 500ms focus | Same — no animation (FR-010), relies on expandAll→applyEgoGraph flow |
| prefers-reduced-motion | N/A | Instant swap (FR-007) |

## Testing Strategy

### Unit Tests (ego-graph.test.js)

- Neighborhood computation: departing/arriving/shared sets computed correctly
- Transition state lifecycle: created on transition, cleaned up on completion
- Cancel-and-replace: in-progress transition properly canceled, new one started
- Reduced motion: no rAF loop started when `prefers-reduced-motion` is active
- Initial load: no transition animation on first `applyEgoGraph` call

### Integration Tests (ego-graph-integration.test.js)

- Visual transition: node opacity changes from 0→1 and 1→0 during transition
- Camera movement: viewport position changes from old to new spotlight
- End state equivalence: final node visibility matches pre-feature behavior
- Rapid clicks: only final target is active after multiple rapid transitions
