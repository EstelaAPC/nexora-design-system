# Design tokens

`packages/design-tokens/src/index.css` is the public stylesheet entry point. It imports three ordered layers:

1. `primitives.css` — raw scales and implementation-neutral values.
2. `semantic.css` — role-based aliases that map to primitives and change by theme.
3. `components.css` — a small set of component-specific decisions that compose earlier tokens.

Components consume CSS custom properties; they do not embed palette, spacing, radius, typography, elevation, or motion choices that belong to the design system. The layers are CSS files rather than separate runtime packages, so consumers can load one stylesheet and override tokens through normal cascade inheritance.

## Primitive tokens

Primitives identify the raw value or scale without implying a use:

```css
:root {
  --nx-blue-500: #6366f1;
  --nx-gray-100: #f1f5f9;
  --nx-gray-900: #0f172a;
  --nx-spacing-4: 1rem;
  --nx-radius-md: 0.5rem;
}
```

The scales also include font families/sizes/weights, border widths, elevation, and motion duration/easing.

## Semantic tokens

Semantic tokens describe roles and normally reference primitives:

```css
:root {
  --nx-color-primary: var(--nx-blue-600);
  --nx-color-background: var(--nx-gray-50);
  --nx-color-text-primary: var(--nx-gray-900);
  --nx-color-border: var(--nx-gray-300);
  --nx-color-error: var(--nx-red-600);
}

[data-theme='dark'] {
  --nx-color-primary: var(--nx-blue-300);
  --nx-color-background: var(--nx-gray-950);
  --nx-color-text-primary: var(--nx-gray-50);
  --nx-color-border: var(--nx-gray-600);
  --nx-color-error: var(--nx-red-300);
}
```

The default and explicit light theme map to the light palette. Dark mode changes semantic assignments; component styles do not need theme-specific selectors.

## Component tokens

Use component tokens only for decisions specific to a component, and derive them from shared scales:

```css
:root {
  --nx-button-height-md: calc(var(--nx-spacing-8) + var(--nx-spacing-3));
  --nx-button-padding-inline-md: var(--nx-spacing-4);
  --nx-button-radius: var(--nx-radius-md);
}
```

The initial component layer exposes button sizes, spacing, typography, border width, and elevation. Components such as input, card, and badge use the common semantic and primitive tokens directly; they do not get duplicate component tokens without a demonstrated need.

Current button component tokens are `--nx-button-height-{sm,md,lg}`, `--nx-button-padding-inline-{sm,md,lg}`, `--nx-button-radius`, `--nx-button-content-gap`, `--nx-button-font-size-{sm,md,lg}`, `--nx-button-font-weight`, `--nx-button-border-width`, `--nx-button-focus-width`, and `--nx-button-shadow`.

## Consumer customization

Override tokens globally on the document root:

```css
:root {
  --nx-color-primary: #0066ff;
  --nx-radius-md: 6px;
  --nx-spacing-4: 16px;
}
```

Theme values can be set on a subtree as well as the document:

```css
[data-theme='dark'] {
  --nx-color-primary: #8ab4ff;
}
```

CSS custom properties inherit through the component host into its Shadow DOM. Semantic overrides affect all components using that role; primitive overrides affect component and component-token defaults that reference that scale. To customize button geometry independently, set a component token such as `--nx-button-radius` on `:root` or a containing scope.

## API stability

The primitive and semantic layers are the primary customization API. Component tokens are intentionally limited to settings that are distinct to a component, not every CSS declaration. Selectors, spinner rotation mechanics, layout primitives, and other internal implementation details remain in component styles. New public tokens should represent a genuine reusable design decision and be documented before they are relied on externally.
