---
name: frontend-component-builder
description: Build modern, responsive frontend pages and components with clean layouts and styling. Use for web development projects.
---

# Frontend Component Builder

## Instructions

1. **Component Structure**
   - Semantic HTML elements
   - Modular, reusable components
   - Logical DOM hierarchy
   - Accessible markup (ARIA labels, roles)

2. **Layout Techniques**
   - Flexbox for 1D layouts
   - CSS Grid for 2D layouts
   - Responsive containers
   - Proper spacing (margin, padding)

3. **Styling Approach**
   - Mobile-first responsive design
   - CSS custom properties (variables)
   - Consistent color palette
   - Typography hierarchy

4. **Interactive Elements**
   - Hover and focus states
   - Smooth transitions
   - Loading states
   - Form validation feedback

## Best Practices

- Use BEM or consistent naming convention
- Keep components under 300 lines
- Optimize images and assets
- Test across browsers and devices
- Maintain 4.5:1 contrast ratio minimum
- Implement proper heading hierarchy (h1-h6)

## Example Structure
```html
<div class="card-component">
  <div class="card-header">
    <h2 class="card-title">Component Title</h2>
  </div>
  <div class="card-body">
    <p class="card-description">Component content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```
```css
.card-component {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card-component:hover {
  transform: translateY(-4px);
}
```

## Common Patterns

- Navigation bars (fixed/sticky)
- Card grids and lists
- Forms with validation
- Modal dialogs
- Tabs and accordions
- Image galleries
- Footer sections

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px