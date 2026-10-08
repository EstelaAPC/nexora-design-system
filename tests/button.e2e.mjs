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

  for (const name of ['nx-button', 'nx-input', 'nx-card', 'nx-badge', 'nx-textarea', 'nx-checkbox', 'nx-radio', 'nx-switch']) {
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

  await button.evaluate((element) => {
    element.setAttribute('variant', 'primary');
    element.setAttribute('size', 'md');
    element.removeAttribute('disabled');
    element.removeAttribute('loading');
  });
  await button.evaluate((element) => element.updateComplete);
  await page.mouse.move(0, 0);

  const lightBackground = await button.locator('button').evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--nx-color-primary', '#0066ff');
    document.documentElement.style.setProperty('--nx-spacing-4', '20px');
    document.documentElement.style.setProperty('--nx-radius-md', '6px');
    document.documentElement.style.setProperty('--nx-button-radius', '10px');
  });
  await page.waitForTimeout(200);
  const customized = await button.locator('button').evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    paddingInline: getComputedStyle(element).paddingInline,
    borderRadius: getComputedStyle(element).borderRadius
  }));
  const customizedTextarea = await page.locator('#playground-textarea').evaluate((element) => {
    const textarea = element.shadowRoot.querySelector('textarea');
    return textarea ? getComputedStyle(textarea).paddingRight : '';
  });
  await page.locator('#playground-checkbox').evaluate(async (element) => {
    element.checked = true;
    await element.updateComplete;
  });
  const customizedCheckboxBackground = await page.locator('#playground-checkbox input').evaluate(
    (element) => getComputedStyle(element).backgroundColor
  );
  if (
    customized.background !== 'rgb(0, 102, 255)' ||
    customized.paddingInline !== '20px' ||
    customized.borderRadius !== '10px' ||
    customizedTextarea !== '20px' ||
    customizedCheckboxBackground !== 'rgb(0, 102, 255)'
  ) {
    throw new Error(`Global token overrides were not applied: ${JSON.stringify({
      button: customized,
      textareaPaddingRight: customizedTextarea,
      checkboxBackground: customizedCheckboxBackground
    })}.`);
  }
  await page.evaluate(() => {
    document.documentElement.style.removeProperty('--nx-color-primary');
    document.documentElement.style.removeProperty('--nx-spacing-4');
    document.documentElement.style.removeProperty('--nx-radius-md');
    document.documentElement.style.removeProperty('--nx-button-radius');
  });
  const lightTextareaSurface = await page.locator('#playground-textarea').evaluate((element) => {
    const textarea = element.shadowRoot.querySelector('textarea');
    return textarea ? getComputedStyle(textarea).backgroundColor : '';
  });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(200);
  const darkBackground = await button.locator('button').evaluate((element) => getComputedStyle(element).backgroundColor);
  const darkTextareaSurface = await page.locator('#playground-textarea textarea').evaluate(
    (element) => getComputedStyle(element).backgroundColor
  );
  if (lightBackground === darkBackground) {
    throw new Error(`Button styles did not respond to the dark theme: ${lightBackground}.`);
  }
  if (lightTextareaSurface === darkTextareaSurface) {
    throw new Error(`Textarea surface did not respond to the dark theme: ${lightTextareaSurface}.`);
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

  const textarea = page.locator('#playground-textarea');
  await textarea.evaluate((element) => {
    element.addEventListener('nx-change', (event) => {
      window.__textareaChangeDetail = event.detail;
    });
  });
  await textarea.getByRole('textbox', { name: 'Description' }).fill('Browser update');
  const textareaDetail = await page.evaluate(() => window.__textareaChangeDetail);
  if (textareaDetail?.value !== 'Browser update') {
    throw new Error(`Textarea did not emit its typed value change: ${JSON.stringify(textareaDetail)}.`);
  }

  const checkbox = page.locator('#playground-checkbox');
  const checkboxInput = checkbox.locator('input');
  await checkbox.evaluate(async (element) => {
    element.checked = false;
    element.disabled = false;
    element.indeterminate = false;
    await element.updateComplete;
  });
  await checkboxInput.click();
  if (!(await checkboxInput.isChecked())) throw new Error('Checkbox did not toggle on click.');
  await checkboxInput.focus();
  await page.keyboard.press('Space');
  if (await checkboxInput.isChecked()) throw new Error('Checkbox did not toggle off with Space.');

  const emailRadio = page.locator('nx-radio[name="preference"][value="email"]');
  const smsRadio = page.locator('nx-radio[name="preference"][value="sms"]');
  await emailRadio.locator('input').click();
  await smsRadio.locator('input').click();
  const radioState = await page.evaluate(() => ({
    email: document.querySelector('nx-radio[value="email"]')?.checked,
    sms: document.querySelector('nx-radio[value="sms"]')?.checked
  }));
  if (radioState.email || !radioState.sms) {
    throw new Error(`Radio group did not keep the last selected value: ${JSON.stringify(radioState)}.`);
  }

  const toggle = page.getByRole('switch', { name: 'Notifications' });
  await toggle.focus();
  await page.keyboard.press('Space');
  if (await toggle.getAttribute('aria-checked') !== 'true') {
    throw new Error('Switch did not turn on or synchronize aria-checked from Space.');
  }

  const formViolations = await page.evaluate(async () => {
    const controls = [
      ['nx-textarea', [{ error: '' }, { error: 'Invalid value.' }, { disabled: true }]],
      ['nx-checkbox', [{ checked: false, disabled: false }, { checked: true }, { disabled: true }, { indeterminate: true }]],
      ['nx-radio', [{ checked: false, disabled: false }, { checked: true }, { disabled: true }]],
      ['nx-switch', [{ checked: false, disabled: false }, { checked: true }, { disabled: true }]]
    ];
    const failures = [];
    for (const [selector, states] of controls) {
      const hostElement = document.querySelector(selector);
      if (!hostElement) throw new Error(`Missing ${selector} in playground.`);
      for (const state of states) {
        Object.assign(hostElement, state);
        await hostElement.updateComplete;
        const report = await window.axe.run(hostElement, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
        });
        failures.push(...report.violations.map(({ id, help, nodes }) => JSON.stringify({
          selector,
          state,
          id,
          help,
          nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
        })));
      }
    }
    return failures;
  });
  if (formViolations.length > 0) {
    throw new Error(`Form control axe violations:\n${formViolations.join('\n')}`);
  }
  console.log('PASS: playground elements, controls, keyboard, themes, token overrides, and axe checks.');
} finally {
  if (browser) await browser.close();
  vite.kill();
}
