import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NxButton } from '../packages/components/src/button/button';
import type { NxIconButton } from '../packages/components/src/icon-button/icon-button';
import '../packages/components/src/index';

type UpdateableElement = HTMLElement &
  Pick<NxButton, 'variant' | 'size' | 'fullWidth'> & { updateComplete: Promise<unknown> };

function createButton(attributes: Record<string, string> = {}, label = 'Save changes'): UpdateableElement {
  const element = document.createElement('nx-button') as UpdateableElement;
  element.textContent = label;
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  document.body.append(element);
  return element;
}

async function settle(element: UpdateableElement): Promise<void> {
  await element.updateComplete;
}

describe('nx-button', () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders a native button with its slotted accessible name', async () => {
    const element = createButton();
    await settle(element);
    const button = element.shadowRoot?.querySelector('button');

    expect(button).not.toBeNull();
    expect(element.textContent).toBe('Save changes');
    expect(element.shadowRoot?.querySelector('slot')).not.toBeNull();
  });

  it.each(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const)(
    'reflects the %s variant in its public host attribute',
    async (variant) => {
      const element = createButton({ variant });
      await settle(element);
      expect(element.variant).toBe(variant);
      expect(element.getAttribute('variant')).toBe(variant);
    }
  );

  it.each(['sm', 'md', 'lg'] as const)('supports %s size', async (size) => {
    const element = createButton({ size });
    await settle(element);
    expect(element.size).toBe(size);
    expect(element.shadowRoot?.querySelector('button')).not.toBeNull();
  });

  it('disables native interaction and exposes the disabled state', async () => {
    const element = createButton({ disabled: '' });
    await settle(element);
    const button = element.shadowRoot?.querySelector('button');
    const click = vi.fn();
    element.addEventListener('click', click);

    button?.click();

    expect(button?.disabled).toBe(true);
    expect(click).not.toHaveBeenCalled();
  });

  it('blocks interaction while loading and retains the accessible label', async () => {
    const element = createButton({ loading: '' });
    await settle(element);
    const button = element.shadowRoot?.querySelector('button');

    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(element.shadowRoot?.querySelector('.spinner')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(element.textContent).toBe('Save changes');
  });

  it('reflects fullWidth as a host attribute', async () => {
    const element = createButton({ 'full-width': '' });
    await settle(element);
    expect(element.fullWidth).toBe(true);
    expect(element.hasAttribute('full-width')).toBe(true);
  });

  it('preserves the native click event and configured button type', async () => {
    const element = createButton({ type: 'submit' });
    await settle(element);
    const click = vi.fn();
    element.addEventListener('click', click);
    element.shadowRoot?.querySelector('button')?.click();

    expect(element.shadowRoot?.querySelector('button')?.type).toBe('submit');
    expect(click).toHaveBeenCalledOnce();
  });

  it('receives keyboard focus through its native button', async () => {
    const element = createButton();
    await settle(element);
    const button = element.shadowRoot?.querySelector('button');

    button?.focus();

    expect(element.shadowRoot?.activeElement).toBe(button);
    expect(button?.tabIndex).toBe(0);
  });

  it('remains functional when the document theme changes', async () => {
    const element = createButton();
    await settle(element);
    const click = vi.fn();
    element.addEventListener('click', click);

    document.documentElement.setAttribute('data-theme', 'dark');
    await settle(element);
    element.shadowRoot?.querySelector('button')?.click();

    expect(click).toHaveBeenCalledOnce();
    expect(element.shadowRoot?.querySelector('button')?.disabled).toBe(false);
  });
});

describe('nx-button accessibility', () => {
  afterEach(() => document.body.replaceChildren());

  const axeCases: Array<[string, Record<string, string>]> = [
    ['default primary', {}],
    ['disabled', { disabled: '' }],
    ['loading', { loading: '' }],
    ...(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const).map(
      (variant) => [variant, { variant }] as [string, Record<string, string>]
    ),
    ...(['sm', 'md', 'lg'] as const).map(
      (size) => [`${size} size`, { size }] as [string, Record<string, string>]
    )
  ];

  it.each(axeCases)('has no WCAG A/AA accessibility violations in %s state', async (_name, attributes) => {
    const element = createButton(attributes);
    await settle(element);
    const results = await axe.run(element, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      },
      rules: {
        'color-contrast': { enabled: false }
      }
    });

    expect(results.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
  });
});

describe('nx-icon-button', () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  function createIconButton(attributes: Record<string, string> = {}): HTMLElement & NxIconButton & { updateComplete: Promise<unknown> } {
    const element = document.createElement('nx-icon-button') as HTMLElement & NxIconButton & { updateComplete: Promise<unknown> };
    element.setAttribute('aria-label', 'Close dialog');
    element.setAttribute('icon', 'close');
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    document.body.append(element);
    return element;
  }

  it('renders a labelled native button with a decorative nx-icon', async () => {
    const element = createIconButton();
    await element.updateComplete;
    await (element.shadowRoot?.querySelector('nx-icon') as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    const button = element.shadowRoot?.querySelector('button');
    const icon = element.shadowRoot?.querySelector('nx-icon');

    for (let attempt = 0; attempt < 50 && !icon?.shadowRoot?.querySelector('svg'); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    expect(button?.tagName).toBe('BUTTON');
    expect(button?.getAttribute('aria-label')).toBe('Close dialog');
    expect(button?.type).toBe('button');
    expect(icon?.getAttribute('name')).toBe('close');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.shadowRoot?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('warns in development without inventing an accessible name', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const element = createIconButton();
    element.removeAttribute('aria-label');
    await element.updateComplete;

    expect(element.shadowRoot?.querySelector('button')?.hasAttribute('aria-label')).toBe(false);
    expect(warning).toHaveBeenCalledWith(
      '<nx-icon-button> requires a meaningful aria-label for an accessible name.'
    );
  });

  it('uses native click events and reflects the configured type', async () => {
    const element = createIconButton({ type: 'submit' });
    await element.updateComplete;
    const click = vi.fn();
    element.addEventListener('click', click);
    element.shadowRoot?.querySelector('button')?.click();

    expect(element.shadowRoot?.querySelector('button')?.type).toBe('submit');
    expect(click).toHaveBeenCalledOnce();
    expect(customElements.get('nx-icon')).toBeDefined();
  });

  it('uses the native disabled state and updates dynamically', async () => {
    const element = createIconButton();
    await element.updateComplete;
    const button = element.shadowRoot?.querySelector('button');
    const click = vi.fn();
    element.addEventListener('click', click);
    element.disabled = true;
    await element.updateComplete;
    button?.click();

    expect(button?.disabled).toBe(true);
    expect(click).not.toHaveBeenCalled();
    element.disabled = false;
    await element.updateComplete;
    expect(button?.disabled).toBe(false);
  });

  it.each(['sm', 'md', 'lg'] as const)('supports the %s size and updates icon sizing', async (size) => {
    const element = createIconButton({ size });
    await element.updateComplete;

    expect(element.size).toBe(size);
    expect(element.shadowRoot?.querySelector('nx-icon')?.getAttribute('size')).toBe(size);
  });

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)(
    'supports the %s variant',
    async (variant) => {
      const element = createIconButton({ variant });
      await element.updateComplete;
      expect(element.variant).toBe(variant);
      expect(element.getAttribute('variant')).toBe(variant);
    }
  );

  it('updates the icon, size, and disabled state when properties change', async () => {
    const element = createIconButton();
    await element.updateComplete;
    element.icon = 'search';
    element.size = 'lg';
    element.disabled = true;
    await element.updateComplete;

    expect(element.shadowRoot?.querySelector('nx-icon')?.getAttribute('name')).toBe('search');
    expect(element.shadowRoot?.querySelector('nx-icon')?.getAttribute('size')).toBe('lg');
    expect(element.shadowRoot?.querySelector('button')?.disabled).toBe(true);
  });

  it('supports focus through the native button', async () => {
    const element = createIconButton();
    await element.updateComplete;
    const button = element.shadowRoot?.querySelector('button');
    button?.focus();

    expect(element.shadowRoot?.activeElement).toBe(button);
    expect(button?.tabIndex).toBe(0);
  });
});

describe('nx-icon-button accessibility', () => {
  afterEach(() => document.body.replaceChildren());

  it.each([
    ['default', {}],
    ['disabled', { disabled: '' }],
    ...(['primary', 'secondary', 'ghost', 'danger'] as const).map(
      (variant) => [variant, { variant }] as [string, Record<string, string>]
    ),
    ...(['sm', 'md', 'lg'] as const).map(
      (size) => [`${size} size`, { size }] as [string, Record<string, string>]
    )
  ])('has no axe-core WCAG A/AA violations in %s state', async (_state, attributes) => {
    const element = document.createElement('nx-icon-button') as HTMLElement & NxIconButton & { updateComplete: Promise<unknown> };
    element.setAttribute('icon', 'close');
    element.setAttribute('aria-label', 'Close dialog');
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    document.body.append(element);
    await element.updateComplete;

    const results = await axe.run(element, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(results.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
  });
});

describe('other registered Nexora components', () => {
  it('keeps the input, card, and badge registered', () => {
    expect(customElements.get('nx-input')).toBeDefined();
    expect(customElements.get('nx-card')).toBeDefined();
    expect(customElements.get('nx-badge')).toBeDefined();
  });
});
