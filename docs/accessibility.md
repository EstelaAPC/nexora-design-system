# Accessibility

`nx-button` delegates activation, focus, form participation, and disabled behavior to a native `<button>`. Consumers must provide meaningful button text or other slotted accessible content.

- Visible slotted content remains in the button in every state, including loading, so the accessible name is retained.
- Loading sets the native disabled state and `aria-busy="true"`; its visual spinner is hidden from assistive technology.
- Focus uses a distinct `:focus-visible` outline and ring derived from tokens.
- The spinner and transitions respect `prefers-reduced-motion`.
- Disabled/loading controls cannot be activated; no pointer-only interaction model is used.

`nx-icon-button` also renders a native `<button>` and requires a meaningful `aria-label`. The icon is marked decorative so it cannot create a duplicate accessible name; no label is inferred from the technical icon name. A missing name produces a development warning and remains missing so it can be corrected by the consumer. Native focus, keyboard activation, and disabled behavior are preserved.

The Vitest suite runs axe-core against default, disabled, loading, every variant, and every size. Playwright verifies real browser keyboard activation and focus behavior. These automated checks supplement (not replace) assistive-technology and visual contrast review.
