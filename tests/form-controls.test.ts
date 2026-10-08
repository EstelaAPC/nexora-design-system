import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NxCheckbox } from '../packages/components/src/checkbox/checkbox';
import type { NxInput } from '../packages/components/src/input/input';
import type { NxRadio } from '../packages/components/src/radio/radio';
import type { NxSwitch } from '../packages/components/src/switch/switch';
import type { NxTextarea } from '../packages/components/src/textarea/textarea';
import '../packages/components/src/index';

type Ready<T extends HTMLElement> = T & { updateComplete: Promise<unknown> };

function mount<T extends HTMLElement>(tag: string, properties: Record<string, unknown>): Ready<T> {
  const element = document.createElement(tag) as Ready<T>;
  Object.assign(element, properties);
  document.body.append(element);
  return element;
}

async function settle(element: { updateComplete: Promise<unknown> }): Promise<void> {
  await element.updateComplete;
}

async function expectAccessible(element: HTMLElement): Promise<void> {
  await settle(element as Ready<HTMLElement>);
  const result = await axe.run(element, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    rules: { 'color-contrast': { enabled: false } }
  });
  expect(result.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
}

describe('nx-input form integration', () => {
  afterEach(() => document.body.replaceChildren());

  it('passes required, type, minlength, maxlength, and custom validity checks to ElementInternals', async () => {
    const element = mount<NxInput>('nx-input', {
      label: 'Email',
      name: 'email',
      type: 'email',
      value: '',
      required: true,
      minlength: 6,
      maxlength: 40
    });
    await settle(element);
    const control = element.shadowRoot?.querySelector('input');
    expect(control?.required).toBe(true);
    expect(control?.minLength).toBe(6);
    expect(control?.maxLength).toBe(40);
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.valueMissing).toBe(true);

    element.value = 'not-an-email';
    await settle(element);
    expect(element.validity.typeMismatch).toBe(true);
    expect(element.checkValidity()).toBe(false);

    element.value = 'person@example.com';
    await settle(element);
    expect(element.checkValidity()).toBe(true);
    element.setCustomValidity('Email needs review.');
    expect(element.validity.customError).toBe(true);
    expect(element.validationMessage).toBe('Email needs review.');
    expect(element.reportValidity()).toBe(false);
  });

  it('restores its initial value when its form resets', async () => {
    const element = mount<NxInput>('nx-input', {
      label: 'Email',
      name: 'email',
      value: 'initial@example.com'
    });
    await settle(element);
    element.value = 'changed@example.com';
    await settle(element);

    element.formResetCallback();

    expect(element.value).toBe('initial@example.com');
    expect(element.shadowRoot?.querySelector('input')?.value).toBe('initial@example.com');
  });
});

describe('nx-textarea', () => {
  afterEach(() => document.body.replaceChildren());

  it('renders a labelled textarea with requested value and placeholder', async () => {
    const element = mount<NxTextarea>('nx-textarea', {
      label: 'Description',
      value: 'Initial text',
      placeholder: 'Write here'
    });
    await settle(element);
    const control = element.shadowRoot?.querySelector('textarea');

    expect(control?.value).toBe('Initial text');
    expect(control?.placeholder).toBe('Write here');
    expect(element.shadowRoot?.querySelector('label')?.htmlFor).toBe(control?.id);
  });

  it('supports disabled, required, constraints, rows, and columns', async () => {
    const element = mount<NxTextarea>('nx-textarea', {
      label: 'Required note',
      disabled: true,
      required: true,
      maxlength: 80,
      minlength: 4,
      rows: 5,
      cols: 30
    });
    await settle(element);
    const control = element.shadowRoot?.querySelector('textarea');

    expect(control?.disabled).toBe(true);
    expect(control?.required).toBe(true);
    expect(control?.maxLength).toBe(80);
    expect(control?.minLength).toBe(4);
    expect(control?.rows).toBe(5);
    expect(control?.cols).toBe(30);
  });

  it('supports readonly without disabling focus or interaction semantics', async () => {
    const element = mount<NxTextarea>('nx-textarea', { label: 'Read-only note', readOnly: true });
    await settle(element);
    const control = element.shadowRoot?.querySelector('textarea');
    control?.focus();

    expect(control?.readOnly).toBe(true);
    expect(control?.disabled).toBe(false);
    expect(element.shadowRoot?.activeElement).toBe(control);
  });

  it('associates helper and error text and exposes invalid state', async () => {
    const element = mount<NxTextarea>('nx-textarea', {
      label: 'Summary',
      helperText: 'At least four characters.',
      error: 'Summary is too short.'
    });
    await settle(element);
    const control = element.shadowRoot?.querySelector('textarea');
    const descriptionIds = control?.getAttribute('aria-describedby')?.split(' ') ?? [];

    expect(control?.getAttribute('aria-invalid')).toBe('true');
    expect(descriptionIds).toHaveLength(2);
    expect(descriptionIds.every((id) => element.shadowRoot?.getElementById(id))).toBe(true);
    expect(element.shadowRoot?.querySelector('[role="alert"]')?.textContent).toBe('Summary is too short.');
  });

  it('updates its value and emits a bubbling composed typed change event', async () => {
    const element = mount<NxTextarea>('nx-textarea', { label: 'Notes' });
    await settle(element);
    const listener = vi.fn();
    element.addEventListener('nx-change', listener);
    const control = element.shadowRoot?.querySelector('textarea');
    if (!control) throw new Error('Textarea was not rendered.');
    control.value = 'Changed';
    control.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await settle(element);

    expect(element.value).toBe('Changed');
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0]).toMatchObject({
      detail: { value: 'Changed' },
      bubbles: true,
      composed: true
    });
  });

  it('has an accessible name, helper, and error announcement', async () => {
    const element = mount<NxTextarea>('nx-textarea', {
      label: 'Description',
      helperText: 'Provide context.',
      error: 'Description is required.'
    });
    await expectAccessible(element);
  });

  it('updates ElementInternals validity and supports a custom validation message', async () => {
    const form = document.createElement('form');
    const element = mount<NxTextarea>('nx-textarea', {
      label: 'Required note',
      name: 'note',
      required: true
    });
    form.append(element);
    await settle(element);

    expect(element.checkValidity()).toBe(false);
    expect(element.validity.valueMissing).toBe(true);
    expect(element.reportValidity()).toBe(false);

    element.value = 'Valid note';
    await settle(element);
    expect(element.checkValidity()).toBe(true);
    element.setCustomValidity('Review this note.');
    expect(element.checkValidity()).toBe(false);
    expect(element.validationMessage).toBe('Review this note.');
    element.setCustomValidity('');
    await settle(element);
    expect(element.checkValidity()).toBe(true);
  });

  it('restores its initial value through formResetCallback', async () => {
    const form = document.createElement('form');
    const element = mount<NxTextarea>('nx-textarea', { label: 'Message', value: 'Initial' });
    form.append(element);
    await settle(element);
    element.value = 'Changed';
    await settle(element);

    element.formResetCallback();

    expect(element.value).toBe('Initial');
    expect(element.shadowRoot?.querySelector('textarea')?.value).toBe('Initial');
  });
});

describe('nx-checkbox', () => {
  afterEach(() => document.body.replaceChildren());

  it('supports checked and unchecked native states', async () => {
    const element = mount<NxCheckbox>('nx-checkbox', { label: 'Accept terms', checked: true });
    await settle(element);
    expect(element.shadowRoot?.querySelector('input')?.checked).toBe(true);
    element.checked = false;
    await settle(element);
    expect(element.shadowRoot?.querySelector('input')?.checked).toBe(false);
  });

  it('disables native interaction and preserves indeterminate state', async () => {
    const element = mount<NxCheckbox>('nx-checkbox', {
      label: 'Select all',
      disabled: true,
      indeterminate: true
    });
    await settle(element);
    const input = element.shadowRoot?.querySelector('input');
    const listener = vi.fn();
    element.addEventListener('nx-change', listener);
    input?.click();

    expect(input?.disabled).toBe(true);
    expect(input?.indeterminate).toBe(true);
    expect(listener).not.toHaveBeenCalled();
  });

  it('emits nx-change with checked state when activated by click', async () => {
    const element = mount<NxCheckbox>('nx-checkbox', { label: 'Subscribe', value: 'yes' });
    await settle(element);
    const listener = vi.fn();
    element.addEventListener('nx-change', listener);
    element.shadowRoot?.querySelector('input')?.click();
    await settle(element);

    expect(element.checked).toBe(true);
    expect(listener.mock.calls[0][0]).toMatchObject({
      detail: { checked: true, indeterminate: false, value: 'yes' },
      bubbles: true,
      composed: true
    });
  });

  it('is keyboard-focusable through its native control', async () => {
    const element = mount<NxCheckbox>('nx-checkbox', { label: 'Enable' });
    await settle(element);
    const input = element.shadowRoot?.querySelector('input');
    input?.focus();

    expect(element.shadowRoot?.activeElement).toBe(input);
    expect(input?.tabIndex).toBe(0);
  });

  it('exposes a native checkbox role and accessible label without axe violations', async () => {
    const element = mount<NxCheckbox>('nx-checkbox', { label: 'Accept terms', required: true });
    await settle(element);
    expect(element.shadowRoot?.querySelector('input')?.getAttribute('type')).toBe('checkbox');
    await expectAccessible(element);
  });

  it('sets required validity and restores default checked state on reset', async () => {
    const element = mount<NxCheckbox>('nx-checkbox', {
      name: 'accepted',
      label: 'Accept',
      value: 'yes',
      required: true
    });
    await settle(element);
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.valueMissing).toBe(true);

    element.checked = true;
    await settle(element);
    expect(element.checkValidity()).toBe(true);
    element.checked = false;
    element.formResetCallback();
    expect(element.checked).toBe(false);
  });
});

describe('nx-radio', () => {
  afterEach(() => document.body.replaceChildren());

  function makeGroup() {
    return [
      mount<NxRadio>('nx-radio', { label: 'Email', name: 'contact', value: 'email' }),
      mount<NxRadio>('nx-radio', { label: 'Phone', name: 'contact', value: 'phone' }),
      mount<NxRadio>('nx-radio', { label: 'Disabled', name: 'contact', value: 'disabled', disabled: true })
    ] as const;
  }

  it('uses the native default value when a radio value is omitted', async () => {
    const element = mount<NxRadio>('nx-radio', { label: 'Default option', name: 'default-option' });
    await settle(element);

    expect(element.value).toBe('on');
    expect(element.shadowRoot?.querySelector('input')?.value).toBe('on');
  });

  it('selects one radio and automatically deselects its named peer', async () => {
    const [email, phone] = makeGroup();
    await Promise.all([settle(email), settle(phone)]);
    email.shadowRoot?.querySelector('input')?.click();
    phone.shadowRoot?.querySelector('input')?.click();
    await Promise.all([settle(email), settle(phone)]);

    expect(email.checked).toBe(false);
    expect(phone.checked).toBe(true);
  });

  it('emits typed nx-change detail on selection', async () => {
    const [email] = makeGroup();
    await settle(email);
    const listener = vi.fn();
    email.addEventListener('nx-change', listener);
    email.shadowRoot?.querySelector('input')?.click();

    expect(listener.mock.calls[0][0]).toMatchObject({
      detail: { checked: true, name: 'contact', value: 'email' },
      bubbles: true,
      composed: true
    });
  });

  it('moves selection and focus with arrow keys, skipping disabled radios', async () => {
    const [email, phone, disabled] = makeGroup();
    await Promise.all([settle(email), settle(phone), settle(disabled)]);
    email.shadowRoot?.querySelector('input')?.click();
    const first = email.shadowRoot?.querySelector('input');
    first?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await settle(phone);

    expect(phone.checked).toBe(true);
    expect(phone.shadowRoot?.activeElement).toBe(phone.shadowRoot?.querySelector('input'));
    expect(disabled.checked).toBe(false);
  });

  it('keeps disabled radios unavailable and provides one tab stop per group', async () => {
    const [email, phone, disabled] = makeGroup();
    await Promise.all([settle(email), settle(phone), settle(disabled)]);

    expect(email.shadowRoot?.querySelector('input')?.tabIndex).toBe(0);
    expect(phone.shadowRoot?.querySelector('input')?.tabIndex).toBe(-1);
    expect(disabled.shadowRoot?.querySelector('input')?.disabled).toBe(true);
  });

  it('validates a required group and resets to the originally selected radio', async () => {
    const [email, phone] = [
      mount<NxRadio>('nx-radio', { label: 'Email', name: 'required-contact', value: 'email', required: true, checked: true }),
      mount<NxRadio>('nx-radio', { label: 'Phone', name: 'required-contact', value: 'phone' })
    ];
    await Promise.all([settle(email), settle(phone)]);
    phone.shadowRoot?.querySelector('input')?.click();
    expect(email.checked).toBe(false);
    expect(phone.checkValidity()).toBe(true);

    email.formResetCallback();
    expect(email.checked).toBe(true);
    expect(phone.checked).toBe(false);
  });

  it('exposes the native radio role and accessible label without axe violations', async () => {
    const element = mount<NxRadio>('nx-radio', { label: 'Email', name: 'contact', value: 'email' });
    await settle(element);
    expect(element.shadowRoot?.querySelector('input')?.getAttribute('type')).toBe('radio');
    await expectAccessible(element);
  });
});

describe('nx-switch', () => {
  afterEach(() => document.body.replaceChildren());

  it('supports on and off values with synchronized aria-checked', async () => {
    const element = mount<NxSwitch>('nx-switch', { label: 'Notifications', checked: true });
    await settle(element);
    const input = element.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('role')).toBe('switch');
    expect(input?.getAttribute('aria-checked')).toBe('true');
    element.checked = false;
    await settle(element);
    expect(input?.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles and emits nx-change through native checkbox activation', async () => {
    const element = mount<NxSwitch>('nx-switch', { label: 'Notifications', value: 'enabled' });
    await settle(element);
    const listener = vi.fn();
    element.addEventListener('nx-change', listener);
    element.shadowRoot?.querySelector('input')?.click();
    await settle(element);

    expect(element.checked).toBe(true);
    expect(listener.mock.calls[0][0]).toMatchObject({
      detail: { checked: true, value: 'enabled' },
      bubbles: true,
      composed: true
    });
  });

  it('is keyboard-focusable through its native control', async () => {
    const element = mount<NxSwitch>('nx-switch', { label: 'Notifications' });
    await settle(element);
    const input = element.shadowRoot?.querySelector('input');
    input?.focus();

    expect(element.shadowRoot?.activeElement).toBe(input);
    expect(input?.getAttribute('aria-checked')).toBe('false');
  });

  it('prevents changes when disabled and passes accessibility checks', async () => {
    const element = mount<NxSwitch>('nx-switch', { label: 'Notifications', disabled: true });
    await settle(element);
    const input = element.shadowRoot?.querySelector('input');
    input?.click();

    expect(input?.disabled).toBe(true);
    expect(input?.getAttribute('aria-checked')).toBe('false');
    await expectAccessible(element);
  });

  it('contributes only checked values and resets its initial checked state', async () => {
    const element = mount<NxSwitch>('nx-switch', {
      label: 'Notifications',
      name: 'notifications',
      value: 'on',
      checked: true
    });
    await settle(element);
    element.checked = false;
    element.formResetCallback();
    expect(element.checked).toBe(true);
    expect(element.shadowRoot?.querySelector('input')?.getAttribute('aria-checked')).toBe('true');
  });
});

describe('form control accessibility', () => {
  afterEach(() => document.body.replaceChildren());

  it.each([
    ['textarea error', () => mount<NxTextarea>('nx-textarea', { label: 'Summary', error: 'Required.' })],
    ['checked checkbox', () => mount<NxCheckbox>('nx-checkbox', { label: 'Accept', checked: true })],
    ['checked radio', () => mount<NxRadio>('nx-radio', { label: 'Email', name: 'contact', checked: true })],
    ['on switch', () => mount<NxSwitch>('nx-switch', { label: 'Notifications', checked: true })]
  ])('has an accessible name and no axe violations in %s state', async (_name, create) => {
    await expectAccessible(create());
  });
});
