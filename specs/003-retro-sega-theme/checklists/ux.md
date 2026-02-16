# UX & Visual Requirements Quality Checklist: Retro SEGA Visual Theme

**Purpose**: Validate that visual/UX requirements in the spec are complete, clear, consistent, measurable, and free of gaps before implementation begins
**Created**: 2026-02-16
**Feature**: [spec.md](../spec.md)
**Focus**: Visual/UX requirements, accessibility, icon specifications, scanline/theme definitions
**Depth**: Standard
**Audience**: Author (self-review)

---

## Requirement Completeness

- [x] CHK001 — Are exact hex color values specified for all 7 icon variants, or is the spec relying on data-model.md as the canonical source? **RESOLVED**: FR-001 now inlines hex values (#2a9d8f, #e9a820, #7b2d8e, #457b9d, #e63946) and cross-references data-model.md as canonical source.
- [x] CHK002 — Are node icon dimensions (rendered pixel size in the graph, not just viewBox) specified for vis-network rendering? **ACCEPTED**: Rendered pixel sizes are determined by GROUP_CONFIG `size` property (30/20/18/14/18px per group). This is an implementation detail delegated to plan.md; spec defines 64×64 viewBox for crisp scaling at any size.
- [x] CHK003 — Are loading/fallback states defined for when Press Start 2P font fails to load or is still loading? **RESOLVED**: FR-008 now includes: "If the retro font fails to load, the application MUST fall back to a system monospace font stack without breaking the layout."
- [x] CHK004 — Are dark theme color values specified for all UI chrome surfaces (header, filter toolbar, detail panel, search box)? **ACCEPTED**: The existing app already uses CSS custom properties (`--color-*`) for dark theme. Spec requires `#000` body background (FR-006) and consistent Mega Drive palette (US2:AS4). Individual chrome hex values are implementation details inheriting from the existing variable system.
- [x] CHK005 — Is the detail panel badge color update addressed in requirements? **ACCEPTED**: Badge colors inherit from the existing `--color-*` CSS variable system. No FR needed — plan.md correctly marks `detail-panel.js` as "MINOR" since badges auto-inherit theme changes via CSS variables. No behavioral change required.
- [x] CHK006 — Are requirements defined for the gender-neutral icon acceptance scenario? **RESOLVED**: FR-001 now includes "creators without gender data as a gender-neutral head silhouette". FR-004 provides the fallback rule. Edge case section documents the neutral fallback behavior. T004 tests the neutral fallback path.

## Requirement Clarity

- [x] CHK007 — Is the 6–8% scanline opacity range sufficiently precise, or should a single target value be specified? **ACCEPTED**: The 6–8% range provides intentional creative flexibility. Tasks.md resolves to 7% (T008), which is within the specified range. This is a visual/creative parameter where ±1% is imperceptible.
- [x] CHK008 — Is "SEGA blue (#0044FF or similar)" in FR-016 specific enough, or does "or similar" introduce ambiguity? **RESOLVED**: Analysis fix already removed "or similar" from FR-016. Now reads: "#0044FF" exactly.
- [x] CHK009 — Is "retro-styled hover/focus feedback effects" in FR-010 quantified with specific visual parameters (glow radius, color shift delta, timing)? **ACCEPTED**: FR-010 intentionally provides illustrative examples ("e.g., color shift, subtle glow, or pixel-border highlight") for a creative visual feature. Exact CSS values are implementation details delegated to T012. The "retro" aesthetic cannot be reduced to a single parameter set.
- [x] CHK010 — Is "immediately recognizable" for the SEGA logo approximation defined with measurable criteria? **ACCEPTED**: Exact visual criteria for a hand-drawn approximation cannot be quantified objectively. SC-008 (3 independent viewers identify "retro/SEGA-like") provides the validation gate. The Assumptions section defines the boundary: "original artwork inspired by the lettering style, not a traced copy."
- [x] CHK011 — Are "miniature version" dimensions for legend and filter toolbar icons specified? **ACCEPTED**: Sizing delegated to implementation. Tasks.md (T016) resolves to 16×16px for legend, 14×14px for filter. Spec FR-005/FR-011 correctly focus on the what (miniature icons replace color swatches) not the how (pixel dimensions).

## Requirement Consistency

- [x] CHK012 — Are icon color definitions consistent between spec.md (FR-001: "green", "amber"), data-model.md (#2a9d8f, #e9a820), and quickstart.md? **RESOLVED**: FR-001 now inlines hex values and cross-references data-model.md. All three artifacts are now consistent.
- [x] CHK013 — Is the font fallback chain consistent between the Assumptions section ("system monospace") and any CSS implementation guidance? **CONSISTENT**: Assumptions say "system monospace". Tasks.md (T011) defines `--font-retro: "Press Start 2P", monospace`. The CSS `monospace` keyword maps to the system monospace font. Consistent.
- [x] CHK014 — Are the edge hover color values consistent between spec.md (FR-016: "subtle neon glow") and research.md (#4488FF brighter hover)? **CONSISTENT**: The spec defines the desired effect (qualitative: "subtle neon glow on hover"). Research.md provides the technical implementation approach (#4488FF + hoverWidth:3). This is the intended spec→research→implementation pipeline — not an inconsistency.

## Acceptance Criteria Quality

- [x] CHK015 — Can SC-002 ("first-time visitor can correctly identify at least 4 out of 5 categories by icon alone within 10 seconds") be objectively measured without user testing? **ACCEPTED**: SC-002 is an aspirational usability criterion that requires manual validation. It is appropriately labeled as a "Measurable Outcome" (measurable = can be measured, not = can be automated). Automated QUnit tests validate icon rendering; SC-002 validates icon recognizability — a separate concern.
- [x] CHK016 — Can SC-008 ("at least 3 independent viewers identify the style as retro/arcade/SEGA-like") be objectively measured? **ACCEPTED**: SC-008 is a manual validation criterion. Same rationale as CHK015 — automated tests verify rendering correctness; SC-008 validates aesthetic intent. Both are valid quality gates at different levels.
- [x] CHK017 — Is SC-007 ("loads within the existing 3-second performance budget") defined against a specific measurement method (e.g., LCP, DOMContentLoaded, network conditions)? **RESOLVED**: SC-007 now specifies: "measured as time from navigation start to vis-network `stabilizationIterationsDone` event on a standard broadband connection."

## Scenario Coverage

- [x] CHK018 — Are requirements specified for the `prefers-reduced-motion` media query to disable or reduce the scanline overlay? **RESOLVED**: New FR-017 added: "The scanline overlay MUST be disabled when the user's system indicates `prefers-reduced-motion: reduce`." T009 implements this via `@media (prefers-reduced-motion: reduce)`.
- [x] CHK019 — Are mobile/responsive breakpoint requirements defined for scanline density, icon sizing, and retro font scaling? **RESOLVED**: FR-017 now also specifies: "On viewports narrower than 480px, the scanline overlay MUST be hidden or reduced in opacity to preserve readability." T009 implements this. Icon sizing and font scaling are handled by existing responsive CSS and the vis-network zoom system.
- [x] CHK020 — Does the spec define behavior when the graph contains zero creator nodes or all creators lack gender data? **ACCEPTED**: FR-004 covers the per-node fallback ("gender-neutral fallback for records without gender information"). If all creators lack gender, all get neutral icons — this is the correct aggregate behavior derived from the per-node rule. No special aggregate case needed.
- [x] CHK021 — Are requirements defined for edge label font and color against the black background with SEGA blue edges? **ACCEPTED**: FR-016 requires "Edge labels MUST remain legible against the black background." The existing edge font config (`color: "#8b949e"`, `strokeColor: "#0d1117"`, `strokeWidth: 3`) provides legible contrast. No spec change needed — existing styling meets the requirement.

## Edge Case Coverage

- [x] CHK022 — Is the SVG fallback detection mechanism defined (how/when does the system decide SVG is unsupported)? **N/A**: FR-014 (SVG fallback) was removed per user decision. No fallback image is desired. All target browsers (Chrome, Firefox, Safari, Edge) support SVG data URIs.
- [x] CHK023 — Is the scanline behavior on the detail panel overlay specified (should scanlines render over the detail panel content or be clipped)? **ACCEPTED**: The `body::after` overlay with `z-index: 9999` + `pointer-events: none` intentionally renders scanlines over ALL content, including the detail panel. This is the desired CRT effect — the entire viewport looks like a CRT screen. FR-007/SC-003 ensure text remains legible through the overlay.
- [x] CHK024 — Are hover glow rendering limitations on canvas-rendered edges acknowledged and alternatives specified? **ACCEPTED**: Research.md §5 documents that CSS box-shadow is unavailable on canvas-rendered edges. Tasks.md (T005) and notes section document the approximation: `hoverWidth: 3` + brighter hover color (#4488FF). The spec's "subtle neon glow" is correctly implemented as a canvas-compatible approximation.

## Non-Functional Requirements

- [x] CHK025 — Are WCAG AA contrast ratio requirements explicitly quantified for all text-on-background combinations with the scanline overlay active? **ALREADY SPECIFIED**: SC-003 explicitly states: "4.5:1 for normal text, 3:1 for large text" — these ARE the WCAG AA thresholds. The existing color palette (light text on #000 background) exceeds these ratios even with a 7% opacity scanline overlay.
- [x] CHK026 — Are keyboard focus indicator requirements defined for retro-styled interactive elements? **ACCEPTED**: FR-010 covers "hover/focus feedback effects". T012 explicitly implements `:focus-visible` indicators with retro styling. Constitution Principle V (WCAG 2.1 AA) implicitly requires visible focus indicators.
- [x] CHK027 — Is the performance impact of 7 SVG data URI icons on initial parse/render addressed in requirements? **ACCEPTED**: 7 inline SVG icons as `encodeURIComponent()` data URIs add ~5–10KB to the JS bundle with zero additional network requests. SC-007 validates the 3-second performance budget. Impact is negligible compared to the vis-network library (~95KB gzipped).

## Dependencies & Assumptions

- [x] CHK028 — Is the Google Fonts CDN dependency documented as a runtime requirement with a fallback strategy if the CDN is unreachable? **RESOLVED**: FR-008 now includes the fallback clause: "If the retro font fails to load, the application MUST fall back to a system monospace font stack without breaking the layout." Google Fonts uses `display=swap` which renders system font immediately, loading retro font async.
- [x] CHK029 — Is the Wikidata P21 sourcing for gender data validated for all 5 current creators, and is the process for adding future creators documented? **ACCEPTED**: data-model.md documents all 5 creators with their Wikidata Q-IDs and P21 values. The data sourcing process follows Constitution Principle VI (Wikipedia as Single Source of Truth). Future creators follow the same pattern — documented in data-model.md.

## Ambiguities & Conflicts

- [x] CHK030 — Does "hand-drawn SVG approximation" for the SEGA logo have acceptance criteria distinguishing it from a trademark-infringing copy? **ACCEPTED**: Assumptions section defines: "original artwork inspired by the lettering style, not a traced copy of the official logo." SC-008 validates that the overall aesthetic reads as "SEGA-like." Exact trademark boundary is a legal concern beyond spec scope — the "inspired by, not traced" guidance is the appropriate spec-level distinction.

---

## Notes

- 30 items total across 9 quality dimensions — **30/30 PASS**
- Resolution breakdown: 8 items fixed in spec.md, 1 N/A (FR-014 removed), 21 accepted with rationale
- Spec changes applied: FR-001 (hex colors + cross-ref), FR-008 (font fallback), FR-017 (new: reduced-motion + mobile scanline), SC-007 (measurement method)
- CHK008 (FR-016 "or similar") was pre-resolved by the analysis remediation pass
- CHK022 (SVG fallback) marked N/A: FR-014 was removed per user decision — no fallback image desired
