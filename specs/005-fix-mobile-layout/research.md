# Research: Fix Mobile Layout & Detail Panel

**Feature**: `005-fix-mobile-layout` | **Date**: 2026-02-19

## R1: CSS Bottom Sheet Pattern via Media Query Override

**Decision**: Override the existing `.detail-panel` positioning inside `@media (max-width: 767px)` to convert from right-side panel to bottom-anchored sheet.

**Rationale**: The desktop panel uses `position: fixed; top: var(--header-height); right: 0; transform: translateX(100%)`. On mobile, setting `top: auto; bottom: 0; left: 0; right: 0; transform: translateY(100%)` converts it to a bottom sheet. The `top: auto` reset is critical — without it, the browser ignores `bottom: 0` because `top` takes precedence on fixed elements.

**CSS pattern**:
```css
@media (max-width: 767px) {
  .detail-panel {
    top: auto;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100vw;
    height: 60vh;
    height: 60dvh; /* progressive enhancement for dynamic viewport */
    transform: translateY(100%);
    border-left: none;
    border-top: 1px solid var(--color-border);
  }
  .detail-panel.open {
    transform: translateY(0);
  }
}
```

**Alternatives considered**: Using a separate HTML element for the mobile sheet (rejected — unnecessary DOM duplication) or `position: absolute` inside a flex container (rejected — would cause canvas resize).

---

## R2: Bottom Sheet Height — vh vs dvh vs calc()

**Decision**: Use `60vh` with `60dvh` progressive enhancement fallback.

**Rationale**: For `position: fixed` elements, `%` height resolves against the viewport — identical to `vh`. On mobile Safari, `100vh` includes the URL bar area, but at 60vh this produces only a minor ~3-5% variance (acceptable). `dvh` (dynamic viewport height) accounts for mobile browser chrome in Safari 15.4+ and is a free progressive enhancement. `calc()` is unnecessary since the sheet overlays the legend bar (z-index 20 > 10).

**Alternatives considered**: `calc(60vh - var(--legend-bar-height))` (rejected — sheet overlays legend, not adjacent); fixed pixel height (rejected — not responsive).

---

## R3: Canvas Stays Full-Size Under Overlay

**Decision**: No changes needed to the graph container or `app-main`. The `position: fixed` bottom sheet is out of document flow — the vis-network canvas remains full-size.

**Rationale**: `position: fixed` paints in its own compositor layer. It does not participate in normal flow, does not trigger layout changes on siblings, and does not cause vis-network to receive a resize event. This is the same behavior as Google Maps' bottom sheet — the map canvas is full-size underneath.

**Alternatives considered**: Resizing the canvas to the visible area above sheet (rejected per clarification — would trigger expensive relayout and physics recalculation).

---

## R4: Z-Index Stacking Order — No Changes Needed

**Decision**: Current z-index hierarchy works correctly for the bottom sheet.

**Stack** (ascending paint order):
| Element | z-index | Result |
|---------|---------|--------|
| `.legend-bar` | 10 | Painted below sheet |
| `.detail-panel` | 20 | Sheet covers legend |
| `.search-suggestions` | 30 | Dropdown above sheet |
| `body::after` (scanlines) | 9999 | CRT effect on top of everything |

**Rationale**: All elements use `position: fixed` in the root stacking context — no intermediate `z-index` isolation. The sheet at z-index 20 naturally covers the legend bar at z-index 10.

**Alternatives considered**: Raising legend bar z-index when panel is closed (rejected — unnecessary complexity; the legend is behind the sheet only when the sheet is open, which is correct).

---

## R5: Internal Scroll Containment

**Decision**: Add `overscroll-behavior: contain` to the mobile bottom sheet.

**Rationale**: Without it, when the user scrolls to the bottom of the sheet content and keeps scrolling, the event propagates to the body/canvas (scroll chaining). `overscroll-behavior: contain` stops scroll at the sheet boundary. Browser support: Chrome 63+, Firefox 59+, Safari 16+. For Safari 15.x, the existing `overflow: hidden` on `body` provides fallback.

---

## R6: Animation — Vertical Slide-Up Reuses Existing Transition

**Decision**: The existing `transition: transform 0.25s ease` works unchanged. Only the `transform` values change from `translateX` to `translateY` inside the media query.

**Rationale**: CSS `transition: transform` interpolates any transform change — it doesn't distinguish between X and Y axes. Both are GPU-composited, zero-layout animations. The 0.25s timing matches Material Design's recommended 200-300ms for bottom sheet reveals.

---

## R7: vis-network `focus()` Offset — Screen Pixels, Same Formula

**Decision**: `network.focus()` `offset: { x, y }` operates in **screen pixels** (CSS px). The formula for centering in partially-visible area is `-obscuredSize / 2` on the relevant axis.

**Desktop** (400px side panel): `offset: { x: -200, y: 0 }`
**Mobile** (60vh bottom sheet): `offset: { x: 0, y: -sheetHeight/2 }` where `sheetHeight = panel.offsetHeight` or `window.innerHeight * 0.6`.

**Alternatives considered**: Using canvas coordinates (incorrect — vis-network API uses screen pixels for offset).

---

## R8: Mobile Detection — `window.matchMedia`

**Decision**: Use `window.matchMedia("(max-width: 767px)")` to detect mobile viewport in JavaScript.

**Rationale**: Mirrors the existing CSS breakpoint exactly. Supports `.matches` for instant checks and `addEventListener("change", ...)` for reactive updates on resize/orientation change. The `change` event fires once per threshold crossing (not on every pixel), avoiding excessive re-centering calls. Also handles `orientationchange` (deprecated event) because portrait↔landscape changes trigger the media query boundary.

**Alternatives considered**: `window.innerWidth < 768` (rejected — doesn't match CSS evaluation in all cases; requires manual listener). CSS custom property flag (rejected — over-engineered).

---

## R9: Re-Center on Panel Close — Custom Event

**Decision**: `closeDetailPanel()` dispatches `document.dispatchEvent(new CustomEvent("detail-panel-closed"))`. `ego-graph.js` listens for this event and re-centers based on current view mode and viewport.

**Rationale**: Preserves module boundaries — `detail-panel.js` doesn't import from `ego-graph.js`, and `ego-graph.js` doesn't export a one-off re-center function. The event covers all close paths (close button, `deselectNode`, `Expand All`). Pattern is consistent with how the modules already communicate through the DOM (e.g., class toggles).

**Alternatives considered**: Direct call from `app.js` (rejected — couples `app.js` more tightly, misses all close paths). Callback parameter (rejected — over-complicated for single signal).

---

## R10: Resize/Orientation — vis-network Auto-Resizes Canvas

**Decision**: vis-network auto-resizes its internal canvas when the container dimensions change (via internal ResizeObserver). After resize, explicitly call `fit()` or `focus()` to re-center — the library does not auto-center after resize. Use a debounced `resize` listener (250ms) plus the `matchMedia` `change` event.

**Rationale**: vis-network updates canvas pixel dimensions automatically but does not re-fit the view. A debounced handler avoids excessive calls during resize drag. The `matchMedia` listener handles the critical case of crossing the 767px breakpoint (e.g., rotating phone from portrait to landscape).
