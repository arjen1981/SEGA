# Research: Node Transition Animation

**Feature**: 012-node-transition-animation  
**Date**: 2026-04-02

## Research Tasks

### 1. Node opacity mechanism in vis-network v10

**Decision**: Use the native per-node `opacity` property (range 0–1) for fading nodes during transitions.

**Rationale**: vis-network v10 supports a top-level `opacity` property on node objects. When a node uses `shape: "image"` (as all nodes in this project do via SVG data URIs), `opacity` controls `canvas.globalAlpha` during rendering — affecting the entire node including its image, border, and label. This is the only practical approach since `color.background` with rgba does not affect image-shaped nodes (the image renders on top of the background).

**Implementation pattern**:
```javascript
// Fade a node to 50% opacity
nodes.update([{ id: "node-id", opacity: 0.5 }]);

// Fully transparent (invisible but still in render tree)
nodes.update([{ id: "node-id", opacity: 0 }]);

// Restore to full opacity
nodes.update([{ id: "node-id", opacity: 1 }]);
```

**Alternatives considered**:
- **rgba color manipulation**: Modifying `color.background` with alpha values. Rejected — does not affect `shape: "image"` nodes, which all groups in this project use.
- **SVG fill opacity modification**: Dynamically editing SVG data URIs in icons.js to change fill opacity. Rejected — requires regenerating data URIs per frame, no caching, extremely inefficient.
- **`hidden` property toggle**: The current approach — binary visible/invisible. Rejected as it's the problem we're solving (abrupt transitions).

### 2. Edge opacity mechanism in vis-network v10

**Decision**: Use the `color.opacity` property on edge objects for fading edges during transitions.

**Rationale**: Unlike nodes (which have a top-level `opacity`), edge opacity is set via `color.opacity` (range 0–1). This is nested under the `color` configuration and vis-network applies it when rendering the edge stroke, arrow, and label.

**Implementation pattern**:
```javascript
// Fade an edge to 30% opacity
edges.update([{ id: "edge-id", color: { opacity: 0.3 } }]);

// Fully transparent
edges.update([{ id: "edge-id", color: { opacity: 0 } }]);

// Restore to full opacity
edges.update([{ id: "edge-id", color: { opacity: 1 } }]);
```

**Alternatives considered**:
- **rgba edge color manipulation**: Setting `color.color` to an rgba string. Would work but the dedicated `color.opacity` property is cleaner and doesn't require parsing/reconstructing color strings.
- **`hidden` toggle (current approach)**: Binary, not animatable. Rejected as the problem being solved.

### 3. Camera animation with zoom dip (moveTo vs. focus)

**Decision**: Use `network.moveTo()` with a custom `requestAnimationFrame` loop to perform a single continuous camera move with a zoom dip mid-transit, synchronized with node/edge opacity changes.

**Rationale**: The built-in `network.focus()` and `network.moveTo()` accept animation options (`duration`, `easingFunction`) but:
- `network.focus()` targets a specific node at a fixed scale — it can't produce a zoom dip mid-transit.
- `network.moveTo()` animates to a fixed position/scale — also no mid-transit dip.
- Neither API exposes an `onProgress` callback or supports keyframe-style animation.

A custom `requestAnimationFrame` loop lets us:
1. Interpolate camera position from old spotlight to new spotlight.
2. Apply a zoom curve that dips below the target scale at the midpoint.
3. Synchronize opacity changes on departing/arriving nodes and edges.
4. Cancel cleanly (stop the rAF loop) when a new transition starts.

**Existing usage for reference** (ego-graph.js):
```javascript
network.focus(nodeId, {
    scale: isMobile() ? 0.9 : 1.5,
    offset: offset,
    animation: { duration: 500, easingFunction: "easeInOutQuad" },
});
```

**Custom rAF approach**:
```javascript
let animFrameId = null;

function animateTransition(fromPos, toPos, targetScale, durationMs, onProgress, onComplete) {
    const startTime = performance.now();
    
    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const t = Math.min(elapsed / durationMs, 1);
        // easeInOutQuad
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        onProgress(eased); // Caller handles position, scale, and opacity interpolation
        
        if (t < 1) {
            animFrameId = requestAnimationFrame(step);
        } else {
            animFrameId = null;
            onComplete();
        }
    }
    
    animFrameId = requestAnimationFrame(step);
}

function cancelTransition() {
    if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
}
```

**Alternatives considered**:
- **Chaining `network.focus()` calls**: Zoom out with one focus, then zoom in with a second. Creates visible seams between phases, harder to cancel, and doesn't allow synchronized opacity changes. Rejected per clarification session (Option A: multi-phase was rejected).
- **Using `network.focus()` alone**: Single call with built-in animation. Cannot produce a zoom dip and doesn't expose progress callback for opacity sync. Rejected.
- **Web Animations API (WAAPI)**: Not applicable — vis.js renders to canvas, not DOM elements. WAAPI works only on DOM nodes.

### 4. Node position retrieval for camera interpolation

**Decision**: Use `network.getPositions([nodeId])` to retrieve the canvas-space positions of the old and new spotlight nodes for camera interpolation.

**Rationale**: To animate the camera from old to new spotlight, we need the canvas positions of both nodes. `network.getPositions()` returns `{ nodeId: { x, y } }` in canvas coordinates — the same coordinate system used by `network.moveTo({ position: { x, y } })`.

**Implementation pattern**:
```javascript
const positions = network.getPositions([oldSpotlightId, newSpotlightId]);
const fromPos = positions[oldSpotlightId];
const toPos = positions[newSpotlightId];

// Interpolate: currentPos = lerp(fromPos, toPos, t)
```

### 5. `prefers-reduced-motion` detection

**Decision**: Use `window.matchMedia("(prefers-reduced-motion: reduce)")` to detect the user's motion preference, following the same pattern already used for `(max-width: 767px)` mobile detection in ego-graph.js.

**Rationale**: The project already uses `window.matchMedia()` for responsive breakpoint detection. Using the same API for reduced motion is consistent and requires no additional dependencies.

**Implementation pattern**:
```javascript
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function prefersReducedMotion() {
    return reducedMotion.matches;
}
```

**Alternatives considered**:
- **CSS-only approach**: Not applicable — the animation is JavaScript-driven on a canvas element, not CSS-animated DOM elements.
- **Third-party accessible animation library**: Overkill for a single boolean check. Rejected per zero-dependency constraint.

### 6. Cancel-and-replace pattern for rAF-based animations

**Decision**: Store the `requestAnimationFrame` ID and cancel it when a new transition starts, then immediately begin the new transition from the current camera state.

**Rationale**: The project already implements cancel-and-replace for stabilization handlers (ego-graph.js stores `pendingStabilizationHandler` and removes it via `network.off("stabilized", ...)`). The rAF cancel pattern follows the same principle but uses `cancelAnimationFrame()` instead of event unsubscription.

**Key considerations**:
- When canceling, the intermediate opacity states must be cleaned up: departing nodes from the canceled transition that overlap with the new transition's shared/arriving sets need their opacity reset.
- The `network.moveTo()` built-in animation (if used) would need to be replaced by the rAF loop to ensure atomiccancel — vis.js doesn't expose a way to cancel in-flight `moveTo` animations.
- The rAF loop handles all three concerns (camera, opacity, physics) in a single animation frame, making cancel a single `cancelAnimationFrame()` call.

### 7. Zoom dip curve

**Decision**: Use a parabolic dip applied to the target scale — at `t=0.5` (midpoint), the zoom level dips to approximately 70% of the target scale, creating a subtle "pull back and approach" feel.

**Rationale**: The spec calls for a "slight zoom dip" (clarification: single continuous move with zoom dip mid-transit). A parabolic curve `scale = targetScale * (1 - dipAmount * 4 * t * (1 - t))` where dipAmount ≈ 0.3 produces a smooth dip that:
- Starts at target scale
- Dips to `targetScale * 0.7` at the midpoint
- Returns to target scale at the end

**Formula**:
```javascript
// t: animation progress 0→1 (already eased)
// dipFactor: 0.3 = 30% zoom reduction at midpoint
const dipFactor = 0.3;
const zoomDip = 1 - dipFactor * 4 * t * (1 - t);
const currentScale = targetScale * zoomDip;
```

At t=0: zoomDip=1.0 (no dip), at t=0.5: zoomDip=0.7 (maximum dip), at t=1: zoomDip=1.0 (back to target).
