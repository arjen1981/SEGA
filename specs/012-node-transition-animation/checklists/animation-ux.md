# Animation & UX Requirements Quality Checklist: Node Transition Animation

**Purpose**: Validate specification completeness, clarity, and consistency for the node transition animation feature  
**Created**: 2026-04-02  
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 - Are opacity start/end values explicitly specified for each node category (departing, arriving, shared, spotlight)? [Completeness, Spec §FR-002] — *data-model.md "Transition behavior per node category" table defines opacity at t=0 and t=1 for all categories*
- [x] CHK002 - Are opacity requirements for the old spotlight node defined? It departs as the new spotlight takes over — should it fade or stay visible? [Gap] — *Clarification Q5: old spotlight is always a shared node (edges undirected); FR-003 updated to state this explicitly*
- [x] CHK003 - Is the zoom dip magnitude quantified (e.g., "70% of target scale at midpoint") or left intentionally vague as "slight"? [Clarity, Spec §FR-001] — *FR-001 now states "~70% of target scale at midpoint (~30% dip)"; research.md Decision 7 provides exact formula*
- [x] CHK004 - Are requirements specified for label text opacity during node fade transitions? Labels may need separate handling from node icons. [Gap] — *research.md Decision 1 confirms node `opacity` controls `canvas.globalAlpha`, affecting the entire node including image, border, and label*
- [x] CHK005 - Are requirements defined for the easing function used by the opacity interpolation and camera movement? [Completeness] — *research.md Decision 3 and tasks.md T003 specify `easeInOutQuad`*
- [x] CHK006 - Is it specified whether edge labels (if present) fade in sync with edge opacity? [Gap, Spec §FR-011] — *FR-011 requires edges fade in sync; research.md Decision 2 confirms `color.opacity` affects edge stroke, arrow, and label*
- [x] CHK007 - Are requirements defined for what happens when a deep-link navigation triggers an ego-graph change — should it animate or be instant? [Gap, Spec §FR-009] — *FR-009 guards on `spotlightId === null` and `viewMode !== "ego"`; deep-link calls go through `applyEgoGraph` and will animate when both guards pass*

## Requirement Clarity

- [x] CHK008 - Is "single continuous camera move" defined with enough precision to distinguish from a simple linear pan? The zoom dip creates a curved trajectory in scale-space. [Clarity, Spec §FR-001] — *FR-001 specifies ~30% zoom dip at midpoint; research.md Decision 7 provides parabolic dip formula; easeInOutQuad easing distinguishes from linear*
- [x] CHK009 - Is "identical to the current applyEgoGraph result" (FR-006) testable — are the specific properties that must match enumerated (visible nodes, spotlight centering, physics state, node opacity reset)? [Measurability, Spec §FR-006] — *data-model.md enumerates hidden/opacity per category; T007 defines finalizeTransition properties; T014/T014b test exact end-state match*
- [x] CHK010 - Is "visual feedback within 200ms" (plan Performance Goals) reconciled with the 600ms animation duration? Does feedback mean "camera starts moving" or "transition perceptibly begins"? [Clarity] — *plan.md post-design re-check states "600ms animation starts immediately on click (<200ms feedback)"; rAF fires within ~16ms*
- [x] CHK011 - Is "mid-range hardware" in SC-006 defined with specific reference hardware or browser benchmarks? [Measurability, Spec §SC-006] — *Clarification Q6: "mid-range hardware" removed from SC-006; replaced with "current graph size (~50-100 nodes)" and dev-only perf flag*
- [x] CHK012 - Is "slight zoom dip" in FR-001 quantified with a specific percentage or ratio relative to the target zoom level? [Ambiguity, Spec §FR-001] — *FR-001 now states "approximately 70% of the target scale at the midpoint (~30% dip)"*

## Requirement Consistency

- [x] CHK013 - Are the mobile scale values (0.9) and desktop scale values (1.5) from the existing code consistently referenced as the baseline for the zoom dip calculation? [Consistency] — *research.md Decision 3 references existing `scale: isMobile() ? 0.9 : 1.5`; tasks T021/T022/T023 consistently use these values*
- [x] CHK014 - Is the 600ms transition duration (FR-004, SC-002) consistent with the existing 500ms focus animation — does the spec address whether these overlap or the 600ms replaces the 500ms? [Consistency, Spec §FR-004] — *spec.md Clarifications: "600ms total — balanced feel, similar to existing 500ms focus animation"; SC-002 acknowledges the relationship; rAF loop replaces network.focus() for ego-to-ego transitions*
- [x] CHK015 - Do US-1 acceptance scenarios and FR-001/FR-002 requirements describe the same animation behavior without contradiction? US-1 says "zoom out from old…zoom in on new" while FR-001 says "single continuous move with zoom dip." [Consistency, Spec §US-1 vs §FR-001] — *US-1 wording updated to "single continuous camera move with a slight zoom dip mid-transit", now consistent with FR-001*
- [x] CHK016 - Are the edge case definitions (§Edge Cases) consistent with FR-009 and FR-010 regarding when animation does and does not play? [Consistency] — *Edge Cases address initial load, expandAll, same-node, identical neighborhoods; all consistent with FR-009 (no animation for null spotlight/non-ego mode) and FR-010 (expandAll unchanged)*

## Acceptance Criteria Quality

- [x] CHK017 - Can SC-001 ("users perceive a continuous spatial connection") be objectively measured without subjective user testing? [Measurability, Spec §SC-001] — *SC-001 reworded to objective criterion: "No frame exists during an ego-to-ego transition where departing nodes are fully hidden and arriving nodes are not yet visible"*
- [x] CHK018 - Is SC-006 (60 fps) testable with existing tooling, or does the spec need to define how frame rate is measured (e.g., Chrome DevTools, Performance API)? [Measurability, Spec §SC-006] — *Clarification Q6: semi-automated dev-only perf flag logs frame times via `performance.now()`, no CI enforcement*
- [x] CHK019 - Does SC-005 ("existing automated tests continue to pass") account for timing-dependent assertions that may need adjustment for the new 600ms animation? [Completeness, Spec §SC-005] — *SC-005 explicitly states "without modification beyond accommodating the new animation timing"*

## Scenario Coverage

- [x] CHK020 - Are requirements defined for the transition when triggered programmatically (e.g., via deep-link `onNavigate` callback or search result selection) vs. direct node click? [Coverage, Gap] — *Clarification Q7: FR-012 added — animation applies to all triggers (click, keyboard, deep-link, search) at `applyEgoGraph` level*
- [x] CHK021 - Are requirements specified for the transition when the detail panel is closed (not open) during navigation — does the offset calculation differ? [Coverage, Spec §FR-008] — *FR-008 requires "matching existing centering behavior"; T023 uses `getPanelOffset({ anticipateOpen: true })` which handles panel-open/closed states identically to current code*
- [x] CHK022 - Is the interaction between transition animation and the re-center-on-resize handler (existing in ego-graph.js) defined? A resize during transition could conflict. [Coverage, Gap] — *US-2 Acceptance Scenario 3 explicitly addresses resize during transition; T024 ensures finalizeTransition re-reads panel offset at completion time*
- [ ] CHK023 - Are requirements defined for the transition when the graph canvas is not visible (e.g., tab is backgrounded) — does `requestAnimationFrame` pause and resume correctly? [Coverage, Gap]

## Edge Case Coverage

- [x] CHK024 - Is the behavior defined when the old spotlight node has zero neighbors (isolated node) and the user navigates away? There are no departing nodes to fade. [Edge Case, Gap] — *Clarification Q9: animation still plays — camera move provides spatial continuity; empty node sets are a no-op for opacity logic*
- [x] CHK025 - Is the behavior specified for transitioning to a node that has only the old spotlight as its neighbor? The old spotlight becomes a shared node in this case. [Edge Case, Gap] — *Clarification Q5+Q9: old spotlight always shared (undirected edges); zero arriving nodes = no-op opacity, camera still animates*
- [x] CHK026 - Are requirements defined for when opacity is mid-transition (e.g., 0.5) and a cancel occurs — should intermediate opacities be instantly cleaned up or allowed to persist into the new transition? [Edge Case, Spec §FR-005] — *FR-005 requires cancel and new transition from current state; T006 resets intermediate opacities; T027 integration test verifies no intermediate opacity values remain; US-3 AS3 requires "no visual artifacts"*
- [x] CHK027 - Is the behavior defined when `expandAll()` is called during an in-progress transition? Should the transition be canceled? [Edge Case, Gap] — *T030 explicitly wires cancelTransition() into expandAll(); FR-010 requires expandAll behavior unchanged*
- [x] CHK028 - Is the behavior specified when the user clicks the canvas background (deselecting all nodes) during an in-progress transition? [Edge Case, Gap] — *Clarification Q8: FR-005 updated to cover non-ego interrupts (expandAll, canvas background click/deselect) — cancel immediately, execute action normally*

## Non-Functional Requirements

- [ ] CHK029 - Are memory/GC requirements addressed for the rAF loop? Repeated DataSet updates per frame may create garbage — is the spec aware of this? [Performance, Gap]
- [ ] CHK030 - Is there a requirement for the animation to degrade gracefully on low-end devices (e.g., skip opacity animation but keep camera move)? [Performance, Gap]
- [x] CHK031 - Are keyboard interaction requirements defined — can a keyboard user trigger node transitions, and if so, does the animation apply equally? [Accessibility, Gap] — *Clarification Q7: FR-012 — animation applies to all triggers including keyboard; implemented at `applyEgoGraph` level*
- [ ] CHK032 - Is screen reader behavior during transitions addressed? Should transitions trigger any ARIA announcements? [Accessibility, Gap]

## Dependencies & Assumptions

- [x] CHK033 - Is the assumption that vis.js `opacity` property works on all node shapes validated against the actual shapes used (shape: "image" with SVG data URIs)? [Assumption] — *research.md Decision 1 explicitly validates: "When a node uses `shape: 'image'`, `opacity` controls `canvas.globalAlpha` during rendering"*
- [x] CHK034 - Is the assumption that `color.opacity` on edges works independently of `color.color` validated? [Assumption] — *research.md Decision 2 validates `color.opacity` as a dedicated property; T014c integration test verifies edge opacity sync at each frame*
- [ ] CHK035 - Is the assumption "current graph size (~50-100 nodes) does not require performance optimization" documented with an upper bound — at what node count would the approach break down? [Assumption]

## Notes

- This checklist tests the **requirements themselves** for completeness, clarity, and consistency — not whether the implementation works correctly.
- Items marked `[Gap]` identify requirements that may be missing from the spec entirely.
- Items marked `[Ambiguity]` or `[Clarity]` identify requirements that exist but may not be specific enough for unambiguous implementation.
- Focus areas: animation behavior, accessibility (reduced motion + keyboard + screen reader), cancel/interrupt scenarios, consistency between user stories and functional requirements.
