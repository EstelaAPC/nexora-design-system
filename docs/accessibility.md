# Accessibility

`nx-button` delegates activation, focus, form participation, and disabled behavior to a native `<button>`. Consumers must provide meaningful button text or other slotted accessible content.

- Visible slotted content remains in the button in every state, including loading, so the accessible name is retained.
- Loading sets the native disabled state and `aria-busy="true"`; its visual spinner is hidden from assistive technology.
- Focus uses a distinct `:focus-visible` outline and ring derived from tokens.
- The spinner and transitions respect `prefers-reduced-motion`.
- Disabled/loading controls cannot be activated; no pointer-only interaction model is used.

The Vitest suite runs axe-core against default, disabled, loading, every variant, and every size. Playwright verifies real browser keyboard activation and focus behavior. These automated checks supplement (not replace) assistive-technology and visual contrast review.
