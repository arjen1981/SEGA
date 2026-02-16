# Quickstart: Expand SEGA Arcade Graph Data

**Feature**: 004-expand-sega-arcade
**Branch**: `004-expand-sega-arcade`

## Prerequisites

- Modern web browser (Chrome, Firefox, or Safari)
- Local HTTP server (e.g., PowerShell `serve.ps1`, Python `http.server`, VS Code Live Server)
- Text editor for JSON editing
- No build tools, no npm install, no compilation required

## Setup

```powershell
# 1. Switch to feature branch
git checkout 004-expand-sega-arcade

# 2. Start local server from repo root
.\serve.ps1
# Or: python -m http.server 8080 --directory src
# Or: use VS Code Live Server on src/index.html
```

Open `http://localhost:8080` (or your server's port) in a browser.

## Project Structure (files touched by this feature)

```
src/
├── data/
│   ├── nodes.json          ← PRIMARY: Add new nodes, add `roles` to existing creators
│   └── edges.json          ← PRIMARY: Add new edges, migrate "created" → specific terms
├── js/
│   └── detail-panel.js     ← Add role badge rendering (FR-015)
└── css/
    └── styles.css           ← Add .role-badge styles

tests/
└── unit/
    └── detail-panel.test.js ← Add role badge test

specs/004-expand-sega-arcade/
├── contracts/
│   ├── nodes.schema.json   ← Reference schema (roles field added)
│   └── edges.schema.json   ← Reference schema (new edge labels)
└── ...
```

## Validation

### Data validation (run after any JSON edit)

```powershell
# From repo root
.\validate-data.ps1
```

Expected output — all PASS:
```
=== VALIDATION RESULTS ===
Nodes: ~130
Edges: ~300
Unique IDs: PASS
Edge refs: PASS
Connectivity: PASS
Per-group fields: PASS
Wikipedia URLs: PASS
Wikidata IDs: PASS
Required fields: PASS
=== DONE ===
```

### Linting (run after any JS/CSS edit)

```powershell
npm run lint
```

### Test suite (run after detail-panel.js changes)

Open `tests/index.html` in a browser. All tests must pass (green). New test for role badge rendering should appear in the detail-panel module.

### Manual visual verification

1. **Full graph view**: Click "Expand All" — verify significantly more nodes than before
2. **Creator count**: Count creator nodes (purple head icons) — should be ≥20
3. **Game count**: Count game nodes (amber PCB icons) — should be ≥80
4. **Edge labels**: Click a creator → hover edges → verify specific credit labels (directed, produced, composed for, etc.) instead of "created"
5. **Multi-edges**: Click Yu Suzuki → check edges to Hang-On → should see both "designed" and "programmed"
6. **Role badges**: Click any creator with roles → detail panel shows role badges (amber bordered labels)
7. **New platforms**: Click "Sega System 1" or other new platforms → verify detail panel shows data
8. **Ego graph**: Click any node → ego-graph spotlight works correctly with expanded data
9. **Performance**: Full graph should render and stabilize within 5 seconds

## Key Implementation Notes

### Data-only changes (no code impact)

New edge labels (`designed`, `programmed`, `composed for`, `artwork for`) work with vis-network automatically — they're just string labels rendered on edges. No changes to `graph.js`, `ego-graph.js`, `filters.js`, or `search.js` needed.

### Code change: Role badges (detail-panel.js)

The only JS change is adding role badge rendering in `detail-panel.js`. When a creator node has a `roles` array:

```javascript
// In renderNode(), after group badge, before summary:
if (node.roles && node.roles.length > 0) {
  const badges = node.roles.map(r => 
    `<span class="role-badge">${escapeHtml(r)}</span>`
  ).join("");
  parts.push(`<div class="detail-roles">${badges}</div>`);
}
```

### Edge migration checklist

- [ ] Remove 4 "created" edges (Yu Suzuki → hang-on, space-harrier, out-run, after-burner)
- [ ] Add 8 replacement edges (4 × "designed" + 4 × "programmed")
- [ ] Change Mizuguchi → sega-rally-championship from "directed" to "produced"
- [ ] Verify with `validate-data.ps1` after migration

### Wikipedia sourcing workflow

For each new node:
1. Open the Wikipedia article URL
2. Extract infobox data (year, credits, genre, platform)
3. Write the summary from the article's opening paragraph
4. Look up the Wikidata Q-ID from the Wikipedia sidebar ("Wikidata item" link)
5. Add to `nodes.json` following existing formatting
6. Add edges to `edges.json`
7. Run `validate-data.ps1`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `validate-data.ps1` says "FAIL (X bad)" for edge refs | A `from` or `to` ID in edges.json doesn't match any node ID — check for typos |
| `validate-data.ps1` says "FAIL (X disconnected)" | A node has no edges — add at least one edge connecting it |
| Graph is slow to render | Check node count — should be under 200. If over, reduce scope |
| "created" edges still visible | Search edges.json for `"created"` — all should be migrated |
| Role badges don't appear | Check that `node.roles` is an array (not a string), and that CSS is loaded |
| Multi-edges overlap on graph | Normal vis-network behavior — edges auto-curve when multiple edges connect same nodes |
