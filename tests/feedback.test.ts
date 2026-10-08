import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NxAlert } from '../packages/components/src/alert/alert';
import type { NxProgress } from '../packages/components/src/progress/progress';
import type { NxSpinner } from '../packages/components/src/spinner/spinner';
import type { NxToast } from '../packages/components/src/toast/toast';
import '../packages/components/src/alert/alert';
import '../packages/components/src/progress/progress';
import '../packages/components/src/spinner/spinner';
import '../packages/components/src/toast/toast';

type Ready<T extends HTMLElement> = T & { updateComplete: Promise<unknown> };

function mount<T extends HTMLElement>(tag: string, properties: Record<string, unknown> = {}, content = ''): Ready<T> {
  const element = document.createElement(tag) as Ready<T>;
  Object.assign(element, properties);
  element.innerHTML = content;
  document.body.append(element);
  return element;
}

async function settle<T extends HTMLElement>(element: Ready<T>): Promise<void> {
  await element.updateComplete;
  await Promise.resolve();
}

describe('feedback components', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('renders nx-alert severity roles, heading and a working dismiss button', async () => {
    const alert = mount<NxAlert>('nx-alert', {
      severity: 'error',
      heading: 'Save failed',
      dismissible: true
    }, 'Please try again.');
    await settle(alert);
    await settle(alert.shadowRoot?.querySelector('nx-button') as Ready<HTMLElement>);

    expect(alert.shadowRoot?.querySelector('[role="alert"]')).toBeTruthy();
    expect(alert.shadowRoot?.querySelector('h2')?.textContent).toBe('Save failed');
    const dismissed = vi.fn();
    document.body.addEventListener('nx-dismiss', dismissed, { once: true });
    const close = alert.shadowRoot?.querySelector('nx-button') as HTMLElement;
    expect(close.textContent).toContain('Dismiss alert');
    close.click();
    expect(document.body.contains(alert)).toBe(false);
    expect(dismissed).toHaveBeenCalledOnce();
  });

  it('uses a polite status role for non-urgent alerts', async () => {
    const alert = mount<NxAlert>('nx-alert', { severity: 'success' }, 'Saved.');
    await settle(alert);
    expect(alert.shadowRoot?.querySelector('[role="status"]')).toBeTruthy();
  });

  it('provides labelled and decorative spinner modes at supported sizes', async () => {
    const labelled = mount<NxSpinner>('nx-spinner', { size: 'lg', label: 'Loading results' });
    await settle(labelled);
    const spinner = labelled.shadowRoot?.querySelector('.spinner');
    expect(labelled.getAttribute('size')).toBe('lg');
    expect(spinner?.getAttribute('role')).toBe('status');
    expect(spinner?.getAttribute('aria-label')).toBe('Loading results');

    document.body.replaceChildren();
    const decorative = mount<NxSpinner>('nx-spinner');
    await settle(decorative);
    expect(decorative.shadowRoot?.querySelector('.spinner')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('normalizes determinate progress values and omits value for indeterminate progress', async () => {
    const progress = mount<NxProgress>('nx-progress', { value: 120, max: 80, label: 'Upload' });
    await settle(progress);
    let bar = progress.shadowRoot?.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuemin')).toBe('0');
    expect(bar?.getAttribute('aria-valuemax')).toBe('80');
    expect(bar?.getAttribute('aria-valuenow')).toBe('80');

    progress.value = undefined;
    await settle(progress);
    bar = progress.shadowRoot?.querySelector('[role="progressbar"]');
    expect(bar?.hasAttribute('aria-valuenow')).toBe(false);
    expect(bar?.getAttribute('aria-valuetext')).toBe('Loading');
    expect(bar?.hasAttribute('indeterminate')).toBe(true);
  });

  it('announces toast urgency, allows manual close and pauses its duration on hover', async () => {
    vi.useFakeTimers();
    const toast = mount<NxToast>('nx-toast', {
      open: true,
      severity: 'error',
      duration: 1000
    }, 'Upload failed.');
    await settle(toast);
    expect(toast.shadowRoot?.querySelector('[role="alert"]')?.getAttribute('aria-live')).toBe('assertive');

    const liveRegion = toast.shadowRoot?.querySelector('.toast');
    liveRegion?.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(1500);
    expect(toast.open).toBe(true);

    liveRegion?.dispatchEvent(new Event('pointerleave'));
    await vi.advanceTimersByTimeAsync(999);
    expect(toast.open).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    await settle(toast);
    expect(toast.open).toBe(false);
    expect(toast.shadowRoot?.querySelector('.toast')).toBeNull();
  });

  it('does not auto-dismiss a toast when duration is zero and supports manual dismissal', async () => {
    vi.useFakeTimers();
    const toast = mount<NxToast>('nx-toast', { open: true, duration: 0, dismissible: true }, 'Saved.');
    await settle(toast);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(toast.shadowRoot?.querySelector('[role="status"]')).toBeTruthy();

    const dismissed = vi.fn();
    document.body.addEventListener('nx-dismiss', dismissed, { once: true });
    (toast.shadowRoot?.querySelector('nx-button') as HTMLElement).click();
    await settle(toast);
    expect(toast.open).toBe(false);
    expect(dismissed).toHaveBeenCalledOnce();
  });

  it('pauses automatic toast dismissal while a child button has focus', async () => {
    vi.useFakeTimers();
    const toast = mount<NxToast>('nx-toast', { open: true, duration: 1000 }, 'Saved.');
    await settle(toast);
    const button = toast.shadowRoot?.querySelector('nx-button') as Ready<HTMLElement>;
    await settle(button);
    const nativeButton = button.shadowRoot?.querySelector('button') as HTMLElement;

    nativeButton.focus();
    await vi.advanceTimersByTimeAsync(1500);
    expect(toast.open).toBe(true);

    nativeButton.blur();
    await vi.advanceTimersByTimeAsync(999);
    expect(toast.open).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    await settle(toast);
    expect(toast.open).toBe(false);
  });

  it('has no axe-core violations for labelled alerts, progress, spinner and toasts', async () => {
    const alert = mount<NxAlert>('nx-alert', { heading: 'Connection issue', severity: 'warning' }, 'Check your network.');
    const progress = mount<NxProgress>('nx-progress', { label: 'Download', value: 30 });
    const spinner = mount<NxSpinner>('nx-spinner', { label: 'Loading page' });
    const toast = mount<NxToast>('nx-toast', { open: true, duration: 0 }, 'Changes saved.');

    for (const element of [alert, progress, spinner, toast]) {
      await settle(element);
      for (const button of element.shadowRoot?.querySelectorAll('nx-button') ?? []) {
        await settle(button as Ready<HTMLElement>);
      }
      const report = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: { 'color-contrast': { enabled: false } }
      });
      expect(report.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
    }
  });
});
