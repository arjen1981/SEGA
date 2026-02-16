# Research: Retro SEGA Visual Theme

**Feature**: `003-retro-sega-theme`
**Date**: 2026-02-16
**Status**: Complete

---

## 1. vis-network Custom Image/Icon Nodes

### 1.1 Available Shape Types for Custom Visuals

vis-network v10 provides four shape types that support custom visuals beyond built-in geometric shapes:

| Shape | Mechanism | SVG Support | Scalability | Complexity |
|---|---|---|---|---|
| `"image"` | URL or data URI → `<img>` → canvas `drawImage()` | Yes (SVG as data URI or file URL) | Good (rasterized at load) | Low |
| `"circularImage"` | Same as `image` but clipped to circle | Yes | Good | Low |
| `"icon"` | Icon font glyph (FontAwesome, Ionicons, etc.) | No (font glyphs only) | Excellent (vector text) | Medium — requires font loading |
| `"custom"` | `ctxRenderer` callback — full canvas 2D API | Indirect (pre-rasterize SVG to Image, then `drawImage`) | Excellent (redraws at every frame) | High — full control |

### 1.2 `shape: "image"` with SVG Data URIs

**This is the recommended primary approach for this project.**

vis-network's `image` shape accepts any URL that resolves to an image, including `data:image/svg+xml` URIs. The browser renders the SVG into a bitmap, which vis-network draws onto the canvas via `ctx.drawImage()`.

**How it works:**
1. Encode your SVG markup as a data URI
2. Set `shape: "image"` and `image: "data:image/svg+xml,..."` on the node or group
3. vis-network loads the data URI as an `Image()` object and draws it on the canvas

**Code example — SVG data URI node:**

```javascript
// Helper: convert inline SVG string to a data URI
function svgToDataUri(svgString) {
  return "data:image/svg+xml," + encodeURIComponent(svgString);
}

const pcbIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="8" width="56" height="40" rx="2" fill="#2a9d8f" stroke="#1f7a6f" stroke-width="2"/>
  <rect x="12" y="48" width="4" height="8" fill="#8b949e"/>
  <rect x="20" y="48" width="4" height="8" fill="#8b949e"/>
  <rect x="28" y="48" width="4" height="8" fill="#8b949e"/>
  <!-- ... more connector pins ... -->
</svg>`;

const nodes = [
  {
    id: "mega-drive",
    label: "Mega Drive",
    group: "platform",
    shape: "image",
    image: svgToDataUri(pcbIconSvg),
    size: 30,
  }
];
```

**Critical caveats:**

1. **Width/height attributes on `<svg>` root are required.** Firefox has a known bug where SVGs without explicit `width` and `height` attributes on the root `<svg>` element fail to render on canvas. Always include them. The vis-network docs explicitly note this: _"Firefox has a SVG drawing bug, there is a workaround — add width/height attributes to root `<svg>` element of the SVG."_

2. **`xmlns` attribute is required.** When using data URIs, the SVG must include `xmlns="http://www.w3.org/2000/svg"` or browsers won't parse it as SVG.

3. **Use `encodeURIComponent()` not base64.** `data:image/svg+xml,` + `encodeURIComponent(svg)` is more compact and debuggable than base64 encoding. Both work, but URI-encoded is preferred for inline SVG strings.

4. **`brokenImage` fallback.** Set the `brokenImage` option to a simple fallback (e.g., a colored circle PNG data URI, or the current geometric shape) for browsers that fail to render the SVG.

### 1.3 `shape: "icon"` with Icon Fonts

The `icon` shape renders a single Unicode glyph from an icon font (FontAwesome, Material Icons, Ionicons, etc.) directly as vector text on the canvas.

```javascript
// Group config using FontAwesome icons
const GROUP_CONFIG = {
  studio: {
    shape: "icon",
    icon: {
      face: "FontAwesome",        // CSS font-family name
      code: "\uf1ad",             // fa-building Unicode codepoint
      size: 50,                   // icon size in px
      color: "#457b9d",           // icon fill color
    },
  },
};
```

**Requirements:**
- The icon font CSS must be loaded in the HTML (`<link>` tag or `@font-face`)
- The font must be **fully loaded** before vis-network tries to render — otherwise glyphs render as empty boxes
- An icon must be used at least once in the DOM (e.g., a hidden `<i class="fa fa-flag"></i>`) to trigger CSS font loading — this is the pattern used in the official vis-network `customGroups.html` example

**Limitations for this project:**
- Custom icon fonts are complex to create for bespoke shapes like PCB boards or head silhouettes
- FontAwesome/Material Icons don't have arcade PCB or SEGA-specific glyphs
- **Verdict: Not recommended for this project's custom icons.** Could be used as a secondary approach if a suitable icon font existed.

### 1.4 `shape: "custom"` with `ctxRenderer`

The `custom` shape provides a callback function that receives the canvas 2D context and must draw the node manually. This is the most powerful but most complex approach.

**How `ctxRenderer` works:**

```javascript
{
  shape: "custom",
  ctxRenderer: function({ ctx, id, x, y, state: { selected, hover }, style, label }) {
    // 1. Calculate dimensions
    const r = style.size;

    // 2. Draw the node shape using canvas 2D API
    ctx.beginPath();
    ctx.fillStyle = selected ? "#ff0000" : "#2a9d8f";
    ctx.strokeStyle = "#1f7a6f";
    ctx.lineWidth = 2;

    // Example: draw a custom PCB-board shape
    ctx.rect(x - r, y - r * 0.7, r * 2, r * 1.4);
    ctx.fill();
    ctx.stroke();

    // Draw connector pins at bottom
    for (let i = -r + 4; i < r; i += 8) {
      ctx.fillStyle = "#8b949e";
      ctx.fillRect(x + i, y + r * 0.7, 4, 8);
    }

    // 3. Return required structure
    return {
      drawNode() {},           // called below arrows
      drawExternalLabel() {},  // called above arrows (for labels)
      nodeDimensions: { width: r * 2, height: r * 1.4 + 8 },
    };
  }
}
```

**The return object must contain:**
- `drawNode()` — function that draws the node (called in the "below arrows" layer)
- `drawExternalLabel()` — function for labels outside the node boundary (called in the "above arrows" layer)
- `nodeDimensions: { width, height }` — tells vis-network the node's bounding box for edge connections and hit testing

**Drawing pre-rasterized SVG images inside `ctxRenderer`:**

You can combine `ctxRenderer` with pre-loaded `Image` objects to draw SVGs on canvas:

```javascript
// Pre-load the SVG as an Image object (do this once at init)
const pcbImg = new Image();
pcbImg.src = svgToDataUri(pcbSvgString);

// In ctxRenderer:
ctxRenderer: function({ ctx, x, y, style }) {
  const r = style.size;
  return {
    drawNode() {
      ctx.drawImage(pcbImg, x - r, y - r, r * 2, r * 2);
    },
    drawExternalLabel() {},
    nodeDimensions: { width: r * 2, height: r * 2 },
  };
}
```

**When to use `ctxRenderer`:**
- When you need dynamic visuals that change based on state (selected, hover)
- When you need pixel-perfect control over hit areas
- When you need composite drawings (icon + decorations + badges)

**When NOT to use `ctxRenderer`:**
- For simple icon swaps — `shape: "image"` with data URIs is far simpler
- When you don't need dynamic drawing — the image shape handles selected/hover highlighting automatically

### 1.5 Recommended Approach for This Project

**Primary: `shape: "image"` with SVG data URIs.**

Rationale:
- Simplest implementation — just set `image` property on groups or nodes
- SVGs scale cleanly at any zoom level (rendered as vector by the browser before being drawn to canvas)
- vis-network handles selection highlighting, hover effects, and label positioning automatically
- Supports `brokenImage` fallback for error resilience
- Each SVG icon is a self-contained string — no external files, no font loading, no canvas drawing code
- The `size` property controls the rendered size, working the same as for other shape types

**Fallback: `shape: "custom"` with `ctxRenderer`** — only if `image` shapes prove insufficient for specific visual requirements (e.g., dynamic color changes on hover that go beyond vis-network's built-in highlighting).

### 1.6 Performance Considerations

| Approach | Initial Load | Render Performance | Memory |
|---|---|---|---|
| Data URI SVG (`shape: "image"`) | Fast (no network) | Good — rasterized once per zoom level | Low — one Image object per unique icon |
| External SVG file (`shape: "image"`) | Network request per unique file | Same as data URI after load | Same |
| `ctxRenderer` with canvas drawing | None | Slightly higher CPU — redraws every frame | Lowest |
| `ctxRenderer` with `drawImage()` | Same as data URI | Good — same as image shape | Same as data URI |
| `shape: "icon"` with icon font | Font download (~100KB) | Excellent — native text rendering | Very low |

**For ~50–100 nodes with 6 unique icon types:** All approaches perform identically. Data URI SVGs are the best balance of simplicity and performance. The icons are encoded inline in JS — zero network requests, instant availability.

---

## 2. vis-network Per-Node Shape Override

### 2.1 Can Individual Nodes Override Group Shapes?

**Yes.** Per the vis-network documentation:

> _"Options defined in the global nodes object, are applied to all nodes. If a node has options of its own, those will be used instead of the global options."_

And:

> _"When not undefined, the node will belong to the defined group. Styling information of that group will apply to this node. Node specific styling overrides group styling."_

**Priority order** (highest to lowest):
1. Per-node options (set directly on the node object)
2. Group options (set in `options.groups[groupName]`)
3. Global node options (set in `options.nodes`)

### 2.2 Male vs. Female Creator Icons in the Same Group

A creator node in group `"creator"` can override the group's `image` property with a per-node `image`:

```javascript
// Group config — sets default (gender-neutral) icon for all creators
const GROUP_CONFIG = {
  creator: {
    shape: "image",
    image: svgToDataUri(neutralSilhouetteSvg),  // default fallback
    size: 18,
    // ... color, font config
  },
};

// Node data — per-node image overrides the group default
const nodes = [
  {
    id: "yu-suzuki",
    label: "Yu Suzuki",
    group: "creator",
    gender: "male",
    image: svgToDataUri(maleSilhouetteSvg),  // overrides group image
  },
  {
    id: "rieko-kodama",
    label: "Rieko Kodama",
    group: "creator",
    gender: "female",
    image: svgToDataUri(femaleSilhouetteSvg),  // overrides group image
  },
  {
    id: "unknown-creator",
    label: "Unknown",
    group: "creator",
    // no image override → uses group default (neutral silhouette)
  },
];
```

**Implementation strategy:**
1. Add a `gender` field to creator nodes in `nodes.json` (`"male"`, `"female"`, or omitted/null)
2. At load time (in `app.js`), iterate the node data and assign `image` based on `gender`:

```javascript
// In app.js, before passing nodes to createGraph():
const CREATOR_ICONS = {
  male: svgToDataUri(maleSilhouetteSvg),
  female: svgToDataUri(femaleSilhouetteSvg),
  default: svgToDataUri(neutralSilhouetteSvg),
};

nodesData.forEach(node => {
  if (node.group === "creator") {
    node.image = CREATOR_ICONS[node.gender] || CREATOR_ICONS.default;
  }
});
```

3. The group config sets `shape: "image"` — the per-node `image` property does the differentiation
4. You do NOT need separate groups (e.g., `creator-male`, `creator-female`) — one group with per-node image overrides is cleaner and preserves filter/legend consistency

### 2.3 Alternative: Separate Sub-Groups

An alternative is to create sub-groups (`creator-male`, `creator-female`) that each define their own icon. This works but:
- Complicates filtering (the filter toggle for "creators" must now handle multiple group names)
- Complicates the legend (multiple entries for conceptually one category)
- **Not recommended** — per-node `image` override is simpler and keeps group semantics clean

---

## 3. CSS CRT Scanline Overlay Technique

### 3.1 Recommended Approach: `::after` with `repeating-linear-gradient`

**This is the best approach for a static HTML/CSS project.** Pure CSS, no extra assets, no JavaScript, excellent performance.

```css
/* Scanline overlay — covers entire viewport */
body::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;                    /* above everything */
  pointer-events: none;             /* critical: clicks pass through */

  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 1px,
    rgba(0, 0, 0, 0.07) 1px,        /* 7% opacity — within 6–8% spec range */
    rgba(0, 0, 0, 0.07) 2px         /* 2px line spacing as spec requires */
  );
}
```

**Why this is best:**
- Zero external assets
- GPU-composited (the fixed-position element gets its own compositing layer)
- Trivially adjustable: change opacity, line width, spacing
- Works across all modern browsers
- No JavaScript required

### 3.2 Alternative: Tiny Transparent PNG Pattern

```css
body::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAADklEQVQI12NgYGBIBAABEgBhbCmn3QAAAABJRU5ErkJggg==");
  background-repeat: repeat;
  opacity: 0.07;
}
```

The PNG is a 1×2 pixel image (one transparent pixel, one black pixel). When tiled, it creates a scanline pattern.

**Pros:** Slightly more authentic retro look (pixel snapping).
**Cons:** Extra asset (even as data URI), slightly less adjustable, the repeating gradient approach is equivalent quality.

### 3.3 Alternative: SVG Pattern Background

```css
body::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='2'%3E%3Crect width='1' height='1' y='1' fill='%23000' fill-opacity='0.07'/%3E%3C/svg%3E");
  background-repeat: repeat;
}
```

**Pros:** Vector-based, adjustable.
**Cons:** More complex syntax than the gradient. No meaningful advantage over the gradient approach.

### 3.4 Critical: `pointer-events: none`

The overlay **must** have `pointer-events: none` to prevent it from intercepting clicks, drags, and scroll events on the graph and other UI elements. Without this, the overlay becomes a click-blocking wall.

```css
pointer-events: none;  /* REQUIRED — without this, nothing below is clickable */
```

This is universally supported in modern browsers (IE11+, all evergreen browsers).

### 3.5 Mobile Considerations

On small screens, 2px scanlines can merge into a visible tint that reduces contrast. Options:

```css
/* Disable scanlines on small viewports */
@media (max-width: 768px) {
  body::after {
    display: none;
  }
}

/* OR: reduce opacity on mobile */
@media (max-width: 768px) {
  body::after {
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 2px,
      rgba(0, 0, 0, 0.04) 2px,      /* reduced from 7% to 4% */
      rgba(0, 0, 0, 0.04) 4px        /* wider spacing: 4px instead of 2px */
    );
  }
}
```

**Recommendation:** Keep scanlines on mobile at reduced intensity (4% opacity, 4px spacing) rather than disabling entirely, to maintain the retro aesthetic.

### 3.6 Performance Impact

- **GPU compositing**: A `position: fixed` element with `pointer-events: none` gets its own compositor layer. The gradient is rasterized once and composited by the GPU — near-zero performance impact.
- **No repaints**: The overlay doesn't change, so it never triggers repaints.
- **Memory**: One compositor layer for the overlay (~viewport width × height × 4 bytes). Negligible.
- **Scrolling**: Since the element is `position: fixed`, it doesn't move with scroll — no scroll-linked repainting.
- **One caveat**: If you use `will-change: transform` or `transform: translateZ(0)` to force layer promotion, the layer is guaranteed to be GPU-composited. However, `position: fixed` already promotes in all modern browsers, so this is unnecessary.

**Total overhead**: Approximately 1–2 MB of GPU texture memory for a 1920×1080 viewport. No measurable FPS impact.

### 3.7 Complete Recommended Implementation

```css
/* CRT Scanline Overlay — Mega Drive aesthetic */
body::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 1px,
    rgba(0, 0, 0, 0.07) 1px,
    rgba(0, 0, 0, 0.07) 2px
  );
}

/* Reduce scanline intensity on small screens */
@media (max-width: 768px) {
  body::after {
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 2px,
      rgba(0, 0, 0, 0.04) 2px,
      rgba(0, 0, 0, 0.04) 4px
    );
  }
}
```

---

## 4. Press Start 2P Font Loading

### 4.1 Font Overview

- **Name**: Press Start 2P
- **Designer**: CodeMan38
- **License**: SIL Open Font License (OFL) — free for commercial and personal use
- **Weights**: Regular 400 only (single weight)
- **Character set**: Latin, Latin Extended, Cyrillic
- **Style**: Pixel/bitmap aesthetic, 8×8 pixel grid, reminiscent of NES/SEGA title screens
- **File size**: ~17KB WOFF2

### 4.2 CDN Loading (Recommended for This Project)

Since the project already loads vis-network from a CDN (unpkg), using Google Fonts CDN is consistent and simplest:

```html
<!-- In <head>, before styles.css -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
      rel="stylesheet">
```

**Key details:**

1. **`display=swap`** — The `font-display: swap` descriptor tells the browser to show fallback text immediately (FOUT — Flash of Unstyled Text) and swap to Press Start 2P once loaded. This prevents invisible text (FOIT) and meets the 3-second performance budget.

2. **`preconnect`** — The two `<link rel="preconnect">` hints establish early TCP/TLS connections to Google's font servers, shaving 100–300ms off font load time.

3. **Load order** — Place the font link **before** `styles.css` so the CSS `@font-face` rule is parsed and the font download starts before the stylesheet needs it.

### 4.3 Self-Hosted Alternative

Download the WOFF2 file from Google Fonts and serve it locally:

```css
/* In styles.css */
@font-face {
  font-family: "Press Start 2P";
  src: url("../fonts/PressStart2P-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

**Pros:** No external dependency, works fully offline, no privacy/GDPR concerns (no Google Fonts tracking).
**Cons:** Must manage the font file in the repository; slightly more setup.

**For this project:** CDN is simpler and consistent with the existing CDN-based architecture (vis-network from unpkg). Self-hosting is a reasonable alternative if offline capability is needed later.

### 4.4 Font-Display Strategy

| Value | Behavior | Recommendation |
|---|---|---|
| `swap` | Shows fallback immediately, swaps when font loads | **Use this** — ensures text is always visible |
| `block` | Invisible text for up to 3s, then shows fallback | Not recommended — risk of blank headings |
| `fallback` | Brief invisible period (~100ms), then fallback, short swap window | Good alternative, less jarring swap |
| `optional` | Brief invisible, fallback if not cached, no swap | Too aggressive — font may never show on first visit |

**Recommendation: `swap`** — Trading a brief visual flash (fallback → retro font) for guaranteed readability. The flash is brief and on a dark background is barely noticeable.

### 4.5 CSS Usage

```css
:root {
  --font-retro: "Press Start 2P", "Courier New", monospace;
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Headings, UI chrome — retro font */
.app-title,
.legend-item,
.filter-checkbox,
.detail-panel h2,
.expand-all-btn {
  font-family: var(--font-retro);
}

/* Body text — readable font (unchanged) */
.detail-content p,
.detail-content ul {
  font-family: var(--font-body);
}
```

**Font sizing note:** Press Start 2P renders larger than most fonts at the same pixel size due to its bitmap proportions. You'll likely need to **reduce font sizes** by 20–40% compared to current values. For example, the `.app-title` at `1.25rem` would look oversized — try `0.85rem` or `0.75rem`.

### 4.6 Graceful Degradation

If Press Start 2P fails to load (CDN down, network error), the CSS `font-family` stack falls through to `"Courier New"` (monospace) and then to the system default monospace font. Both are adequate fallbacks that maintain a somewhat technical/retro feel.

No JavaScript font-loading detection is needed — `font-display: swap` handles degradation natively.

---

## 5. Summary Decision Matrix

| Decision | Choice | Rationale |
|---|---|---|
| Node icon mechanism | `shape: "image"` + SVG data URIs | Simplest, scales cleanly, built-in fallback, no font/canvas complexity |
| Per-node differentiation (gender) | Per-node `image` property override | Preserves single group, avoids filter/legend complexity |
| CRT scanline overlay | `body::after` + `repeating-linear-gradient` | Pure CSS, GPU-composited, zero-asset, adjustable |
| Retro font loading | Google Fonts CDN with `display=swap` | Consistent with CDN architecture, `font-display: swap` for instant text |
| Fallback strategy | `brokenImage` for icons, font stack for typography, `@media` for scanlines | Graceful degradation at every layer |

---

## 6. Key Implementation Risks

1. **Firefox SVG rendering**: SVGs must have explicit `width`, `height`, and `xmlns` attributes on the root `<svg>` element. Missing these causes blank nodes in Firefox. Mitigation: validate all SVG icons during development in Firefox.

2. **SVG data URI encoding**: Characters like `#`, `<`, `>` must be properly encoded. Use `encodeURIComponent()` on the full SVG string. Do NOT use unencoded `#` in color values within the SVG — use `%23` or use `rgb()` notation instead.

3. **Font loading race condition**: If vis-network renders before Press Start 2P loads, node labels using the retro font will display in the fallback font and may not re-render when the font arrives. Mitigation: Use `font-display: swap` and keep node labels in the system font (only UI chrome uses the retro font).

4. **Scanline z-index conflicts**: The scanline overlay `z-index: 9999` must be higher than all other elements, including the detail panel and search suggestions. Verify against existing z-indices in the CSS.

5. **Image shape limitations**: vis-network's `image` shape doesn't tint the image on hover/select the way colored shapes do. Selected/hover states add a blue border/shadow by default. If custom hover coloring is needed, switch to `ctxRenderer`.
