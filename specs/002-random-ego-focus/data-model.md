# Data Model: Random Ego-Graph Focus

**Feature**: 002-random-ego-focus  
**Date**: 2026-02-10

## Overview

This feature introduces no new persistent entities. It operates entirely on the existing nodes.json and edges.json data from feature 001. All new state is runtime-only (in-memory JavaScript).

## Runtime State (New)

### View Mode

| Field | Type | Values | Default |
|-------|------|--------|---------|
| mode | string | `"ego"` \| `"full"` | `"ego"` |

- On page load: mode = `"ego"`
- After "Expand All" click: mode = `"full"`
- After click-on-node in full mode: mode = `"ego"`

### Spotlight Node

| Field | Type | Description |
|-------|------|-------------|
| spotlightId | string \| null | Node ID of the currently centered ego-graph node. `null` when in full mode. |

- On page load: randomly selected non-company node ID
- On neighbor click (ego mode): clicked node ID
- On node click (full mode): clicked node ID (transitions to ego mode)
- On search result selection: selected node ID
- On Expand All: set to `null`

### Ego-Graph Neighborhood (Derived)

Not stored — computed on every spotlight change from the vis.Network instance:

```
spotlightId → network.getConnectedNodes(spotlightId) → neighborIds
visibleNodeIds = { spotlightId, ...neighborIds }
visibleEdgeIds = all edges where both from AND to are in visibleNodeIds
```

## Existing Entities (Unchanged)

### Node (from nodes.json)

| Field | Type | Used by ego-graph? |
|-------|------|-------------------|
| id | string | Yes — match against spotlightId and neighborIds |
| label | string | No change |
| group | string | Yes — FR-009 excludes `"company"` from random selection |
| summary | string | No change |
| wikipediaUrl | string | No change |
| thumbnail | string | No change |
| (group-specific fields) | various | No change |

### Edge (from edges.json)

| Field | Type | Used by ego-graph? |
|-------|------|-------------------|
| id | string | Yes — used in edge visibility updates |
| from | string | Yes — both endpoints checked against visibleNodeIds |
| to | string | Yes — both endpoints checked against visibleNodeIds |
| label | string | No change |

## vis.DataSet Runtime Properties (Modified)

The ego-graph module modifies these per-node and per-edge runtime properties via `DataSet.update()`:

| Property | Type | Set by ego-graph |
|----------|------|-----------------|
| node.hidden | boolean | `true` when node not in ego neighborhood |
| node.physics | boolean | `false` when node hidden (prevents phantom forces) |
| edge.hidden | boolean | `true` when either endpoint not in ego neighborhood |

These properties are already used by `filters.js` — both systems must coordinate. The spec resolves this: filters are hidden in ego mode (FR-011), so only one system modifies `hidden` at a time.

## State Transitions

```
┌─────────────────────────────────────────┐
│                PAGE LOAD                 │
│  1. Fetch data                          │
│  2. Create graph (all nodes)            │
│  3. Random select → spotlightId         │
│  4. Apply ego-graph → hide non-neighbors│
│  5. Focus camera on spotlight           │
│  6. Open detail panel                   │
│  mode = "ego"                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│              EGO MODE                     │
│  - Only neighborhood visible              │
│  - Filter toolbar hidden                  │
│  - Search visible                         │
│  - Legend visible                          │
│  - "Expand All" button visible            │
├──────────────────────────────────────────┤
│  Click neighbor → new spotlightId         │
│    → re-compute neighborhood              │
│    → animate to new center                │
│    → update detail panel                  │
│                                           │
│  Click "Expand All" →                     │
│    → unhide all nodes/edges               │
│    → spotlightId = null                   │
│    → mode = "full"                        │
│    → show filter toolbar                  │
│                                           │
│  Search result →                          │
│    → new spotlightId = result             │
│    → re-compute neighborhood              │
│    → animate to new center                │
│    → update detail panel                  │
└──────────────┬──────────────────────────┘
               │ (Expand All)
               ▼
┌──────────────────────────────────────────┐
│              FULL MODE                    │
│  - All nodes/edges visible                │
│  - Filter toolbar visible                 │
│  - Search visible                         │
│  - Legend visible                          │
│  - "Expand All" hidden (already expanded) │
├──────────────────────────────────────────┤
│  Click any node →                         │
│    → new spotlightId = clicked            │
│    → mode = "ego"                         │
│    → apply ego-graph                      │
│    → hide filter toolbar                  │
│                                           │
│  Search result →                          │
│    → new spotlightId = result             │
│    → mode = "ego"                         │
│    → apply ego-graph                      │
│    → hide filter toolbar                  │
└──────────────────────────────────────────┘
```
