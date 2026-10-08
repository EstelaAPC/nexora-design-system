import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import type { NxIcon } from '../packages/components/src/icon/icon';
import '../packages/components/src/icon/icon';

type Ready<T extends HTMLElement> = T & { updateComplete: Promise<unknown> };

const pathCountByName: Record<string, number> = {
  check: 1,
  close: 2,
  plus: 2,
  minus: 1,
  'chevron-down': 1,
  'chevron-up': 1,
  'arrow-left': 2,
  'arrow-right': 2,
  info: 3,
  warning: 3,
  search: 2
};

function mount(attributes: Record<string, string> = {}): Ready<NxIcon> {
  const element = document.createElement('nx-icon') as Ready<NxIcon>;
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  document.body.append(element);
  return element;
}

async function settleIcon(element: Ready<NxIcon>): Promise<void> {
  await element.updateComplete;
  const expectedPaths = pathCountByName[element.name] ?? 0;
  for (
    let attempt = 0;
    attempt < 50 &&
    (element.shadowRoot?.querySelectorAll('path').length ?? 0) !== expectedPaths;
    attempt += 1
  ) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    await element.updateComplete;
  }
}

describe('nx-icon', () => {
  afterEach(() => document.body.replaceChildren());

  it('renders the named SVG inside its Shadow DOM', async () => {
    const element = mount({ name: 'check' });
    expect(element.name).toBe('check');
    await settleIcon(element);
    const svg = element.shadowRoot?.querySelector('svg');

    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg?.querySelector('path')?.getAttribute('d')).toBe('m5 12.5 4.2 4.2L19 6.9');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
  });

  it('is decorative and hidden from assistive technology by default', async () => {
    const element = mount({ name: 'check' });
    await settleIcon(element);
    const svg = element.shadowRoot?.querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.hasAttribute('role')).toBe(false);
  });

  it('exposes a named image when aria-label or title is provided', async () => {
    const labelled = mount({ name: 'warning', 'aria-label': 'Attention' });
    await settleIcon(labelled);
    expect(labelled.shadowRoot?.querySelector('svg')?.getAttribute('role')).toBe('img');
    expect(labelled.shadowRoot?.querySelector('svg')?.getAttribute('aria-label')).toBe('Attention');
    expect(labelled.shadowRoot?.querySelector('svg')?.hasAttribute('aria-hidden')).toBe(false);

    document.body.replaceChildren();
    const titled = mount({ name: 'info', title: 'More information' });
    await settleIcon(titled);
    const svg = titled.shadowRoot?.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-labelledby')).toBe(titled.shadowRoot?.querySelector('title')?.id);
    expect(titled.shadowRoot?.querySelector('title')?.textContent).toBe('More information');
  });

  it('silently renders no SVG for an unknown name', async () => {
    const element = mount({ name: 'icon-that-does-not-exist' });
    await settleIcon(element);

    expect(element.shadowRoot?.querySelector('svg')).toBeNull();
  });

  it.each(['sm', 'md', 'lg'] as const)('supports the %s size', async (size) => {
    const element = mount({ name: 'plus', size });
    await settleIcon(element);

    expect(element.size).toBe(size);
    expect(element.shadowRoot?.querySelector('svg')).toBeTruthy();
  });

  it('inherits currentColor instead of embedding a fixed icon color', async () => {
    const element = mount({ name: 'search' });
    element.style.color = 'rgb(1, 2, 3)';
    document.body.append(element);
    await settleIcon(element);

    expect(element.shadowRoot?.querySelector('svg')?.getAttribute('stroke')).toBe('currentColor');
    expect(window.getComputedStyle(element).color).toBe('rgb(1, 2, 3)');
  });

  it('updates the icon and dimensions when properties change', async () => {
    const element = mount({ name: 'close', size: 'sm' });
    await settleIcon(element);
    expect(element.shadowRoot?.querySelectorAll('path')).toHaveLength(2);

    element.name = 'minus';
    element.size = 'lg';
    await settleIcon(element);
    expect(element.shadowRoot?.querySelectorAll('path')).toHaveLength(1);
    expect(element.size).toBe('lg');
    expect(element.getAttribute('size')).toBe('lg');
  });

  it('has no axe-core violations for decorative, labelled or button-contained icons', async () => {
    const samples: HTMLElement[] = [
      mount({ name: 'check' }),
      mount({ name: 'warning', 'aria-label': 'Warning' })
    ];
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Close dialog');
    button.append(mount({ name: 'close' }));
    document.body.append(button);
    samples.push(button);

    for (const sample of samples) {
      const icon = sample.matches('nx-icon') ? sample as Ready<NxIcon> : sample.querySelector('nx-icon') as Ready<NxIcon>;
      await settleIcon(icon);
      const report = await axe.run(sample, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: { 'color-contrast': { enabled: false } }
      });
      expect(report.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
    }
  });
});
