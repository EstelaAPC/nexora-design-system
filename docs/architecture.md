# Architecture

## Web Components, Lit, and Shadow DOM

Nexora components are browser Custom Elements prefixed with `nx-`. Lit supplies typed reactive properties, lifecycle management, and declarative templates; it does not replace the platform element or require a framework runtime. Components use Shadow DOM to encapsulate implementation markup and component CSS while inheriting CSS custom properties from their host/document.

The components package has a package-root entry (`@nexora/components`) and a granular button entry (`@nexora/components/button`). The package build emits both JavaScript entries and declaration files. Consumers can import one registration module for tree-shaking and reduced startup work, or import the root to register all components.

## Framework agnostic

The public component API consists of custom elements, HTML attributes/properties, slots, CSS custom properties, and native DOM events. No React-, Angular-, or Vue-specific wrapper is part of the core package. Framework integrations can bind to the same custom element API.

## Design tokens and themes

Components consume semantic CSS custom properties rather than embedding theme color choices in their styles. `@nexora/design-tokens` defines primitive and semantic values; `@nexora/theme` imports them and provides document-level aliases and baseline styles. Light is the default. Setting `data-theme="dark"` on the document root or an ancestor switches semantic color tokens, including button colors, without re-registering the element.

## Button behavior and events

`nx-button` renders a native `<button>` rather than recreating button semantics. Its disabled and loading states set the native disabled property; loading also sets `aria-busy` and retains the slotted text. Native `click` bubbles through the custom element; no redundant Nexora click event is emitted.

## Distribution

npm workspaces keep the component, token, icon, and theme packages independently addressable without introducing a monorepo orchestration dependency. Vite builds package entries; TypeScript emits declarations. Consumers should install the desired workspace package(s) from the published registry and load the theme/token CSS once at document level.
