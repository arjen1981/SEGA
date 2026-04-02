# Data Model: Node Transition Animation

**Feature**: 012-node-transition-animation  
**Date**: 2026-04-02

## Entities

### TransitionState (new internal state — not persisted)

Internal state managed within `ego-graph.js` to track an in-progress animated transition between ego-graphs.

| Field | Type | Description |
|-------|------|-------------|
| animFrameId | number \| null | Active `requestAnimationFrame` ID, or null if no transition is running |
| fromNodeId | string | Node ID of the old spotlight (transition origin) |
| toNodeId | string | Node ID of the new spotlight (transition target) |
| startTime | number | `performance.now()` timestamp when transition started |
| duration | number | Fixed at 600ms |
| departingNodeIds | Set\<string\> | Nodes in old neighborhood but NOT in new — fading out |
| arrivingNodeIds | Set\<string\> | Nodes in new neighborhood but NOT in old — fading in |
| sharedNodeIds | Set\<string\> | Nodes in both old AND new neighborhoods — remain stable |
| departingEdgeIds | Set\<string\> | Edges connected to departing nodes — fading out |
| arrivingEdgeIds | Set\<string\> | Edges connected to arriving nodes — fading in |

**Lifecycle**:

```
null ──[applyEgoGraph(newNodeId) with existing spotlight]──► TransitionState created
  ▲                                                              │
  │                                                              ▼
  │                                               rAF loop runs (600ms)
  │                                                              │
  └──────────[animation completes or canceled]──────────────────┘
```

**State transitions**:

```
No Transition ──[user clicks neighbor]──► Transition Running
       ▲                                        │
       │                                        ├──[600ms elapsed]──► Transition Complete ──► No Transition
       │                                        │
       └──[user clicks another neighbor]────────┘  (cancel current, start new)
```

### Node (existing entity — modified rendering properties)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (existing) |
| hidden | boolean | Visibility flag (existing — still used for final state) |
| opacity | number | **NEW during transition**: 0–1 value controlling canvas globalAlpha |
| physics | boolean | Physics participation (existing) |
| fixed | object | Position locking (existing) |

**Transition behavior per node category**:

| Category | Opacity at t=0 | Opacity at t=1 | hidden at end |
|----------|---------------|---------------|---------------|
| Departing | 1 | 0 | true |
| Arriving | 0 | 1 | false |
| Shared | 1 | 1 | false |
| Spotlight (new) | 1 | 1 | false |
| All others | — | — | true (unchanged) |

### Edge (existing entity — modified rendering properties)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (existing) |
| hidden | boolean | Visibility flag (existing — still used for final state) |
| color.opacity | number | **NEW during transition**: 0–1 value controlling edge rendering alpha |

**Transition behavior**: An edge's opacity tracks the minimum opacity of its two endpoint nodes. If either endpoint is departing, the edge fades out in sync.

## State Management

No persistent state changes. All transition state is ephemeral — it exists only during the 600ms animation and is cleaned up on completion or cancellation. The source of truth for "which node is the spotlight" remains `spotlightId` in `ego-graph.js`. The `opacity` property on nodes/edges is only set during transitions and reset to 1 (or node hidden) at completion.
