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

The playground demonstrates the public components across actions, feedback, navigation, overlays, and data display, including icon buttons and form integration.

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

`nx-icon-button` composes a native button with `nx-icon`; its icon is always decorative, and consumers must provide a meaningful `aria-label` (a development warning is emitted when it is missing). It supports `type="button|submit|reset"` (default `button`), `disabled`, sizes `sm|md|lg`, and variants `primary|secondary|ghost|danger`. It uses the corresponding `nx-button` height, focus, and radius tokens; `--nx-icon-button-radius` can override its radius independently. Import it with `@nexora/components/icon-button`.

## Feedback and navigation

Import individual components from their granular package subpaths (for example, `@nexora/components/alert`) or use the package root to register all components.

| Component | Public API and behavior |
| --- | --- |
| `nx-alert` | Slotted message, `severity="info|success|warning|error"`, optional `heading`, `dismissible`. Non-urgent states use `status`; warning/error use `alert`. Dismissal removes the element and emits bubbling/composed `nx-dismiss`. |
| `nx-spinner` | `size="sm|md|lg"` and optional `label`. Unlabelled spinner is decorative; labelled spinner exposes a status. Animation stops for reduced motion. |
| `nx-progress` | Optional `value`, `max` (default `100`) and `label` (default `Progress`). Missing/non-finite value is indeterminate; determinate values are clamped to `[0,max]`. |
| `nx-toast` | `open`, `severity`, `duration` in milliseconds (`0` disables auto-dismiss), `dismissible`. Status is polite; warning/error are assertive. Hover and focus pause its timer. Dismissal emits bubbling/composed `nx-dismiss`. |
| `nx-tabs` | `label`, `selected-index`; provide native `<button slot="tab">` and matching elements with `slot="panel"`. Horizontal tabs use automatic activation with ArrowLeft/ArrowRight/Home/End. |
| `nx-breadcrumb` | `label` and an `items` array of `{ label, href? }`. The final item is the current page; preceding items are links only when `href` is supplied. |
| `nx-pagination` | `current-page`, `total-pages`, optional `label`, `previous-label`, `next-label`. Page count is kept bounded; changes emit bubbling/composed `nx-page-change` with `{ page }`. |

Animated feedback respects `prefers-reduced-motion`. Components use existing semantic and primitive tokens; no new global tokens were needed.

## Overlays and data display

| Component | Public API and behavior |
| --- | --- |
| `nx-dialog` | `title`, `open`, `modal`; renders native `<dialog>`, exposes `close()`, handles Escape, and restores focus to the opener. |
| `nx-tooltip` | `text` and a slotted trigger. The tooltip appears on hover/focus, is dismissible with Escape, and augments (does not replace) the trigger's existing description. |
| `nx-popover` | `title`, `open`, `trigger="click|manual"`, `placement="top|right|bottom|left"`; supports Escape, outside-click dismissal, and focus restoration. |
| `nx-table` | `header` caption, typed `columns` and `rows` JavaScript properties, `striped`, `hover`, `density="comfortable|compact"`, and `emptyState`. Columns accept `key`, `header`, and optional `rowHeader`. Cell data must be string, number, boolean, or nullish; object values are rejected. |

Dialog and popover use native browser popover/dialog APIs when available; tooltip is CSS positioned. Reduced-motion preferences are respected. Table markup uses native caption, headers, rows, and cells.

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
