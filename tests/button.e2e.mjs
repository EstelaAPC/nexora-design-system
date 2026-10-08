import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const host = '127.0.0.1';
const port = 4173;
const baseUrl = `http://${host}:${port}`;
const vite = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'apps/playground', '--config', 'apps/playground/vite.config.ts', '--host', host, '--port', String(port), '--strictPort'],
  { stdio: ['ignore', 'pipe', 'pipe'] }
);
let serverOutput = '';
vite.stdout.setEncoding('utf8').on('data', (chunk) => { serverOutput += chunk; });
vite.stderr.setEncoding('utf8').on('data', (chunk) => { serverOutput += chunk; });

let browser;

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (vite.exitCode !== null) {
      throw new Error(`Playground server exited before becoming ready.\n${serverOutput}`);
    }
    try {
      const response = await fetch(baseUrl);
      ready = response.ok;
      if (ready) break;
    } catch {
      await delay(250);
    }
  }
  if (!ready) throw new Error(`Playground server did not become ready.\n${serverOutput}`);

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(baseUrl);
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });

  for (const name of ['nx-button', 'nx-input', 'nx-card', 'nx-badge']) {
    await page.locator(name).first().waitFor({ state: 'attached' });
    const registered = await page.evaluate((tagName) => Boolean(customElements.get(tagName)), name);
    if (!registered) throw new Error(`${name} was present but not registered as a Custom Element.`);
  }

  const button = page.locator('#playground-action');
  await page.keyboard.press('Tab');
  if (!(await button.locator('button').evaluate((element) => element.matches(':focus')))) {
    throw new Error('Tab did not move focus to the first playground button.');
  }
  const focusOutline = await button.locator('button').evaluate((element) => getComputedStyle(element).outlineStyle);
  if (focusOutline !== 'solid') throw new Error(`Expected a visible focus outline, got ${focusOutline}.`);

  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await button.locator('button').click();
  await page.getByTestId('button-status').getByText('Primary action clicked').waitFor();
  const keyboardClicks = await page.locator('#button-click-count').textContent();
  if (keyboardClicks !== '3') {
    throw new Error(`Expected three activations (pointer, Enter, Space), got ${keyboardClicks}.`);
  }

  const accessibilityViolations = await page.evaluate(async () => {
    const button = document.querySelector('#playground-action');
    if (!button) throw new Error('The playground action button was not found.');
    const failures = [];
    const states = [
      {},
      { disabled: true },
      { loading: true },
      ...['primary', 'secondary', 'outline', 'ghost', 'danger'].map((variant) => ({ variant })),
      ...['sm', 'md', 'lg'].map((size) => ({ size }))
    ];
    for (const state of states) {
      button.removeAttribute('disabled');
      button.removeAttribute('loading');
      button.setAttribute('variant', 'primary');
      button.setAttribute('size', 'md');
      for (const [name, value] of Object.entries(state)) {
        if (typeof value === 'boolean') {
          if (value) button.setAttribute(name, '');
        } else {
          button.setAttribute(name, value);
        }
      }
      await button.updateComplete;
      await new Promise((resolve) => window.setTimeout(resolve, 200));
      const report = await window.axe.run(button, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
      });
      failures.push(...report.violations.map(({ id, help, nodes }) => JSON.stringify({
        state,
        id,
        help,
        nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
      })));
    }
    return failures;
  });
  if (accessibilityViolations.length > 0) {
    throw new Error(`axe-core reported accessibility violations:\n${accessibilityViolations.join('\n')}`);
  }

  const lightBackground = await button.locator('button').evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(200);
  const darkBackground = await button.locator('button').evaluate((element) => getComputedStyle(element).backgroundColor);
  if (lightBackground === darkBackground) {
    throw new Error(`Button styles did not respond to the dark theme: ${lightBackground}.`);
  }
  await button.locator('button').click();

  const fullWidthDisplay = await page.evaluate(async () => {
    const fullWidthButton = document.createElement('nx-button');
    fullWidthButton.setAttribute('full-width', '');
    fullWidthButton.textContent = 'Full width';
    document.querySelector('.panel')?.append(fullWidthButton);
    await fullWidthButton.updateComplete;
    return getComputedStyle(fullWidthButton).display;
  });
  if (fullWidthDisplay !== 'flex') {
    throw new Error(`Expected full-width host display to be flex, got ${fullWidthDisplay}.`);
  }
  console.log('PASS: playground registration, click/keyboard/focus, full width, theme, and axe checks.');
} finally {
  if (browser) await browser.close();
  vite.kill();
}
