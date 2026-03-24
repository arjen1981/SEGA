# Data Model: Fix Ego-Graph Physics Jank

**Date**: 2026-03-24
**Feature**: [spec.md](spec.md)

## Summary

This feature introduces **no data model changes**. No new entities, fields, relationships, or schema modifications are required. The fix is purely behavioral — modifying the control flow within the ego-graph module's `applyEgoGraph()` and `expandAll()` functions.

## Module State Changes

The following module-level state variables are **added** to `ego-graph.js`:

| Variable | Type | Initial Value | Purpose |
|----------|------|--------------|---------|
| `physicsEnabled` | `boolean` | `false` | Tracks whether physics is currently active, avoiding redundant `setOptions` calls |
| `lastPhysicsIsMobile` | `boolean` | `false` | Tracks which viewport-specific physics config was last applied (mobile=true → springLength 80, desktop=false → default) |
| `pendingStabilizationHandler` | `Function \| null` | `null` | Reference to the currently pending `stabilized` event handler, enabling cancel-and-replace |

## Existing State (unchanged)

| Variable | Type | Purpose |
|----------|------|---------|
| `network` | `vis.Network \| null` | The active vis-network instance |
| `viewMode` | `"ego" \| "full"` | Current view mode |
| `spotlightId` | `string \| null` | Current spotlight node ID |
| `reCenterTimer` | `number \| null` | Pending re-center timeout ID |
| `resizeTimer` | `number \| null` | Pending resize debounce timeout ID |
