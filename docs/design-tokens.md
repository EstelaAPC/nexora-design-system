# Design tokens

The token stylesheet is organized into two layers in `packages/design-tokens/src/index.css`.

## Primitive tokens

Primitive names communicate a raw scale or value, for example `--nx-blue-600`, `--nx-neutral-100`, `--nx-spacing-4`, and `--nx-radius-md`. They provide reusable foundations rather than component-specific decisions.

## Semantic tokens

Semantic names communicate intended use, for example `--nx-color-primary`, `--nx-color-on-primary`, `--nx-color-surface`, `--nx-color-text`, `--nx-color-border`, and `--nx-color-focus-ring`. Components should prefer these so their appearance follows theme changes.

Typography, spacing, radius, elevation, and motion tokens are defined alongside the color scales. The button uses semantic variant colors and shared dimensions, type, elevation, focus, and motion tokens. Deprecated initial `brand`, `neutral`, `space`, and `shadow` aliases remain available for existing starter components while their styles are migrated.

## Themes

The light semantic mapping is the default and is also available as `[data-theme="light"]`. `[data-theme="dark"]` overrides semantic colors and focus/elevation treatments while retaining the same primitive scale. The stylesheet is loaded through `@nexora/theme` or directly through `@nexora/design-tokens`.
