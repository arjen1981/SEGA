# Data Model: URL-Based Deep Linking

**Feature**: 011-url-deep-linking  
**Date**: 2026-03-24

## Entities

### DeepLinkHash

A URL fragment that encodes a reference to a specific graph node.

| Field | Type | Description |
|-------|------|-------------|
| raw | string | The full hash fragment from the URL (e.g., `#node=virtua-fighter`) |
| nodeId | string \| null | The extracted, URL-decoded node ID, or null if the hash is malformed |

**Format**: `#node=<nodeId>` where `<nodeId>` is a kebab-case node identifier.

**Validation rules**:
- Hash must match the pattern `#node=<value>` (case-sensitive key)
- The `<value>` portion must be URL-decoded before lookup
- An empty value (`#node=`) is treated as no deep link
- Hashes not matching the pattern (e.g., `#nonsense`, `#`, empty) are ignored

**State transitions**:

```
No Hash ──[user clicks node]──► #node=<id>
   ▲                                │
   │                                ▼
   │                          #node=<id2>  ◄──[user clicks different node]
   │                                │
   └──[user deselects / clicks canvas]──┘
```

### Node (existing entity — no changes)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique kebab-case identifier (e.g., `virtua-fighter`, `sega-am2`) |
| label | string | Display name |
| group | string | Category: company, studio, platform, game, creator |
| *(other fields)* | various | Group-specific metadata (founded, status, focus, etc.) |

**Relationship**: DeepLinkHash.nodeId → Node.id (lookup via nodeMap)

## State Management

The deep-link module maintains no internal state beyond what the browser URL provides. It reads from `location.hash` and writes via `history.pushState()`. The source of truth for "which node is currently active" remains `ego-graph.js` via `getSpotlightId()`.

| State | Owner | Access |
|-------|-------|--------|
| Current hash | Browser URL (`location.hash`) | Read by deep-link.js |
| Current spotlight node | ego-graph.js (`getSpotlightId()`) | Read by deep-link.js for dedup |
| Node data | app.js (`nodeMap`) | Passed to deep-link.js at init |
