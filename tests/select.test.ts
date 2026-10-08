import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NxSelect } from '../packages/components/src/select/select';
import '../packages/components/src/select/select';

type Ready<T extends HTMLElement> = T & { updateComplete: Promise<unknown> };

function mount(properties: Record<string, unknown> = {}, markup = ''): Ready<NxSelect> {
  const element = document.createElement('nx-select') as Ready<NxSelect>;
  Object.assign(element, properties);
  element.innerHTML = markup;
  document.body.append(element);
  return element;
}

async function settle(element: Ready<NxSelect>): Promise<void> {
  await element.updateComplete;
  await Promise.resolve();
}

describe('nx-select', () => {
  afterEach(() => document.body.replaceChildren());

  it('renders a labelled native select and declarative native options', async () => {
    const element = mount(
      { label: 'Country', placeholder: 'Choose one' },
      '<option value="br">Brazil</option><option value="us">United States</option>'
    );
    await settle(element);
    const control = element.shadowRoot?.querySelector('select');

    expect(control?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(control?.options).toHaveLength(3);
    expect(control?.options[0]?.textContent?.trim()).toBe('Choose one');
    expect(control?.options[1]?.value).toBe('br');
  });

  it('accepts the shared helper-text attribute for helpText', async () => {
    const element = mount({ label: 'Country' }, '<option value="br">Brazil</option>');
    element.setAttribute('helper-text', 'Choose your country.');
    await settle(element);

    expect(element.helpText).toBe('Choose your country.');
    expect(element.shadowRoot?.querySelector('.message')?.textContent).toBe('Choose your country.');
  });

  it('supports an explicit value and an initially selected option', async () => {
    const explicit = mount({ value: 'us' }, '<option value="br">Brazil</option><option value="us">USA</option>');
    await settle(explicit);
    expect(explicit.value).toBe('us');
    expect(explicit.shadowRoot?.querySelector('select')?.value).toBe('us');

    document.body.replaceChildren();
    const selected = mount({}, '<option value="br" selected>Brazil</option><option value="us">USA</option>');
    await settle(selected);
    expect(selected.value).toBe('br');
    selected.formResetCallback();
    expect(selected.value).toBe('br');
  });

  it('supports required, disabled, help text, errors and constraint validity', async () => {
    const element = mount(
      { label: 'Country', required: true, helpText: 'Select your country.', error: 'Selection is invalid.' },
      '<option value="br">Brazil</option>'
    );
    await settle(element);
    const control = element.shadowRoot?.querySelector('select');
    expect(control?.required).toBe(true);
    expect(control?.getAttribute('aria-invalid')).toBe('true');
    expect(element.checkValidity()).toBe(false);
    expect(element.validationMessage).toBe('Selection is invalid.');
    expect(control?.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);

    element.error = '';
    element.disabled = true;
    await settle(element);
    expect(control?.disabled).toBe(true);
    expect(element.checkValidity()).toBe(true);
  });

  it('forwards a consumer-provided aria-invalid state', async () => {
    const element = mount({ label: 'Country', ariaInvalid: 'true' }, '<option value="br">Brazil</option>');
    await settle(element);
    expect(element.shadowRoot?.querySelector('select')?.getAttribute('aria-invalid')).toBe('true');

    element.ariaInvalid = 'false';
    await settle(element);
    expect(element.shadowRoot?.querySelector('select')?.getAttribute('aria-invalid')).toBe('false');
  });

  it('updates value, emits a typed bubbling change event and synchronizes validity', async () => {
    const element = mount({ label: 'Country', name: 'country', required: true }, '<option value="br">Brazil</option>');
    await settle(element);
    const listener = vi.fn();
    element.addEventListener('nx-change', listener);
    const control = element.shadowRoot?.querySelector('select');
    if (!control) throw new Error('Select was not rendered.');
    control.value = 'br';
    control.dispatchEvent(new Event('change', { bubbles: true }));
    await settle(element);

    expect(element.value).toBe('br');
    expect(element.checkValidity()).toBe(true);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      detail: { value: 'br' },
      bubbles: true,
      composed: true
    }));
  });

  it('applies custom validity and restores the initial value on reset', async () => {
    const element = mount({ label: 'Country', name: 'country', value: 'br' }, '<option value="br">Brazil</option><option value="us">USA</option>');
    await settle(element);
    element.value = 'us';
    await settle(element);
    element.setCustomValidity('Choose another country.');
    expect(element.validity.customError).toBe(true);
    expect(element.reportValidity()).toBe(false);

    element.formResetCallback();
    expect(element.value).toBe('br');
    expect(element.shadowRoot?.querySelector('select')?.value).toBe('br');
  });

  it('tracks changes to declarative options and groups options natively', async () => {
    const element = mount(
      { label: 'Country' },
      '<optgroup label="Americas"><option value="br">Brazil</option></optgroup><option value="pt">Portugal</option>'
    );
    await settle(element);
    expect(element.shadowRoot?.querySelector('optgroup')?.label).toBe('Americas');

    const option = document.createElement('option');
    option.value = 'us';
    option.textContent = 'United States';
    element.append(option);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await settle(element);
    expect(element.shadowRoot?.querySelector('select')?.querySelector('[value="us"]')?.textContent?.trim())
      .toBe('United States');
  });

  it('has no axe-core violations with a visible label and descriptions', async () => {
    const element = mount(
      { label: 'Country', helpText: 'Choose your country.' },
      '<option value="br">Brazil</option>'
    );
    await settle(element);
    const result = await axe.run(element, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(result.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
  });
});
