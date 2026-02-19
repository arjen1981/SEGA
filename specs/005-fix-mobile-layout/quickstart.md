# Quickstart: Fix Mobile Layout & Detail Panel

**Feature**: `005-fix-mobile-layout` | **Date**: 2026-02-19

## Overview

Convert the mobile detail panel from a full-screen side panel to a 60vh bottom sheet overlay. Fix graph centering to use vertical offsets on mobile instead of the 400px desktop horizontal offset. Correct z-index layering so the legend bar is hidden behind the sheet and search suggestions stay on top.

## Files to Modify

### 1. `src/css/styles.css` — Bottom Sheet & Layering

**Inside the existing `@media (max-width: 767px)` block**, add/modify the `.detail-panel` rules:

```css
@media (max-width: 767px) {
  /* Convert side panel → bottom sheet */
  .detail-panel {
    top: auto;              /* CRITICAL: clear desktop top anchor */
    right: 0;
    left: 0;
    bottom: 0;
    width: 100vw;
    height: 60vh;
    height: 60dvh;          /* progressive enhancement */
    max-height: calc(100vh - 110px);  /* never overlap header area */
    transform: translateY(100%);      /* hidden below viewport */
    border-left: none;
    border-top: 1px solid var(--color-border);
    overflow-y: auto;
    overscroll-behavior: contain;     /* prevent scroll chaining to canvas */
  }

  .detail-panel.open {
    transform: translateY(0);         /* slide up into view */
  }
}
```

Key points:
- `top: auto` is essential — without it, `bottom: 0` is ignored because the desktop rule sets `top: var(--header-height)`
- `overscroll-behavior: contain` prevents scroll events from propagating to the graph canvas
- `max-height` prevents the sheet from overlapping the header area
- The existing `transition: transform 0.25s ease` works unchanged (transitions any transform axis)
- z-index 20 (existing) correctly covers the legend bar (z-index 10) — no change needed

### 2. `src/js/ego-graph.js` — Mobile-Aware Centering

**Add mobile detection** at module scope:

```js
const mobileQuery = window.matchMedia("(max-width: 767px)");
function isMobile() { return mobileQuery.matches; }
```

**Update `getPanelOffset()`** to return appropriate offset info:

Replace the horizontal-only offset logic with a function that returns `{ x, y }` based on viewport:
- Desktop: `{ x: -panelWidth / 2, y: 0 }` (existing behavior)
- Mobile with sheet open: `{ x: 0, y: -sheetHeight / 2 }` (center above sheet)
- Mobile with sheet closed / no panel: `{ x: 0, y: 0 }` (center in full viewport)

**Update `applyEgoGraph()`**: Use the new offset object in `network.focus()`.

**Update `expandAll()`**: On mobile, skip the horizontal offset shift (moveTo with `offset: { x: 0, y: 0 }`).

**Add re-center on panel close**: Listen for `"detail-panel-closed"` CustomEvent and re-center based on current view mode.

**Add resize handler**: Debounced `resize` listener (250ms) + `matchMedia` change listener to re-center on orientation change or viewport resize.

### 3. `src/js/detail-panel.js` — Dispatch Close Event

**Update `closeDetailPanel()`** to dispatch a custom event:

```js
export function closeDetailPanel() {
  if (panelEl) {
    panelEl.classList.remove("open");
    document.dispatchEvent(new CustomEvent("detail-panel-closed"));
  }
}
```

### 4. `src/js/app.js` — Minor (Optional)

No changes strictly required. The custom event pattern means `ego-graph.js` handles re-centering independently. However, if the `Expand All` button handler needs adjustment for mobile, ensure the `expandAll()` call uses the updated offset logic.

## Files NOT Modified

- `src/index.html` — no markup changes
- `src/data/nodes.json` — no data changes
- `src/data/edges.json` — no data changes
- `src/js/graph.js` — graph configuration unchanged
- `src/js/icons.js` — icons unchanged
- `src/js/filters.js` — filter logic unchanged
- `src/js/search.js` — search logic unchanged

## Testing Checklist

1. **Mobile bottom sheet**: Open browser at ≤767px → tap node → verify bottom sheet ~60% height
2. **Graph visible above sheet**: Verify canvas visible in top ~40%
3. **No header overlap**: Sheet stays below header + search bar
4. **Legend hidden**: Legend bar not visible when sheet is open
5. **Internal scroll**: Long detail content scrolls inside sheet without affecting graph
6. **Re-center on close**: Close sheet → graph re-centers (no 400px offset)
7. **Ego-graph centering**: Spotlight node appears in visible area above sheet
8. **Expand All on mobile**: All nodes fit, no horizontal offset
9. **Orientation change**: Rotate phone → graph re-centers
10. **Desktop parity**: Verify desktop/tablet behavior is identical to before
11. **Search dropdown**: Search suggestions appear above the bottom sheet
12. **Tap different node**: Sheet content updates in place, no close/re-open flash
