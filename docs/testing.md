# Testing

## Lint and build

`npm run lint` runs ESLint across the workspace. `npm run typecheck` runs the strict workspace TypeScript check. `npm run build` builds workspace packages and the playground; the components package also emits TypeScript declarations.

## Unit and accessibility tests

`npm run test` runs Vitest in jsdom. Tests cover component registration and button rendering, variants, sizes, disabled/loading behavior, full width, native click and focus behavior, theme switching, and axe-core WCAG A/AA checks.

## Browser test

`npm run test:e2e` starts the Vite playground, launches Chromium through Playwright, verifies the four custom elements are registered, exercises pointer and keyboard activation and focus, and checks that the button's computed color changes under the dark theme. It requires a Playwright Chromium browser installation (`npx playwright install chromium`).

## Storybook

`npm run storybook` starts the interactive component documentation. `npm run build-storybook` verifies the stories and documentation can be bundled for static publishing.
