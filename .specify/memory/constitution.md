<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.1.0
  Modified principles: None
  Added sections:
    - Principle VI: Wikipedia as Single Source of Truth
  Removed sections: None
  Templates requiring updates:
    - All templates ✅ no update needed
      (new principle is a data-sourcing constraint; does not
       alter template structure)
  Follow-up TODOs: None
-->

# SEGA Constitution

## Core Principles

### I. Code Readability & Maintainability

All code MUST be written for human comprehension first.
Functions MUST have a single, clear responsibility.
Naming MUST be descriptive and self-documenting—readers
MUST understand intent without consulting external docs.
Comments MUST explain "why," never restate "what" the code
already expresses. Dead code, unused imports, and TODO debris
MUST be removed before merge.

**Rationale**: Code is read far more often than it is written;
optimizing for readability reduces defects and onboarding time.

### II. User-Centric Design

Every feature MUST begin with a clearly defined user scenario
before any implementation work starts. User journeys MUST be
documented as acceptance criteria in specifications. UI and UX
decisions MUST be validated against real user workflows, not
developer convenience. Error messages MUST be actionable and
written in plain language the end user understands. Features
MUST NOT ship without consideration of the end-to-end user
experience, including onboarding, error recovery, and edge
cases.

**Rationale**: Software exists to serve users; technical
elegance without user value is waste.

### III. Test-Driven Quality Assurance (NON-NEGOTIABLE)

All non-trivial logic MUST have automated tests written before
or alongside implementation. Tests MUST cover happy paths,
edge cases, and error scenarios. Test names MUST describe the
behavior being verified, not the implementation detail. Failing
tests MUST block merges—no exceptions. Test coverage MUST NOT
decrease on any merge to the main branch.

**Rationale**: Tests are the executable specification of correct
behavior and the primary defense against regressions.

### IV. Consistent Code Standards

A single, enforced code style MUST be applied across the entire
codebase via automated formatters and linters. Architectural
patterns, naming conventions, and error-handling approaches MUST
be consistent within each module and across the project. New
patterns MUST NOT be introduced without documenting the rationale
and planning migration of existing code to avoid divergence.

**Rationale**: Consistency eliminates cognitive overhead and
reduces code review friction.

### V. Performance & Accessibility

User-facing operations MUST meet defined latency targets
documented per feature in the implementation plan. UI MUST be
responsive and provide visual feedback within 200 ms of user
interaction. Accessibility standards (WCAG 2.1 AA minimum, where
applicable) MUST be considered for all user-facing features.
Performance regressions MUST be caught by benchmarks or
monitoring before reaching production.

**Rationale**: Performance and accessibility are core quality
attributes that directly impact user experience—not optional
polish applied after launch.

### VI. Wikipedia as Single Source of Truth (NON-NEGOTIABLE)

All factual data displayed in the application MUST be sourced
exclusively from Wikipedia. No other external data source,
proprietary database, or manually curated dataset is permitted
for content that is presented to the user as factual information.
Data MUST be attributable to a specific Wikipedia article URL.
When Wikipedia lacks information for a given entity, the
application MUST clearly indicate that no data is available
rather than fabricate or infer content.

**Rationale**: A single, publicly verifiable source ensures
consistency, transparency, and eliminates licensing ambiguity.
Wikipedia's open license and broad coverage make it the ideal
canonical reference for this project.

## Quality Gates

All code changes MUST pass the following gates before merge:

- Automated linting and formatting checks pass with zero
  violations.
- All existing tests pass; new tests cover changed behavior.
- Code review by at least one team member who did not author
  the change.
- No increase in technical debt without an explicit,
  time-bound remediation plan.
- User-facing changes include updated documentation or inline
  help text.

## Development Workflow

1. **Specify** — Define the feature via a specification
   (spec.md) with user stories and acceptance criteria.
2. **Plan** — Produce an implementation plan (plan.md) with
   technical context and a Constitution compliance check.
3. **Implement** — Write tests and code following the task
   breakdown (tasks.md), committing after each logical unit.
4. **Review** — Submit for code review; reviewer verifies
   constitution compliance, test coverage, and UX quality.
5. **Validate** — Run full test suite, linting, and
   performance checks before merge.
6. **Ship** — Merge to main branch; monitor for regressions.

## Governance

This constitution is the authoritative source of development
standards for the SEGA project. All pull requests and code
reviews MUST verify compliance with these principles.

**Amendment Procedure**:

- Any team member MAY propose an amendment by documenting the
  change, rationale, and migration impact.
- Amendments MUST be reviewed and approved before adoption.
- Each amendment MUST include a version bump following semantic
  versioning (MAJOR.MINOR.PATCH).

**Versioning Policy**:

- MAJOR: Backward-incompatible governance or principle changes
  (removal, redefinition).
- MINOR: New principles, sections, or materially expanded
  guidance.
- PATCH: Clarifications, wording improvements, non-semantic
  refinements.

**Compliance Review**:

- The Constitution Check section in plan-template.md MUST be
  completed for every feature plan.
- Periodic reviews SHOULD be scheduled to assess principle
  relevance and adherence.

**Version**: 1.1.0 | **Ratified**: 2026-02-09 | **Last Amended**: 2026-02-09
