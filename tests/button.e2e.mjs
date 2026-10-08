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

  for (const name of ['nx-button', 'nx-input', 'nx-card', 'nx-badge', 'nx-textarea', 'nx-checkbox', 'nx-radio', 'nx-switch', 'nx-select']) {
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

  const playgroundSelect = page.locator('#playground-select select');
  await playgroundSelect.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  if (await page.locator('#playground-select').getAttribute('value') !== 'br') {
    throw new Error('Native select keyboard interaction did not select the first option.');
  }
  await page.locator('#playground-select').evaluate(async (element) => {
    element.style.setProperty('--nx-select-height', '56px');
    await element.updateComplete;
  });
  const selectHeight = await playgroundSelect.evaluate((element) => getComputedStyle(element).minHeight);
  if (selectHeight !== '56px') throw new Error(`Select token override was not applied: ${selectHeight}.`);

  const formViolations = await page.evaluate(async () => {
    const controls = [
      ['nx-textarea', [{ error: '' }, { error: 'Invalid value.' }, { disabled: true }]],
      ['nx-checkbox', [{ checked: false, disabled: false }, { checked: true }, { disabled: true }, { indeterminate: true }]],
      ['nx-radio', [{ checked: false, disabled: false }, { checked: true }, { disabled: true }]],
      ['nx-switch', [{ checked: false, disabled: false }, { checked: true }, { disabled: true }]],
      ['nx-select', [{ value: '' }, { value: 'br' }, { disabled: true }, { error: 'Invalid value.' }]]
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

  await page.evaluate(async () => {
    const form = document.createElement('form');
    form.id = 'native-api-form';
    form.innerHTML = `
      <nx-input id="form-email" name="email" value="estela@example.com" type="email" required minlength="6" maxlength="80"></nx-input>
      <nx-textarea id="form-message" name="message" value="Initial message" required minlength="4" maxlength="120"></nx-textarea>
      <nx-checkbox id="form-terms" name="terms" value="accepted" label="Accept terms" required checked></nx-checkbox>
      <nx-radio id="form-credit" name="payment" value="credit" checked required>Credit</nx-radio>
      <nx-radio id="form-debit" name="payment" value="debit">Debit</nx-radio>
      <nx-radio id="form-default-radio" name="default-radio" checked>Default option</nx-radio>
      <nx-switch id="form-alerts" name="alerts" value="enabled" label="Alerts" checked></nx-switch>
      <nx-select id="form-country" name="country" label="Country" value="br" required>
        <option value="br">Brazil</option>
        <option value="us">United States</option>
      </nx-select>
      <fieldset id="form-disabled-group">
        <nx-input id="form-locked" name="locked" value="not-submitted" label="Locked"></nx-input>
        <nx-select id="form-locked-country" name="locked-country" label="Locked country" value="br">
          <option value="br">Brazil</option>
        </nx-select>
      </fieldset>
      <nx-button id="form-submit" type="submit">Send</nx-button>
      <nx-button id="form-reset" type="reset">Reset</nx-button>
    `;
    document.body.append(form);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      window.__formSubmitCount = (window.__formSubmitCount ?? 0) + 1;
    });
    await Promise.all(Array.from(form.querySelectorAll('*')).map((element) =>
      'updateComplete' in element ? element.updateComplete : Promise.resolve()
    ));
  });

  const formValidity = await page.locator('#native-api-form').evaluate((form) => form.checkValidity());
  if (!formValidity) throw new Error('The initially complete custom-element form should be valid.');
  const initialFormData = await page.locator('#native-api-form').evaluate((form) => {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  });
  if (
    initialFormData.email !== 'estela@example.com' ||
    initialFormData.message !== 'Initial message' ||
    initialFormData.terms !== 'accepted' ||
    initialFormData.payment !== 'credit' ||
    initialFormData['default-radio'] !== 'on' ||
    initialFormData.alerts !== 'enabled' ||
    initialFormData.country !== 'br' ||
    initialFormData.locked !== 'not-submitted'
  ) {
    throw new Error(`Unexpected FormData for associated custom elements: ${JSON.stringify(initialFormData)}.`);
  }

  await page.locator('#form-debit input').click();
  await page.locator('#form-alerts input').click();
  await page.locator('#form-terms input').click();
  const uncheckedData = await page.locator('#native-api-form').evaluate((form) =>
    Object.fromEntries(new FormData(form).entries())
  );
  if ('terms' in uncheckedData || uncheckedData.payment !== 'debit' || 'alerts' in uncheckedData) {
    throw new Error(`Unchecked controls or radio group submitted incorrect values: ${JSON.stringify(uncheckedData)}.`);
  }
  await page.evaluate(async () => {
    const credit = document.querySelector('#form-credit');
    const debit = document.querySelector('#form-debit');
    credit.checked = false;
    debit.checked = false;
    await Promise.all([credit.updateComplete, debit.updateComplete]);
  });
  const missingRadioValid = await page.locator('#native-api-form').evaluate((form) => form.checkValidity());
  if (missingRadioValid) throw new Error('Required radio group was valid with no selection.');
  await page.locator('#form-credit input').click();
  const requiredValid = await page.locator('#native-api-form').evaluate((form) => form.checkValidity());
  if (requiredValid || !(await page.locator('#form-terms input').getAttribute('aria-invalid'))) {
    throw new Error('Required checkbox did not participate in the Constraint Validation API.');
  }
  await page.locator('#form-terms input').check();

  const emailInput = page.locator('#form-email input');
  await emailInput.fill('');
  const missingEmailValid = await page.locator('#native-api-form').evaluate((form) => form.checkValidity());
  const missingEmailReport = await emailInput.evaluate((element) => element.getRootNode().host.reportValidity());
  if (missingEmailValid || missingEmailReport) {
    throw new Error('Required input did not block validity and reportValidity while empty.');
  }
  await page.locator('#form-submit button').click();
  if (await page.evaluate(() => window.__formSubmitCount ?? 0) !== 0) {
    throw new Error('Invalid required controls did not prevent form submission.');
  }
  await emailInput.fill('estela@example.com');

  const message = page.locator('#form-message textarea');
  await message.fill('x');
  const minlengthValid = await page.locator('#form-message').evaluate((element) => element.checkValidity());
  if (minlengthValid) throw new Error('Textarea minlength did not invalidate a too-short user value.');
  await message.fill('Long enough message');
  if (!(await page.locator('#form-message').evaluate((element) => element.checkValidity()))) {
    throw new Error('Textarea did not become valid after its value met minlength.');
  }

  await page.locator('#form-country select').selectOption('us');
  if (await page.locator('#form-country').getAttribute('value') !== 'us') {
    throw new Error('Select interaction did not update the custom element value.');
  }
  const changedCountryData = await page.locator('#native-api-form').evaluate((form) =>
    new FormData(form).get('country')
  );
  if (changedCountryData !== 'us') {
    throw new Error(`Changed select value was not reflected in FormData: ${changedCountryData}.`);
  }

  const fieldset = page.locator('#form-disabled-group');
  await fieldset.evaluate((element) => { element.disabled = true; });
  await page.waitForTimeout(50);
  const disabledFieldsetData = await page.locator('#native-api-form').evaluate((form) =>
    Object.fromEntries(new FormData(form).entries())
  );
  const disabledInternal = await page.locator('#form-locked input').isDisabled();
  const disabledSelect = await page.locator('#form-locked-country select').isDisabled();
  if ('locked' in disabledFieldsetData || 'locked-country' in disabledFieldsetData || !disabledInternal || !disabledSelect) {
    throw new Error('fieldset[disabled] did not disable and exclude associated input and select controls.');
  }
  await fieldset.evaluate((element) => { element.disabled = false; });
  await page.waitForTimeout(50);

  await page.locator('#form-submit button').click();
  const submitCount = await page.evaluate(() => window.__formSubmitCount);
  if (submitCount !== 1) throw new Error(`Expected one valid form submit, received ${submitCount}.`);

  await page.locator('#form-email input').fill('changed@example.com');
  await page.locator('#form-message textarea').fill('Changed');
  await page.locator('#form-debit input').click();
  await page.locator('#form-alerts input').click();
  await page.locator('#form-country select').selectOption('us');
  await page.locator('#form-reset button').click();
  await page.waitForTimeout(50);
  const resetState = await page.evaluate(() => ({
    email: document.querySelector('#form-email').value,
    message: document.querySelector('#form-message').value,
    terms: document.querySelector('#form-terms').checked,
    credit: document.querySelector('#form-credit').checked,
    debit: document.querySelector('#form-debit').checked,
    defaultRadio: document.querySelector('#form-default-radio').checked,
    alerts: document.querySelector('#form-alerts').checked,
    country: document.querySelector('#form-country').value
  }));
  const resetFormData = await page.locator('#native-api-form').evaluate((form) =>
    Object.fromEntries(new FormData(form).entries())
  );
  if (
    resetState.email !== 'estela@example.com' ||
    resetState.message !== 'Initial message' ||
    !resetState.terms ||
    !resetState.credit ||
    resetState.debit ||
    !resetState.defaultRadio ||
    !resetState.alerts ||
    resetState.country !== 'br' ||
    resetFormData.payment !== 'credit' ||
    resetFormData.terms !== 'accepted' ||
    resetFormData.alerts !== 'enabled' ||
    resetFormData.country !== 'br'
  ) {
    throw new Error(`Form reset did not restore defaults/FormData: ${JSON.stringify({ resetState, resetFormData })}.`);
  }

  await page.evaluate(async () => {
    const form = document.createElement('form');
    form.id = 'required-select-form';
    form.innerHTML = `
      <nx-select id="required-country" name="required-country" label="Required country" required>
        <option value="br">Brazil</option>
      </nx-select>
    `;
    document.body.append(form);
    await Promise.all(Array.from(form.querySelectorAll('*')).map((element) =>
      'updateComplete' in element ? element.updateComplete : Promise.resolve()
    ));
  });
  const requiredCountryValid = await page.locator('#required-select-form').evaluate((form) => form.checkValidity());
  const requiredCountryReport = await page.locator('#required-country').evaluate((element) => element.reportValidity());
  if (requiredCountryValid || requiredCountryReport) {
    throw new Error('Required select did not block form validity or reportValidity when empty.');
  }
  const requiredCountryInvalid = await page.locator('#required-country select').getAttribute('aria-invalid');
  if (requiredCountryInvalid !== 'true') throw new Error('Required select did not expose aria-invalid.');

  const selectTheme = await page.locator('#playground-select select').evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(100);
  const selectLightTheme = await page.locator('#playground-select select').evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(100);
  const selectDarkTheme = await page.locator('#playground-select select').evaluate((element) => getComputedStyle(element).backgroundColor);
  if (selectLightTheme === selectDarkTheme || !selectTheme) {
    throw new Error(`Select surface did not respond to theme changes: ${selectLightTheme}, ${selectDarkTheme}.`);
  }
  console.log('PASS: playground elements, controls, keyboard, forms, themes, token overrides, and axe checks.');
} finally {
  if (browser) await browser.close();
  vite.kill();
}
