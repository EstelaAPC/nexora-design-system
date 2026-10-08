import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import type { NxTable, NxTableColumn, NxTableRow } from '../packages/components/src/table/table';
import '../packages/components/src/table/table';

type Ready<T extends HTMLElement> = T & { updateComplete: Promise<unknown> };

interface Person extends NxTableRow {
  name: string;
  role: string;
  active: boolean;
}

const columns: NxTableColumn<Person>[] = [
  { key: 'name', header: 'Name', rowHeader: true },
  { key: 'role', header: 'Role' },
  { key: 'active', header: 'Active' }
];

function mount(properties: Partial<NxTable> = {}): Ready<NxTable> {
  const element = document.createElement('nx-table') as Ready<NxTable>;
  Object.assign(element, properties);
  document.body.append(element);
  return element;
}

async function settle(element: Ready<NxTable>): Promise<void> {
  await element.updateComplete;
}

describe('nx-table', () => {
  afterEach(() => document.body.replaceChildren());

  it('renders native table semantics, a caption, and typed row and column headers', async () => {
    const element = mount({
      header: 'Team members',
      columns,
      rows: [{ name: 'Ada', role: 'Engineer', active: true }]
    });
    await settle(element);
    const root = element.shadowRoot;

    expect(root?.querySelector('table')).not.toBeNull();
    expect(root?.querySelector('caption')?.textContent).toBe('Team members');
    expect(root?.querySelectorAll('thead th[scope="col"]')).toHaveLength(3);
    expect(root?.querySelector('tbody th[scope="row"]')?.textContent).toBe('Ada');
    expect(root?.querySelectorAll('tbody td')).toHaveLength(2);
    expect(root?.querySelector('tbody')?.textContent).toContain('Engineer');
    expect(root?.querySelector('tbody')?.textContent).toContain('true');
  });

  it('supports empty tables with an accessible empty-state message', async () => {
    const element = mount({
      columns: [{ key: 'name', header: 'Name' }],
      rows: [],
      emptyState: 'No team members found.'
    });
    await settle(element);
    const emptyCell = element.shadowRoot?.querySelector('tbody td');

    expect(emptyCell?.getAttribute('colspan')).toBe('1');
    expect(emptyCell?.textContent).toBe('No team members found.');
  });

  it('supports striped, hover, and compact density options', async () => {
    const element = mount({
      columns: [{ key: 'name', header: 'Name' }],
      rows: [{ name: 'Ada' }],
      striped: true,
      hover: true,
      density: 'compact'
    });
    await settle(element);

    expect(element.hasAttribute('striped')).toBe(true);
    expect(element.hasAttribute('hover')).toBe(true);
    expect(element.getAttribute('density')).toBe('compact');
  });

  it('renders cell content as text and leaves nullish values empty', async () => {
    const element = mount({
      columns: [{ key: 'content', header: 'Content' }, { key: 'missing', header: 'Missing' }],
      rows: [{ content: '<img src=x onerror=alert(1)>', missing: null }]
    });
    await settle(element);

    expect(element.shadowRoot?.querySelector('img')).toBeNull();
    expect(element.shadowRoot?.querySelector('tbody td')?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(element.shadowRoot?.querySelectorAll('tbody td')[1]?.textContent).toBe('');
  });

  it('rejects unsupported object cell data rather than silently hiding it', async () => {
    const element = mount({
      columns: [{ key: 'value', header: 'Value' }],
      rows: [{ value: { nested: 'data' } as never }]
    });

    await expect(settle(element)).rejects.toThrow('must be a string, number, boolean, or nullish value');
  });

  it('has no axe-core violations when rendered with a caption and headers', async () => {
    const element = mount({
      header: 'Team members',
      columns,
      rows: [{ name: 'Ada', role: 'Engineer', active: true }]
    });
    await settle(element);
    const result = await axe.run(element, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } }
    });

    expect(result.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
  });

  it('has no axe-core violations for its empty state', async () => {
    const element = mount({
      header: 'Team members',
      columns: [{ key: 'name', header: 'Name' }],
      rows: []
    });
    await settle(element);
    const result = await axe.run(element, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } }
    });

    expect(result.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
  });
});
