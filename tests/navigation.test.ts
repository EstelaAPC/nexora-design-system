import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NxBreadcrumb } from '../packages/components/src/breadcrumb/breadcrumb';
import type { NxPagination } from '../packages/components/src/pagination/pagination';
import type { NxTabs } from '../packages/components/src/tabs/tabs';
import '../packages/components/src/breadcrumb/breadcrumb';
import '../packages/components/src/pagination/pagination';
import '../packages/components/src/tabs/tabs';

type Ready<T extends HTMLElement> = T & { updateComplete: Promise<unknown> };

function mount<T extends HTMLElement>(tag: string, properties: Record<string, unknown> = {}, markup = ''): Ready<T> {
  const element = document.createElement(tag) as Ready<T>;
  Object.assign(element, properties);
  element.innerHTML = markup;
  document.body.append(element);
  return element;
}

async function settle(element: Ready<HTMLElement>): Promise<void> {
  await element.updateComplete;
  await Promise.resolve();
}

describe('navigation components', () => {
  afterEach(() => document.body.replaceChildren());

  it('renders native breadcrumb navigation, links, and a current-page label', async () => {
    const element = mount<NxBreadcrumb>(
      'nx-breadcrumb',
      {
        label: 'You are here',
        items: [
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Details', href: '/products/details' }
        ]
      }
    );
    await settle(element);

    expect(element.shadowRoot?.querySelector('nav')?.getAttribute('aria-label')).toBe('You are here');
    expect(element.shadowRoot?.querySelectorAll('ol > li')).toHaveLength(3);
    expect(element.shadowRoot?.querySelector('a[href="/"]')?.textContent).toBe('Home');
    expect(element.shadowRoot?.querySelector('[aria-current="page"]')?.textContent).toBe('Details');
    expect(element.shadowRoot?.querySelectorAll('a')).toHaveLength(2);
  });

  it('supports automatic tab activation and complete tab/tabpanel relationships', async () => {
    const element = mount<NxTabs>(
      'nx-tabs',
      { label: 'Account settings' },
      '<button slot="tab">Profile</button><button slot="tab">Security</button>' +
        '<section slot="panel">Profile content</section><section slot="panel">Security content</section>'
    );
    await settle(element);

    const tabs = Array.from(element.querySelectorAll<HTMLElement>('[slot="tab"]'));
    const panels = Array.from(element.querySelectorAll<HTMLElement>('[slot="panel"]'));
    expect(element.shadowRoot?.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe('Account settings');
    expect(tabs[0]?.getAttribute('role')).toBe('tab');
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs[0]?.getAttribute('aria-controls')).toBe(panels[0]?.id);
    expect(panels[0]?.getAttribute('role')).toBe('tabpanel');
    expect(panels[0]?.getAttribute('aria-labelledby')).toBe(tabs[0]?.id);
    expect(panels[0]?.hidden).toBe(false);
    expect(panels[1]?.hidden).toBe(true);

    tabs[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(element);
    expect(element.selectedIndex).toBe(1);
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(panels[1]?.hidden).toBe(false);
    expect(document.activeElement).toBe(tabs[1]);

    tabs[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));
    await settle(element);
    expect(element.selectedIndex).toBe(0);
    expect(document.activeElement).toBe(tabs[0]);
  });

  it('changes pagination within bounds and emits a bubbling composed typed event', async () => {
    const element = mount<NxPagination>('nx-pagination', { currentPage: 6, totalPages: 12 });
    await settle(element);
    const changed = vi.fn();
    element.addEventListener('nx-page-change', changed);

    expect(element.shadowRoot?.querySelectorAll('ol button')).toHaveLength(5);
    expect(element.shadowRoot?.querySelectorAll('.ellipsis')).toHaveLength(2);
    expect(element.shadowRoot?.querySelector('[aria-current="page"]')?.textContent).toBe('6');

    element.shadowRoot?.querySelector<HTMLElement>('button[aria-label="Next page"]')?.click();
    await settle(element);
    expect(element.currentPage).toBe(7);
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({
      detail: { page: 7 },
      bubbles: true,
      composed: true
    }));

    element.currentPage = 12;
    await settle(element);
    const next = element.shadowRoot?.querySelector<HTMLElement>('button[aria-label="Next page"]');
    next?.click();
    expect(next?.hasAttribute('disabled')).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('bounds the page controls and clamps an out-of-range current page', async () => {
    const element = mount<NxPagination>('nx-pagination', { currentPage: 30, totalPages: 20 });
    await settle(element);

    expect(element.currentPage).toBe(20);
    expect(element.shadowRoot?.querySelectorAll('ol button')).toHaveLength(6);
    expect(element.shadowRoot?.querySelectorAll('.ellipsis')).toHaveLength(1);
    expect(element.shadowRoot?.querySelector('button[aria-label="Previous page"]')?.hasAttribute('disabled')).toBe(false);
    expect(element.shadowRoot?.querySelector('button[aria-label="Next page"]')?.hasAttribute('disabled')).toBe(true);
  });

  it('has no axe-core WCAG A/AA violations for breadcrumb, tabs, and pagination', async () => {
    const breadcrumb = mount<NxBreadcrumb>('nx-breadcrumb', {
      items: [{ label: 'Home', href: '/' }, { label: 'Current page' }]
    });
    const tabs = mount<NxTabs>(
      'nx-tabs',
      {},
      '<button slot="tab">First</button><button slot="tab">Second</button>' +
        '<section slot="panel">First panel content</section><section slot="panel">Second panel content</section>'
    );
    const pagination = mount<NxPagination>('nx-pagination', { currentPage: 2, totalPages: 5 });
    await Promise.all([settle(breadcrumb), settle(tabs), settle(pagination)]);

    for (const element of [breadcrumb, tabs, pagination]) {
      const results = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: { 'color-contrast': { enabled: false } }
      });
      expect(results.violations, results.violations.map(({ id, help }) => `${id}: ${help}`).join('\n')).toEqual([]);
    }
  });
});
