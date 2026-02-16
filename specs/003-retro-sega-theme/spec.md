# Feature Specification: Retro SEGA Visual Theme

**Feature Branch**: `003-retro-sega-theme`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "Verandering van het visuele uiterlijk: legenda en nodes aanpassen met representatieve iconen (arcade PCB groen, man/vrouw silhouet, Japans kantoortje voor studio's, SEGA logo voor het bedrijf). Vectoren (SVG) als mogelijk. SEGA look-and-feel: zwarte achtergrond met scanline rasters in Mega Drive stijl. Challenge: maak het zo authentiek mogelijk als begin-jaren-'90 SEGA."

## Clarifications

### Session 2026-02-16

- Q: Should game nodes also get a thematic icon instead of a plain square? → A: Yes — game nodes should display as an arcade PCB/motherboard with a JAMMA edge connector, representing the physical game boards that plug into arcade cabinets.
- Q: How should the SEGA company node logo be handled given trademark concerns? → A: Use a hand-drawn SVG approximation of the SEGA italic block letter style — immediately recognizable while avoiding trademark issues.
- Q: Which retro font should be used for headings and UI chrome? → A: Press Start 2P (Google Font, OFL license) — pixel-perfect at any size, matches SEGA Genesis/Mega Drive title screen aesthetics.
- Q: How intense should the scanline overlay be? → A: Moderate (6–8% opacity, 2px line spacing) — clearly visible CRT effect while maintaining WCAG AA text contrast.
- Q: Should graph edges also adopt the retro theme? → A: Yes — SEGA blue edges with subtle glow on hover for full retro integration, matching the neon-on-black Mega Drive aesthetic.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Distinctive Node Icons per Category (Priority: P1)

A visitor opens the application and immediately recognizes each node type by its unique icon shape rather than by generic geometric shapes. Arcade platforms appear as green PCB-board silhouettes, creators show as head silhouettes (with male/female distinction), internal studios display as small Japanese-style office buildings, and the SEGA company node uses the iconic SEGA logo. The legend at the bottom updates to reflect these new icons, making the graph instantly readable.

**Why this priority**: The node icons are the core visual identity change. Without them, the graph looks generic. These icons make each category self-explanatory and elevate the experience from a technical diagram to a themed SEGA visualization.

**Independent Test**: Open the application in a browser and verify that each node category renders with its unique icon. Confirm the legend bar shows corresponding icons next to each category name. Verify male and female creators display different silhouettes.

**Acceptance Scenarios**:

1. **Given** the graph loads, **When** the visitor sees an arcade platform node, **Then** it is rendered as a green-tinted system-board icon (larger, multi-chip layout), clearly distinct from the smaller game PCB icon.
2. **Given** the graph loads, **When** the visitor sees a male creator node, **Then** it is rendered as a male head silhouette in the creator color.
3. **Given** the graph loads, **When** the visitor sees a female creator node, **Then** it is rendered as a female head silhouette visually distinct from the male variant (e.g., different hair contour).
4. **Given** the graph loads, **When** the visitor sees an internal studio node, **Then** it is rendered as a small Japanese-style office building icon.
5. **Given** the graph loads, **When** the visitor sees the SEGA company node, **Then** it is rendered using the SEGA logo mark.
6. **Given** the graph loads, **When** the visitor sees a game node, **Then** it is rendered as an arcade PCB/motherboard icon with a visible JAMMA edge connector, in the game category color.

---

### User Story 2 — SEGA Mega Drive Dark Theme with Scanlines (Priority: P2)

A visitor opens the application and experiences a dark theme reminiscent of the SEGA Mega Drive/Genesis era. The background is black with a subtle scanline raster overlay — horizontal lines evocative of a CRT monitor — giving the entire interface a retro arcade-screen feel. The scanlines are visible but do not interfere with readability of graph elements, text, or the detail panel.

**Why this priority**: The dark scanline theme ties the entire visual experience together and gives the viewer the immediate feeling of looking at a retro SEGA screen. Without it, the individual node icons alone would feel like scattered improvements rather than a cohesive retro makeover.

**Independent Test**: Open the application. The background must be black (not just dark grey). Horizontal scanline patterns should be faintly visible across the entire viewport. Text and graph nodes remain clearly readable. The detail panel and header also follow the dark theme without scanlines obscuring content.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the visitor views the application, **Then** the background is solid black (#000 or very close) with a repeating horizontal scanline effect overlaid.
2. **Given** the scanlines are active, **When** the visitor reads node labels, legend text, or detail panel content, **Then** all text remains legible with sufficient contrast.
3. **Given** the scanlines are active, **When** the visitor interacts with the graph (drag, zoom, click), **Then** the scanline overlay does not capture pointer events or interfere with interactions.
4. **Given** the page loads, **When** the visitor views the header, filter toolbar, and legend bar, **Then** these UI elements use the dark theme palette consistent with the Mega Drive aesthetic.

---

### User Story 3 — Retro SEGA Typography and UI Chrome (Priority: P3)

A visitor notices that the entire user interface evokes the early-'90s SEGA arcade era through carefully chosen typography and UI details. The application title, header, and UI controls use a blocky, retro-styled font reminiscent of SEGA system menus and arcade attract screens. Borders, highlights, and accent elements reference the distinctive blue-and-white palette of SEGA master branding. Interactive elements (buttons, inputs, links) carry subtle retro styling such as pixel-edged borders or neon-glow hover effects typical of arcade cabinet menus.

**Why this priority**: Typography and chrome details are the finishing touches that sell the retro illusion. While functional without them, the experience goes from "themed graph" to "this could be a SEGA product" when every UI detail aligns with the era.

**Independent Test**: Open the application and verify the header font, filter checkboxes, search input, and detail panel headings all use retro-styled typography. Hover over interactive elements and confirm they have arcade-inspired feedback effects.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the visitor reads the application title, **Then** it is rendered in a blocky, retro-style font consistent with early-'90s SEGA arcade aesthetics.
2. **Given** the page loads, **When** the visitor views the filter toolbar, search box, and legend bar, **Then** these elements carry the retro SEGA theme with matching font and color choices.
3. **Given** the visitor hovers over a button or interactive element, **When** the hover state activates, **Then** it produces a subtle retro-styled visual effect (e.g., color shift, glow, or pixel-border highlight).
4. **Given** the detail panel is open, **When** the visitor reads content, **Then** the body text remains clear and legible in a complementary font, while headings match the retro style.

---

### User Story 4 — Retro-Styled Legend with Icon Swatches (Priority: P4)

A visitor looks at the legend bar at the bottom of the screen and sees a redesigned legend. Instead of plain colored squares, each category shows a miniature icon matching the actual node shape used in the graph (PCB board, head silhouettes, building, logo). The legend itself is styled to match the retro SEGA aesthetic — dark background with subtle grid/raster texture, retro font.

**Why this priority**: The legend is the user's key to understanding the graph. Updating it to match the new icons ensures visual consistency. Without this, there would be a disconnect between what users see in the legend and what they see in the graph.

**Independent Test**: Open the application and verify the legend bar shows miniature icon representations for each category, not generic color squares. Confirm the legend styling matches the overall retro theme.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the visitor views the legend bar, **Then** the "Platform" entry shows a miniature green PCB icon instead of a plain square.
2. **Given** the page loads, **When** the visitor views the legend bar, **Then** the "Creator" entry shows a miniature head silhouette icon.
3. **Given** the page loads, **When** the visitor views the legend bar, **Then** the "Studio" entry shows a miniature Japanese-style office building icon.
4. **Given** the page loads, **When** the visitor views the legend bar, **Then** the "Company" entry shows a miniature SEGA logo mark.
5. **Given** the page loads, **When** the visitor views the legend bar, **Then** the "Game" entry shows a miniature amber PCB icon with JAMMA edge connector.
6. **Given** the page loads, **When** the visitor views the legend bar, **Then** the legend styling (font, background, borders) is consistent with the retro SEGA Mega Drive theme.

---

### Edge Cases

- What happens when a creator node has no gender specified in the data? The system defaults to a gender-neutral head silhouette icon.
- What happens on high-DPI (Retina) displays? The SVG icons scale crisply at any resolution without pixelation artifacts.
- What happens when the scanline overlay is viewed on a very small mobile screen? The scanline density adapts so lines do not merge into a solid tint; alternatively, scanlines are hidden on very small viewports to preserve readability.
- What happens with the game nodes? Game nodes display as an arcade PCB/motherboard with JAMMA edge connector in amber/orange, visually distinct from the green platform system-board icon.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each node category MUST render with a unique, representative vector icon: arcade platforms as a green (#2a9d8f) system-board silhouette, game titles as an amber (#e9a820) arcade PCB/motherboard with JAMMA edge connector, male creators as a purple (#7b2d8e) male head silhouette, female creators as a purple (#7b2d8e) female head silhouette, creators without gender data as a purple (#7b2d8e) gender-neutral head silhouette, internal studios as a blue (#457b9d) Japanese-style office building, and the SEGA company node as a red (#e63946) SEGA logo mark. Canonical color values are defined in [data-model.md](data-model.md).
- **FR-002**: All custom node icons MUST be implemented as scalable vector graphics so they render crisply at any zoom level and screen resolution.
- **FR-003**: The arcade platform nodes MUST use a green color scheme (fill and/or stroke) to visually reinforce their identity as circuit-board/PCB hardware.
- **FR-004**: Creator nodes MUST display a male or female head silhouette based on a gender attribute in the node data, with a gender-neutral fallback for records without gender information.
- **FR-005**: The legend bar MUST display a miniature version of each category's icon alongside the category label, replacing the current plain color swatches.
- **FR-006**: The application background MUST be black with a horizontal scanline raster overlay at 6–8% opacity with 2px line spacing, reminiscent of a CRT display, consistent with the SEGA Mega Drive dark aesthetic.
- **FR-007**: The scanline overlay MUST NOT intercept pointer events (clicks, drags, scrolls) and MUST NOT reduce text legibility below WCAG AA contrast requirements.
- **FR-008**: The application MUST use a retro-styled, blocky font for headings, the application title, and UI chrome (filter labels, legend text, button labels) that evokes early-'90s SEGA arcade interfaces. If the retro font fails to load, the application MUST fall back to a system monospace font stack without breaking the layout.
- **FR-009**: Body text (detail panel summaries, fact lists) MUST remain in a legible, clean font to ensure readability of longer content.
- **FR-010**: Interactive elements (buttons, inputs, links) MUST provide retro-styled hover/focus feedback effects (e.g., color shift, subtle glow, or pixel-border highlight).
- **FR-011**: The filter toolbar swatches MUST update to show miniature icons matching the new node representations, consistent with the legend.
- **FR-012**: Game nodes MUST render as an arcade PCB/motherboard icon with a visible JAMMA edge connector, visually distinct from the platform system-board icon through shape details (e.g., smaller form factor, prominent edge connector teeth) and color (amber/orange tint vs. green for platforms).
- **FR-013**: The node data model MUST include a gender attribute for creator nodes to support male/female silhouette distinction.
- **FR-015**: The visual theme changes MUST NOT alter the graph's interactive behavior (pan, zoom, drag, click-to-detail, filter, search) in any way.
- **FR-016**: Graph edges MUST use SEGA blue (#0044FF) as their base color and MUST display a subtle neon glow effect on hover, consistent with the neon-on-black Mega Drive menu aesthetic. Edge labels MUST remain legible against the black background.
- **FR-017**: The scanline overlay MUST be disabled when the user's system indicates `prefers-reduced-motion: reduce`. On viewports narrower than 480px, the scanline overlay MUST be hidden or reduced in opacity to preserve readability.

### Key Entities

- **Node Icon Set**: A collection of vector icon definitions, one per node category (platform system-board, game PCB with JAMMA connector, male head silhouette, female head silhouette, Japanese office building, SEGA logo mark). Each icon is scalable and used both in the graph and in the legend/filter UI.
- **Creator Gender Attribute**: A data property on creator nodes indicating male, female, or unspecified, used to select the appropriate head silhouette icon.
- **Scanline Overlay**: A visual layer spanning the full viewport that renders horizontal CRT-style lines at 6–8% opacity with 2px spacing, matching a typical 480i CRT density at modern monitor resolutions. It is non-interactive and purely cosmetic.
- **Retro Font**: "Press Start 2P" — a free Google Font (OFL license) used for headings and UI chrome. Pixel-style typeface that matches the chunky pixel fonts seen on SEGA Genesis/Mega Drive title screens and arcade attract modes.

## Assumptions

- The SEGA company node will use a hand-drawn SVG approximation of the iconic SEGA italic block letter style. This avoids trademark concerns while remaining immediately recognizable. The approximation will be original artwork inspired by the lettering style, not a traced copy of the official logo.
- Gender data for creators will be added to the existing node data set. Since all currently included creators are sourced from Wikipedia, gender information is publicly available. The vast majority of early SEGA arcade creators in the dataset are male; there may be few or no female creators in the initial data set, but the system will support both.
- The retro font "Press Start 2P" will be loaded from Google Fonts via a `<link>` tag or self-hosted as a static asset. It will fail gracefully to a system monospace font if loading fails. License: SIL Open Font License (OFL).
- The scanline effect is a pure CSS overlay and does not require canvas manipulation or modifications to the graph rendering library.
- The icons are authored as inline SVG or as data URIs embedded in CSS/JS — no external icon font or sprite sheet dependencies are required.
- The SEGA Mega Drive (Genesis) aesthetic is the primary visual reference: black backgrounds, horizontal scanlines, bold blue accents. The Master System's white aesthetic was considered but the user explicitly chose to keep the dark mode.
- "Retro SEGA" refers primarily to the 1988–1994 era: Mega Drive, System 16/Model 1/Model 2 arcade hardware, iconic blue branding, and CRT scanline visuals.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of node categories display their designated icon (platform system-board, game JAMMA PCB, head silhouette, building, SEGA logo) — verifiable by visual inspection of every node group in the graph.
- **SC-002**: A first-time visitor can correctly identify at least 4 out of 5 node categories by icon alone (without reading legend labels) within 10 seconds.
- **SC-003**: The scanline overlay is visible on the background at normal viewing distance but does not reduce text contrast below WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
- **SC-004**: The retro theme is applied consistently across all UI surfaces (header, filter bar, legend, detail panel, search) with no element reverting to the default styling.
- **SC-005**: All existing graph interactions (pan, zoom, drag, click-to-detail, filter toggle, search) continue to function identically to the pre-theme implementation.
- **SC-006**: SVG icons render crisply at zoom levels from 50% to 200% without blurriness or pixelation.
- **SC-007**: The complete visual theme loads within the existing 3-second performance budget (measured as time from navigation start to vis-network `stabilizationIterationsDone` event on a standard broadband connection) — no additional perceptible loading delay compared to the pre-theme version.
- **SC-008**: At least 3 independent viewers identify the visual style as "retro", "arcade", or "SEGA-like" without prompting when shown the application.
