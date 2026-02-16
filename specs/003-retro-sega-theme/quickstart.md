# Quickstart: Retro SEGA Visual Theme

**Feature**: `003-retro-sega-theme`
**Date**: 2026-02-16
**Prerequisites**: Completed specs 001 and 002 codebase

---

## Overview

This feature transforms the SEGA Arcade Graph's visual identity into an authentic early-'90s SEGA Mega Drive aesthetic. The implementation touches 4 files (modify) and creates 1 new file, with no new runtime dependencies beyond a Google Fonts CDN link.

## Architecture Summary

```
┌─────────────────────────────────────────────┐
│ index.html                                   │
│ + Press Start 2P <link> (Google Fonts CDN)  │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼───┐           ┌────▼────┐
│ CSS   │           │ JS      │
│       │           │         │
│ styles.css        │ app.js ◄──── assigns icons per node at load time
│ + scanline ::after│ graph.js ◄── GROUP_CONFIG → shape:"image" + edge colors
│ + retro font vars │ icons.js ◄── NEW: SVG data URI definitions
│ + legend icons    │         │
│ + dark theme      │         │
└───────┘           └────┬────┘
                         │
                    ┌────▼────┐
                    │ Data    │
                    │         │
                    │ nodes.json ◄── + gender field on creators
                    │ edges.json    (unchanged)
                    └─────────┘
```

## Key Implementation Decisions

| Decision | Approach | Reference |
|----------|----------|-----------|
| Node icons | `shape: "image"` with SVG data URIs | [research.md §1](research.md) |
| Male/female icons | Per-node `image` override based on `gender` field | [research.md §2](research.md) |
| Scanline overlay | `body::after` + `repeating-linear-gradient` | [research.md §3](research.md) |
| Retro font | Press Start 2P via Google Fonts CDN | [research.md §4](research.md) |
| Edge styling | SEGA blue (#0044FF) with brighter hover | [research.md §5](research.md) |

## File Change Map

### New Files

| File | Purpose |
|------|---------|
| `src/js/icons.js` | SVG icon definitions as data URIs, `svgToDataUri()` helper, icon assignment function |
| `tests/unit/icons.test.js` | Unit tests for icon module |

### Modified Files

| File | Changes |
|------|---------|
| `src/index.html` | Add Press Start 2P font `<link>` tags (3 lines in `<head>`) |
| `src/css/styles.css` | Add `--font-retro` variable, scanline `::after`, retro colors, legend icon styles, reduced font sizes for retro font |
| `src/js/graph.js` | `GROUP_CONFIG` → `shape: "image"` for all groups; edge color → SEGA blue; import icons |
| `src/js/app.js` | Import icon assignment function; call before `createGraph()` to set per-node images |
| `src/data/nodes.json` | Add `"gender"` field to 5 creator nodes |
| `tests/unit/graph.test.js` | Update GROUP_CONFIG assertions for `shape: "image"` |

### Unchanged Files

| File | Reason |
|------|--------|
| `src/js/ego-graph.js` | Visual theme does not affect ego-graph logic |
| `src/js/filters.js` | Filter toggle logic unchanged; visual swatches styled via CSS |
| `src/js/search.js` | Search logic unchanged |
| `src/js/detail-panel.js` | Minimal changes only if badge colors update |
| `src/data/edges.json` | No edge data changes |

## Implementation Order

1. **Create `icons.js`** — Define all SVG icons and the `assignNodeIcons()` function
2. **Update `nodes.json`** — Add `gender` field to creator nodes
3. **Update `graph.js`** — Change GROUP_CONFIG to use `shape: "image"`, update edge colors
4. **Update `app.js`** — Import and call `assignNodeIcons()` before `createGraph()`
5. **Update `styles.css`** — Scanline overlay, retro font, dark theme, legend icons
6. **Update `index.html`** — Add font `<link>` tags
7. **Write/update tests** — `icons.test.js` (new), `graph.test.js` (update)

## SVG Icon Specification

All icons share a consistent `64×64` viewBox. Each icon is a simple silhouette optimized for small-scale rendering (14–30px in the graph).

| Icon | Key Visual Features | Distinguishing Detail |
|------|--------------------|-----------------------|
| Platform system-board | Landscape PCB, multiple chip rectangles | Wide form factor, no edge connector |
| Game JAMMA PCB | Portrait/square PCB | Prominent 56-pin JAMMA edge connector teeth at bottom |
| Creator male | Head silhouette | Short hair contour |
| Creator female | Head silhouette | Longer hair contour |
| Studio building | Japanese-style office | Peaked roof, small windows |
| SEGA company | Italic block letters | Inspired by SEGA wordmark style |

## Testing Strategy

| Test Type | What to Verify |
|-----------|---------------|
| Unit: `icons.test.js` | `svgToDataUri()` produces valid data URIs; `assignNodeIcons()` sets correct image per group/gender; neutral fallback when gender missing |
| Unit: `graph.test.js` | GROUP_CONFIG uses `shape: "image"` for all groups; edge color is SEGA blue |
| Visual: browser | Each node category renders with correct icon; scanlines visible; retro font loads; legend shows icons |
| Accessibility | WCAG AA contrast with scanlines active; `pointer-events: none` on overlay |
