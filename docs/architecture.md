# Architecture

## Web Components, Lit, and Shadow DOM

Nexora components are browser Custom Elements prefixed with `nx-`. Lit supplies typed reactive properties, lifecycle management, and declarative templates; it does not replace the platform element or require a framework runtime. Components use Shadow DOM to encapsulate implementation markup and component CSS while inheriting CSS custom properties from their host/document.

The components package has a package-root entry (`@nexora-ds/components`) and a granular entry for each public component. The package build emits JavaScript entries and declaration files. Consumers can import one registration module for tree-shaking and reduced startup work, or import the root to register all components.

`nx-icon-button` is a granular entry that registers and composes `nx-icon`; it consumes the public icon-name API and does not access SVG assets directly.

Feedback components share `nx-icon`/`nx-button` where appropriate and use semantic tokens for severity and surfaces. Navigation uses native links, buttons, ordered lists, and slotted tab controls rather than replacing those platform semantics.

Dialog/popover compose native browser overlay primitives, tooltip augments a slotted trigger with a described hint, and `nx-table` renders native table markup from typed property data. No positioning or data-grid dependency is introduced.

## Framework agnostic

The public component API consists of custom elements, HTML attributes/properties, slots, CSS custom properties, and native DOM events. No React-, Angular-, or Vue-specific wrapper is part of the core package. Framework integrations can bind to the same custom element API.

## Design tokens and themes

`@nexora-ds/design-tokens` exposes one stylesheet entry organized into primitive, semantic, and component token layers. Components consume CSS custom properties rather than embedding design-system colors, spacing, radius, typography, elevation, or motion choices. Component tokens are limited to genuine component-specific settings (currently button geometry and typography) and derive from shared scales. `@nexora-ds/theme` loads the token entry and applies baseline document styles. Light is the default. Setting `data-theme="dark"` on the document root or an ancestor switches semantic color tokens, including button colors, without re-registering the element. Consumers may override semantic or primitive tokens globally, or scope overrides to a subtree.

## Button behavior and events

`nx-button` renders a native `<button>` rather than recreating button semantics. Its disabled and loading states set the native disabled property; loading also sets `aria-busy` and retains the slotted text. Native `click` bubbles through the custom element; no redundant Nexora click event is emitted.

`nx-icon-button` follows the same native-button and ancestor-form strategy for submit/reset actions, while requiring an explicit accessible name because it has no text slot.

`nx-tabs` uses automatic activation for its horizontal tab set. `nx-pagination` emits a typed `nx-page-change` event when its current page changes; alert/toast dismissal emits `nx-dismiss`.

## Distribution

npm workspaces keep the component, token, icon, and theme packages independently addressable without introducing a monorepo orchestration dependency. Vite builds package entries; TypeScript emits declarations. Consumers should install the desired workspace package(s) from the published registry and load the theme/token CSS once at document level.
