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
