# Accessibility

`nx-button` delegates activation, focus, form participation, and disabled behavior to a native `<button>`. Consumers must provide meaningful button text or other slotted accessible content.

- Visible slotted content remains in the button in every state, including loading, so the accessible name is retained.
- Loading sets the native disabled state and `aria-busy="true"`; its visual spinner is hidden from assistive technology.
- Focus uses a distinct `:focus-visible` outline and ring derived from tokens.
- The spinner and transitions respect `prefers-reduced-motion`.
- Disabled/loading controls cannot be activated; no pointer-only interaction model is used.

`nx-icon-button` also renders a native `<button>` and requires a meaningful `aria-label`. The icon is marked decorative so it cannot create a duplicate accessible name; no label is inferred from the technical icon name. A missing name produces a development warning and remains missing so it can be corrected by the consumer. Native focus, keyboard activation, and disabled behavior are preserved.

The Vitest suite runs axe-core against default, disabled, loading, every variant, and every size. Playwright verifies real browser keyboard activation and focus behavior. These automated checks supplement (not replace) assistive-technology and visual contrast review.

## Feedback and navigation

- Alerts and toasts use polite `status` announcements for informational/success messages and assertive `alert` announcements for warning/error messages. Both provide a labelled native button when dismissible; dismissing emits `nx-dismiss`.
- An unlabelled spinner is hidden from assistive technology; when used as the loading indicator itself, set its `label` to expose a status name. Progress exposes `progressbar` values and omits `aria-valuenow` when indeterminate.
- Tabs accept native buttons and panels through slots, connect them with tab/tabpanel relationships, and use automatic activation: ArrowLeft/ArrowRight/Home/End move focus and selection together.
- Breadcrumbs render a labelled `<nav>` with an ordered list and mark the current item with `aria-current="page"`.
- Pagination uses labelled native buttons, `aria-current="page"` and a bounded page window; it emits `nx-page-change` only when the selected page changes.
- Spinner/progress animations respect `prefers-reduced-motion`; toast duration pauses while hovered or focused.

## Overlays and data display

- Dialog uses the native `<dialog>` element; modal mode delegates inert background, keyboard behavior, and focus containment to `showModal()`. Escape closes the dialog and focus returns to the opener.
- Tooltip text is associated with its slotted trigger using `aria-describedby`, appears on both focus and hover, and can be dismissed with Escape.
- Popover trigger exposes `aria-expanded` and `aria-controls`; the surface has a heading-based accessible name. Escape/outside click close it and return focus when appropriate.
- Table preserves native `<table>`, `<caption>`, `<th scope="col">`, and optional `<th scope="row">` semantics. Use a caption to identify the data set.
- Overlay and table stories/tests include axe-core checks; E2E exercises real browser dialog and popover behavior.
