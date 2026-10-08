import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import type { NxDialog } from '../packages/components/src/dialog/dialog';
import type { NxPopover } from '../packages/components/src/popover/popover';
import type { NxTooltip } from '../packages/components/src/tooltip/tooltip';
import '../packages/components/src/dialog/dialog';
import '../packages/components/src/popover/popover';
import '../packages/components/src/tooltip/tooltip';

type Ready<T extends HTMLElement> = T & { updateComplete: Promise<unknown> };
type NativeDialog = HTMLElement & {
  open: boolean;
  showModal: () => void;
  close: () => void;
};

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

describe('overlay components', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('opens nx-dialog modally, handles cancel, closes and restores focus', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const dialogComponent = mount<NxDialog>('nx-dialog', { title: 'Delete item' }, 'Confirm deletion?');
    await settle(dialogComponent);
    const nativeDialog = dialogComponent.shadowRoot?.querySelector('dialog') as NativeDialog;
    nativeDialog.showModal = () => { nativeDialog.open = true; };
    nativeDialog.close = () => { nativeDialog.open = false; };

    dialogComponent.open = true;
    await settle(dialogComponent);
    expect(nativeDialog.open).toBe(true);
    expect(nativeDialog.getAttribute('aria-modal')).toBe('true');
    expect(nativeDialog.getAttribute('aria-labelledby')).toBe(
      nativeDialog.querySelector('h2')?.id
    );

    const cancel = new Event('cancel', { cancelable: true });
    nativeDialog.dispatchEvent(cancel);
    await settle(dialogComponent);
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialogComponent.open).toBe(false);
    expect(document.activeElement).toBe(trigger);

    dialogComponent.open = true;
    await settle(dialogComponent);
    const closeButton = dialogComponent.shadowRoot?.querySelector('nx-icon-button') as HTMLElement;
    closeButton.click();
    await settle(dialogComponent);
    expect(dialogComponent.open).toBe(false);
  });

  it('supports non-modal dialogs and generates distinct title ids per instance', async () => {
    const first = mount<NxDialog>('nx-dialog', { open: true, modal: false, title: 'First dialog' });
    const second = mount<NxDialog>('nx-dialog', { open: true, title: 'Second dialog' });
    await Promise.all([settle(first), settle(second)]);
    const firstDialog = first.shadowRoot?.querySelector('dialog') as NativeDialog;
    const secondDialog = second.shadowRoot?.querySelector('dialog') as NativeDialog;
    expect(firstDialog.open).toBe(true);
    expect(firstDialog.getAttribute('aria-modal')).toBe('false');
    expect(secondDialog.getAttribute('aria-modal')).toBe('true');
    expect(firstDialog.getAttribute('aria-labelledby')).not.toBe(
      secondDialog.getAttribute('aria-labelledby')
    );
  });

  it('shows tooltips on focus and hover, describes the trigger and dismisses on Escape', async () => {
    const tooltip = mount<NxTooltip>('nx-tooltip', { text: 'More information' }, '<button>Details</button>');
    await settle(tooltip);
    const button = tooltip.querySelector('button') as HTMLElement;
    const tip = tooltip.shadowRoot?.querySelector('[role="tooltip"]') as HTMLElement;
    const tooltipId = tip.id;
    expect(button.getAttribute('aria-describedby')).toContain(tooltipId);

    button.dispatchEvent(new Event('focusin', { bubbles: true, composed: true }));
    await settle(tooltip);
    expect(tip.hidden).toBe(false);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle(tooltip);
    expect(tip.hidden).toBe(true);

    button.dispatchEvent(new Event('focusout', { bubbles: true, composed: true }));
    tooltip.shadowRoot?.querySelector('.trigger')?.dispatchEvent(new Event('pointerenter'));
    await settle(tooltip);
    expect(tip.hidden).toBe(false);
    tooltip.shadowRoot?.querySelector('.trigger')?.dispatchEvent(new Event('pointerleave'));
    await settle(tooltip);
    expect(tip.hidden).toBe(true);
  });

  it('preserves existing descriptions and restores them when a tooltip disconnects', async () => {
    const tooltip = mount<NxTooltip>(
      'nx-tooltip',
      { text: 'Helpful detail' },
      '<button aria-describedby="existing-description">Help</button>'
    );
    await settle(tooltip);
    const button = tooltip.querySelector('button') as HTMLElement;
    expect(button.getAttribute('aria-describedby')).toMatch(/^existing-description nx-tooltip-/);
    tooltip.remove();
    expect(button.getAttribute('aria-describedby')).toBe('existing-description');
  });

  it('supports click/manual popovers, outside dismissal, Escape and close button', async () => {
    const popover = mount<NxPopover>(
      'nx-popover',
      { title: 'Actions', placement: 'right' },
      '<span slot="trigger">More actions</span><button>Rename</button>'
    );
    await settle(popover);
    const trigger = popover.shadowRoot?.querySelector<HTMLElement>('.trigger') as HTMLElement;
    const surface = popover.shadowRoot?.querySelector<HTMLElement>('.surface') as HTMLElement;
    expect(surface.hidden).toBe(true);

    trigger.click();
    await settle(popover);
    expect(popover.open).toBe(true);
    expect(surface.hidden).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(surface.getAttribute('aria-labelledby')).toBe(surface.querySelector('h2')?.id);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(popover);
    expect(popover.open).toBe(false);
    expect(popover.shadowRoot?.activeElement).toBe(trigger);

    trigger.click();
    await settle(popover);
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    await settle(popover);
    expect(popover.open).toBe(false);

    popover.trigger = 'manual';
    await settle(popover);
    trigger.click();
    await settle(popover);
    expect(popover.open).toBe(false);
    popover.open = true;
    await settle(popover);
    (popover.shadowRoot?.querySelector('nx-icon-button') as HTMLElement).click();
    await settle(popover);
    expect(popover.open).toBe(false);
  });

  it('has no axe-core violations for accessible open overlays', async () => {
    const dialog = mount<NxDialog>('nx-dialog', { open: true, title: 'Account settings' }, 'Update your account.');
    const tooltip = mount<NxTooltip>('nx-tooltip', { text: 'Explains this action' }, '<button>Details</button>');
    const popover = mount<NxPopover>(
      'nx-popover',
      { open: true, title: 'Available actions' },
      '<span slot="trigger">Actions</span><button>Rename</button>'
    );

    for (const element of [dialog, tooltip, popover]) {
      await settle(element);
      const report = await axe.run(element, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: { 'color-contrast': { enabled: false } }
      });
      expect(report.violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([]);
    }
  });
});
