# Research: Phase 5 UI/UX Redesign

**Branch**: `001-phase5-ui-ux-redesign` | **Date**: 2026-02-21 | **Phase**: 0

## Purpose

Resolve all technical unknowns identified in the implementation plan to enable informed design decisions for the Phase 5 UI/UX redesign.

---

## Research Findings

### 1. Animation Libraries for Next.js 16+ with React 19

**Decision**: Use CSS-based animations with React Spring for complex interactions

**Rationale**:
- CSS animations are performant, respect `prefers-reduced-motion` natively, and have zero bundle size impact
- React Spring provides physics-based animations for complex interactions (drag gestures, spring transitions)
- Next.js 16+ with React 19 has excellent support for CSS-in-JS and native CSS modules
- Avoids JavaScript animation library overhead for simple transitions

**Alternatives Considered**:
| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Framer Motion | Rich API, gesture support | 14kb bundle size, overkill for simple transitions | CSS sufficient for 80% of animations |
| GSAP | Powerful timeline control | Large bundle, steep learning curve | Unnecessary complexity for UI transitions |
| React Transition Group | Lightweight | Limited animation capabilities | CSS provides same functionality |

**Recommendations**:
- Use CSS transitions for hover states, page transitions, and simple fades
- Use CSS keyframes for loading animations and continuous animations
- Use React Spring only for gesture-based interactions (drag-to-dismiss, pull-to-refresh)
- Always pair animations with `@media (prefers-reduced-motion: no-preference)` queries

---

### 2. Responsive Breakpoint Patterns for Task Management Interfaces

**Decision**: Mobile-first breakpoints at 320px, 768px, 1024px, 1440px

**Rationale**:
- 320px minimum ensures support for smallest smartphones (iPhone SE, small Android devices)
- 768px tablet breakpoint enables two-column layouts for task lists
- 1024px desktop breakpoint enables three-column layouts with sidebar
- 1440px large desktop breakpoint optimizes for wide screens

**Alternatives Considered**:
| Alternative | Breakpoints | Why Rejected |
|-------------|-------------|--------------|
| Bootstrap | 576px, 768px, 992px, 1200px | 576px minimum excludes smallest devices |
| Tailwind | 640px, 768px, 1024px, 1280px, 1536px | Too many breakpoints increase complexity |
| Material Design | 600px, 905px, 1240px, 1440px | Non-standard breakpoints harder to remember |

**Recommendations**:
```css
/* Mobile-first approach */
/* Base styles: 320px+ (mobile) */

/* Tablet */
@media (min-width: 768px) {
  /* Two-column layouts, larger touch targets become clickable areas */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Three-column layouts, sidebar navigation, hover states */
}

/* Large Desktop */
@media (min-width: 1440px) {
  /* Max-width containers, optimized whitespace */
}
```

---

### 3. Chatbot Widget UX Patterns for Homepage

**Decision**: Floating action button (FAB) widget in bottom-right corner, expandable to chat window

**Rationale**:
- FAB pattern is universally recognized for chat/support widgets
- Bottom-right placement avoids interfering with primary navigation and content
- Expandable window preserves conversation context when minimized
- Can coexist with Phase-III chat functionality by serving different purpose (support vs. task management)

**Alternatives Considered**:
| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Embedded chat section | Always visible, no interaction needed | Takes permanent screen space, distracting | FAB is less intrusive |
| Full-page chat | Immersive experience | Requires navigation away from content | Users want quick questions without context switch |
| Sidebar integration | Consistent with navigation | Competes with existing sidebar | Sidebar already handles task navigation |

**Recommendations**:
- Position FAB at bottom-right with 24px margin from viewport edges
- Use distinct icon (chat bubble with question mark) to differentiate from Phase-III task chat
- Animate expansion with spring transition (300ms duration)
- Preserve conversation state in React context when minimized
- Add dismiss button to hide widget for session (store in sessionStorage)
- Display 2-3 suggested questions on open to guide user interaction

---

### 4. WCAG 2.1 AA Compliance for Animations and Transitions

**Decision**: Implement comprehensive accessibility checklist for all animations and interactive elements

**Rationale**:
- WCAG 2.1 AA is industry standard for web accessibility
- Legal compliance increasingly required for web applications
- Accessibility improvements benefit all users (not just those with disabilities)
- Lighthouse accessibility score directly measures WCAG compliance

**Key Requirements**:
| Requirement | Success Criterion | Implementation |
|-------------|-------------------|----------------|
| Contrast Ratio | 1.4.3 (AA) | 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold) |
| Reduced Motion | 2.3.3 (AAA) | Respect `prefers-reduced-motion: reduce` media query |
| Focus Visible | 2.4.7 (AA) | All interactive elements show visible focus indicator |
| Touch Targets | 2.5.5 (AAA) | Minimum 44x44px for touch interactions |
| Keyboard Navigation | 2.1.1 (A) | All functionality accessible via keyboard |
| Meaningful Order | 1.3.2 (A) | Visual order matches DOM order |

**Recommendations**:
```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible styles */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Ensure touch targets */
.button, .icon-button {
  min-width: 44px;
  min-height: 44px;
}
```

---

### 5. Lighthouse Performance Optimization for Animated UIs

**Decision**: Implement performance budget with specific optimization techniques

**Rationale**:
- Lighthouse performance score directly impacts SEO and user perception
- Animations can significantly impact Performance and Core Web Vitals if not optimized
- Performance budget ensures team accountability for maintaining speed

**Key Metrics to Target**:
| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | <1.8s | Time to first content render |
| Largest Contentful Paint (LCP) | <2.5s | Time to largest content render |
| Cumulative Layout Shift (CLS) | <0.1 | Visual stability during load |
| Total Blocking Time (TBT) | <200ms | Time main thread is blocked |
| Speed Index | <3.4s | How quickly content is visually displayed |

**Optimization Techniques**:
1. **CSS Animations Over JavaScript**: Use `transform` and `opacity` properties (GPU-accelerated)
2. **Avoid Layout Thrashing**: Animate properties that don't trigger reflow (transform, opacity)
3. **Code Splitting**: Lazy-load animation libraries and non-critical components
4. **Image Optimization**: Use WebP/AVIF formats, responsive images with `srcset`
5. **Font Loading**: Use `font-display: swap`, preload critical fonts
6. **Skeleton Screens**: Show loading placeholders instead of spinners
7. **Defer Non-Critical CSS**: Inline critical CSS, defer remaining styles

**Recommendations**:
```css
/* GPU-accelerated animations */
.animated-element {
  transform: translateX(0); /* Initialize transform */
  transition: transform 300ms ease-out, opacity 300ms ease-out;
  will-change: transform, opacity; /* Hint to browser */
}

/* Avoid animating these (trigger reflow) */
/* ❌ width, height, top, left, margin, padding */
/* ✅ transform, opacity, filter */
```

---

## Consolidated Recommendations

### Technology Stack

| Category | Choice | Rationale |
|----------|--------|-----------|
| Animations | CSS + React Spring (selective) | Performance, bundle size, reduced-motion support |
| Styling | CSS Modules with CSS Variables | Scoped styles, theming, no runtime overhead |
| Responsive | Mobile-first (320px, 768px, 1024px, 1440px) | Device coverage, simplicity |
| Chatbot Widget | FAB pattern (bottom-right) | Standard UX, non-intrusive |
| Accessibility | WCAG 2.1 AA full compliance | Legal, ethical, Lighthouse score |
| Performance | Lighthouse 90+ target | SEO, user experience |

### Implementation Guidelines

1. **All animations must**:
   - Use `transform` and `opacity` only (GPU-accelerated)
   - Respect `prefers-reduced-motion` media query
   - Have duration between 150-400ms (150ms for micro-interactions, 300ms for standard, 400ms for emphasis)
   - Use easing functions (ease-out for entering, ease-in for exiting)

2. **All components must**:
   - Have minimum 44px touch targets on mobile
   - Show visible focus indicators for keyboard navigation
   - Meet 4.5:1 contrast ratio for text
   - Be navigable via keyboard (Tab, Enter, Escape)

3. **All pages must**:
   - Load initial content within 1.8s (FCP)
   - Achieve CLS <0.1 (no layout shifts during load)
   - Display skeleton screens during data fetch
   - Preserve user state across navigation

4. **Chatbot widget must**:
   - Differentiate visually from Phase-III task chat
   - Preserve conversation when minimized
   - Display suggested questions on open
   - Allow session-based dismissal

---

## Next Steps

1. Proceed to Phase 1 design with these research findings
2. Create `data-model.md` with UI component architecture
3. Reference existing API contracts (no new endpoints required)
4. Create `quickstart.md` with development setup and usage examples
5. Update agent context with new UI technologies
