# Mobile Layout Requirements Quality Checklist: Fix Mobile Layout & Detail Panel

**Purpose**: Validate completeness, clarity, and consistency of mobile layout requirements before implementation
**Created**: 2026-02-19
**Feature**: [spec.md](../spec.md)
**Focus**: Mobile bottom sheet, graph centering, z-index layering
**Depth**: Standard (~30 items)

## Requirement Completeness

- [x] CHK001 — Are requirements defined for all three user-reported mobile problems (panel overlap, legend peek-through, broken centering after close)? [Completeness, Spec §US-1, §US-2, §US-3]
- [x] CHK002 — Are loading/skeleton state requirements defined for detail panel content inside the bottom sheet? [Gap] → *Added edge case: sheet opens at 60% height, shows existing loading state*
- [x] CHK003 — Are requirements specified for the × close button's position, size, and tap target within the mobile bottom sheet? [Gap] → *Added FR-013: minimum 44×44px tap target per WCAG 2.5.8*
- [x] CHK004 — Does the spec define what "full available viewport" means for re-centering after panel close — is header height excluded? [Completeness, Spec §FR-005] → *Clarified: "viewport height minus header height"*
- [x] CHK005 — Are requirements defined for the bottom sheet's visual styling on mobile (border, shadow, background) beyond the border-top mentioned in research? [Gap, Research §R1] → *Visual styling is implementation detail; border-top documented in research §R1*

## Requirement Clarity

- [x] CHK006 — Is "approximately 50–60% of the viewport height" (FR-001) sufficiently precise for implementation, or should a single exact value (e.g., 60vh) be specified? [Clarity, Spec §FR-001] → *Changed to "60% (60vh, with 60dvh progressive enhancement)"*
- [x] CHK007 — Is "within 1 second" (FR-005) clear about whether it measures time-to-start-animation or time-to-complete-centering? [Clarity, Spec §FR-005] → *Clarified: "complete within 1 second of the close action (separate from 0.25s sheet-close animation)"*
- [x] CHK008 — Is "no perceptible offset" (SC-002) defined with a measurable pixel tolerance? [Clarity, Spec §SC-002] → *Changed to "no offset greater than 10px from true center"*
- [x] CHK009 — Does "at least 40% of the graph canvas remains visible" (SC-001) mean percentage of canvas area or percentage of viewport height above the sheet? [Clarity, Spec §SC-001] → *Rewritten: "at least 100px tall" with typical viewport example*
- [x] CHK010 — Is "fully hidden" for the legend bar (FR-003) unambiguous — does it mean visually invisible, `display: none`, or merely covered by a higher z-index element? [Clarity, Spec §FR-003] → *Clarified: "fully covered by the detail panel's higher z-index (panel z-index 20 over legend z-index 10)"*

## Requirement Consistency

- [x] CHK011 — Does the 60vh/60dvh height in research (R1/R2) align with the "50–60%" range stated in FR-001? The research commits to 60% while the spec allows 50–60%. [Consistency, Spec §FR-001 vs Research §R2] → *FR-001 now specifies "60%" matching research*
- [x] CHK012 — Do SC-001 ("40% visible") and FR-001 ("50–60% sheet") add up correctly when accounting for the header area? 40% + 60% = 100% but the header occupies additional space. [Consistency, Spec §SC-001 vs §FR-001] → *SC-001 rewritten with absolute pixel threshold (100px), no conflicting percentages*
- [x] CHK013 — Is the ≤767px breakpoint in FR-010 confirmed consistent with the existing CSS breakpoint in styles.css? [Consistency, Spec §FR-010] → *Confirmed in assumptions*
- [x] CHK014 — Are animation timing requirements consistent — US-1 §AS-1 specifies 0.25s ease, FR-005 specifies within 1s for re-centering. Are these for different interactions or could they conflict? [Consistency, Spec §US-1 vs §FR-005] → *Clarified in FR-005: "separate from the 0.25s sheet-close animation"*

## Acceptance Criteria Quality

- [x] CHK015 — Can SC-001 ("at least 40% of the graph canvas remains visible") be objectively automated in a test, given the graph is rendered on a canvas element? [Measurability, Spec §SC-001] → *Rewritten as pixel height check (≥100px), trivially measurable*
- [x] CHK016 — Can SC-003 ("no element layering glitches") be verified without subjective visual judgment? Are specific stacking scenarios enumerated? [Measurability, Spec §SC-003] → *Rewritten with 4 enumerated stacking scenarios (a–d)*
- [x] CHK017 — Is SC-007 ("orientation changes do not leave the graph off-center or the detail panel incorrectly sized") measurable — what constitutes "off-center" or "incorrectly sized"? [Measurability, Spec §SC-007] → *Quantified: "centered within 10px" and "resizes to 60% of new viewport height within 1 second"*

## Scenario Coverage

- [x] CHK018 — Are requirements defined for the transition when the browser is resized across the 767px breakpoint while the detail panel is open? [Coverage, Gap] → *Added edge case: transitions on next open/close cycle, graceful degradation*
- [x] CHK019 — Are requirements specified for the bottom sheet behavior when the phone rotates while the panel is open (not just after close per FR-011)? [Coverage, Spec §FR-011] → *Expanded FR-011: sheet resizes to 60% of new viewport, graph re-centers above*
- [x] CHK020 — Is the interaction between ego-graph spotlight mode and the bottom sheet's vertical offset fully specified for all states (first open, node switch, expand all)? [Coverage, Spec §FR-006] → *Expanded FR-006 with explicit state list*
- [x] CHK021 — Are requirements defined for "Expand All" button behavior when the bottom sheet is currently open on mobile? Does it close the sheet first or fit nodes above it? [Coverage, Gap] → *Added edge case: sheet closes, centering uses full viewport*
- [x] CHK022 — Are requirements specified for the graph state when the user taps the graph area visible above the open bottom sheet (pan, zoom, tap another node)? [Coverage, Spec §FR-008] → *Already covered by FR-008 (touch events) and FR-009 (tap different node)*

## Edge Case Coverage

- [x] CHK023 — Is behavior specified for very tall viewports at exactly 767px width (e.g., tall tablet in portrait) where 60vh produces a very large sheet? [Edge Case, Spec §FR-001] → *Acceptable: 60vh scales proportionally; content scrolls per FR-004*
- [x] CHK024 — Are requirements defined for the case when the device virtual keyboard opens while the bottom sheet is visible (e.g., user taps search)? [Edge Case, Gap] → *Added edge case: sheet stays at CSS height, keyboard handled by browser, search takes z-index priority*
- [x] CHK025 — Is fallback behavior specified for browsers that don't support `dvh` units, or is this an implementation detail outside spec scope? [Edge Case, Gap — addressed in Research §R2 but not in spec] → *Added assumption: vh fallback produces minor ~3–5% variance, acceptable*
- [x] CHK026 — Is the minimum readable content area within the bottom sheet defined for screens ≤320px wide, beyond the "up to 65% height" mentioned in edge cases? [Edge Case, Spec §Edge Cases] → *Covered: SC-004 requires readable content on 320px; edge case allows up to 65% height*

## Non-Functional Requirements

- [x] CHK027 — Are touch target size requirements specified for the × close button on mobile (minimum 44×44px per WCAG 2.5.8)? [Accessibility, Gap] → *Added FR-013*
- [x] CHK028 — Are screen reader announcement requirements defined for bottom sheet open/close state changes (e.g., ARIA live region, role="dialog")? [Accessibility, Gap] → *Added FR-015: aria-expanded or equivalent*
- [x] CHK029 — Are animation performance requirements stated (e.g., GPU-composited transforms only, 60fps target)? [Performance, Gap — addressed in Research §R6 but not in spec] → *Added assumption: CSS transform only, GPU-composited, no layout reflow*
- [x] CHK030 — Are `prefers-reduced-motion` requirements defined — should the 0.25s slide animation be disabled or reduced for users who request it? [Accessibility, Gap] → *Added FR-014: animation suppressed when prefers-reduced-motion: reduce*

## Dependencies & Assumptions

- [x] CHK031 — Is the assumption that vis-network auto-resizes its canvas on container dimension change validated and documented as a dependency? [Assumption, Spec §Assumptions] → *Added assumption with explicit note: auto-resizes canvas but does NOT auto-center*
- [x] CHK032 — Is the hardcoded `110px` mobile header height referenced in assumptions documented as a fragile dependency that could break the bottom sheet positioning? [Dependency, Spec §Assumptions] → *Already in assumptions; noted as fragile dependency*

## Notes

- Existing [requirements.md](requirements.md) covers general spec quality; this checklist specifically audits the **mobile layout requirements** for completeness, clarity, and consistency.
- All 32 items resolved. Key spec changes: FR-001 pinned to 60%, SC-001/002/003/007 quantified, FR-013–015 added (accessibility), 5 new edge cases, 4 new assumptions.
