import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../icon-button/icon-button';
import '../icon/icon';

let dialogInstance = 0;
type NativeDialog = HTMLElement & {
  open: boolean;
  showModal?: () => void;
  show?: () => void;
  close?: () => void;
};

@customElement('nx-dialog')
export class NxDialog extends LitElement {
  static styles = css`
    :host {
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans);
    }

    dialog {
      width: min(36rem, calc(100vw - 2rem));
      max-height: min(80vh, 48rem);
      padding: 0;
      overflow: auto;
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-radius: var(--nx-radius-lg);
      background: var(--nx-color-surface);
      color: inherit;
      box-shadow: var(--nx-elevation-high);
    }

    dialog::backdrop {
      background: rgb(0 0 0 / 55%);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--nx-spacing-4);
      padding: var(--nx-spacing-4) var(--nx-spacing-5);
      border-block-end: var(--nx-border-width-thin) solid var(--nx-color-border);
    }

    h2 {
      margin: 0;
      font-size: var(--nx-font-size-lg);
      font-weight: var(--nx-font-weight-semibold);
      line-height: 1.3;
    }

    .content {
      padding: var(--nx-spacing-5);
      line-height: 1.5;
    }

    @media (prefers-reduced-motion: reduce) {
      dialog {
        scroll-behavior: auto;
      }
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: Boolean, reflect: true })
  modal = true;

  @property({ type: String })
  title = 'Dialog';

  private readonly titleId = `nx-dialog-title-${++dialogInstance}`;
  private previousFocus: HTMLElement | null = null;
  private shownModal: boolean | undefined;
  private suppressNativeClose = false;

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('open') && this.open && changed.get('open') !== true) {
      this.previousFocus = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    }

    if (changed.has('open') || changed.has('modal')) this.syncDialog();
  }

  private get dialogElement(): NativeDialog | null {
    return this.renderRoot.querySelector<HTMLElement>('dialog') as NativeDialog | null;
  }

  private syncDialog(): void {
    const dialog = this.dialogElement;
    if (!dialog) return;

    if (this.open) {
      if (dialog.open && this.shownModal === this.modal) return;
      if (dialog.open) {
        if (typeof dialog.close === 'function') {
          this.suppressNativeClose = true;
          dialog.close();
        } else {
          dialog.open = false;
        }
      }

      try {
        if (this.modal && typeof dialog.showModal === 'function') dialog.showModal();
        else if (typeof dialog.show === 'function') dialog.show();
        else dialog.open = true;
      } catch {
        dialog.open = true;
      }
      this.shownModal = this.modal;
      return;
    }

    if (dialog.open) {
      if (typeof dialog.close === 'function') {
        this.suppressNativeClose = true;
        dialog.close();
      } else {
        dialog.open = false;
      }
    }
    this.shownModal = undefined;
    this.restoreFocus();
  }

  private restoreFocus(): void {
    const target = this.previousFocus;
    this.previousFocus = null;
    if (target?.isConnected) target.focus();
  }

  private handleCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  private handleNativeClose(): void {
    if (this.suppressNativeClose) {
      this.suppressNativeClose = false;
      return;
    }
    if (this.open) {
      this.open = false;
      this.dispatchCloseEvent();
    }
  }

  private dispatchCloseEvent(): void {
    this.dispatchEvent(new CustomEvent('nx-close', { bubbles: true, composed: true }));
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.dispatchCloseEvent();
  }

  render() {
    return html`
      <dialog
        aria-labelledby=${this.titleId}
        aria-modal=${this.modal && this.open ? 'true' : 'false'}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
      >
        <div class="header">
          <h2 id=${this.titleId}>${this.title || 'Dialog'}</h2>
          <nx-icon-button
            icon="close"
            aria-label="Close dialog"
            variant="ghost"
            size="sm"
            @click=${this.close}
          ></nx-icon-button>
        </div>
        <div class="content"><slot></slot></div>
      </dialog>
    `;
  }
}

export default NxDialog;
