# Nexora Design System

Nexora is a framework-agnostic component library based on real Web Components, Lit, TypeScript, and CSS Custom Properties. It is a library—not a finished application—and its custom elements can be consumed from Vanilla JavaScript, Angular, React, or Vue.

## Workspace

- `packages/components` — Lit-based `nx-*` custom elements.
- `packages/design-tokens` — primitive and semantic CSS design tokens.
- `packages/theme` — light/dark theme variables and shared document styles.
- `packages/icons` — icon utilities.
- `apps/playground` — browser-rendered component showcase.
- `docs` — Storybook stories and architecture guidance.
- `tests` — Vitest/jsdom behavior and axe-core accessibility tests, plus a Playwright browser test.

## Quick start

```sh
npm install
npm run dev
```

The playground demonstrates `nx-button`, `nx-input`, `nx-card`, and `nx-badge`.

## Consuming the button

```js
import '@nexora/theme';
import '@nexora/components/button';

document.body.innerHTML = `
  <nx-button variant="primary" size="md">Save changes</nx-button>
`;
```

Import `@nexora/components` to register all currently available components. Include `@nexora/theme` (or the design-token stylesheet) in the document to provide the design token custom properties consumed by components.

`nx-button` API:

| Property | Values | Default |
| --- | --- | --- |
| `variant` | `primary`, `secondary`, `outline`, `ghost`, `danger` | `primary` |
| `size` | `sm`, `md`, `lg` | `md` |
| `disabled` | Boolean | `false` |
| `loading` | Boolean | `false` |
| `fullWidth` | Boolean (`full-width` attribute) | `false` |
| `type` | `button`, `submit`, `reset` | `button` |

The button renders a native button, so click and keyboard activation retain browser behavior. Loading disables interaction, exposes `aria-busy`, and keeps slotted button text available as the accessible name. No component-specific click event is added.

`nx-icon` renders named SVG path data from `@nexora/icons` inside its Shadow DOM. Icons are decorative and hidden from assistive technology by default; set `aria-label` or `title` to expose an icon as a named image. The `name` values are `check`, `close`, `plus`, `minus`, `chevron-down`, `chevron-up`, `arrow-left`, `arrow-right`, `info`, `warning`, and `search`. The `size` values are `sm`, `md`, and `lg`; consumers can override size with `--nx-icon-size` and color with the inherited CSS `color`. Unknown names render no SVG without throwing. Each icon is available from its own `@nexora/icons/<name>` ESM subpath so bundlers can split or tree-shake the icon modules.

Form controls (`nx-input`, `nx-textarea`, `nx-checkbox`, `nx-radio`, `nx-switch`, and `nx-select`) are form-associated custom elements. They use `ElementInternals` for `FormData`, disabled fieldsets, reset, and constraint validation; this requires native Form-Associated Custom Elements support (current Chromium, Firefox, and Safari 16.4+). No polyfill is bundled for older browsers.

`nx-select` uses native `<option>` and `<optgroup>` elements as declarative children and a native `<select>` inside its Shadow DOM. It supports `name`, `value`, `label`, `placeholder`, `disabled`, `required`, `helper-text`, `error`, `autocomplete`, `aria-label`, `aria-describedby`, and `aria-labelledby`. The selected value is submitted only when the control has a name and is enabled. Reset restores the initial `value` or initially selected option. Native select keyboard and popup behavior are preserved; `readonly` is intentionally not exposed because HTML select has no readonly mode. Consumers can customize its geometry with `--nx-select-height`, `--nx-select-padding-inline`, and `--nx-select-radius`.

## Customizing design tokens

The token entry is organized into primitive, semantic, and component-specific layers. Primitive scales feed semantic roles, and the small component layer derives button-only geometry from those shared scales. Consumers can override the cascade globally or per theme:

```css
:root {
  --nx-color-primary: #0066ff;
  --nx-radius-md: 6px;
  --nx-spacing-4: 16px;
}

[data-theme='dark'] {
  --nx-color-primary: #8ab4ff;
}
```

See [docs/design-tokens.md](./docs/design-tokens.md) for the token layering and extension guidance.

## Commands

```sh
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run storybook
npm run build-storybook
```

See [docs/architecture.md](./docs/architecture.md), [docs/design-tokens.md](./docs/design-tokens.md), [docs/accessibility.md](./docs/accessibility.md), and [docs/testing.md](./docs/testing.md) for implementation decisions and validation details.
