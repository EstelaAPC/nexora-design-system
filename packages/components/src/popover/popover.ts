import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../icon-button/icon-button';

export type NxPopoverPlacement = 'top' | 'right' | 'bottom' | 'left';
export type NxPopoverTrigger = 'click' | 'manual';

let popoverInstance = 0;

@customElement('nx-popover')
export class NxPopover extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans);
    }

    .trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--nx-spacing-2);
      min-height: var(--nx-button-height-md);
      padding-inline: var(--nx-button-padding-inline-md);
      border: var(--nx-button-border-width) solid var(--nx-color-border);
      border-radius: var(--nx-button-radius);
      background: var(--nx-color-surface);
      color: var(--nx-color-text-primary);
      font: inherit;
      cursor: pointer;
    }

    .trigger:focus-visible {
      outline: var(--nx-button-focus-width) solid var(--nx-color-focus-ring);
      outline-offset: var(--nx-spacing-1);
    }

    .surface {
      position: fixed;
      inset: auto;
      z-index: 10;
      width: min(20rem, calc(100vw - 2rem));
      max-height: min(70vh, 32rem);
      margin: 0;
      padding: 0;
      overflow: auto;
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-radius: var(--nx-radius-md);
      background: var(--nx-color-surface);
      color: inherit;
      box-shadow: var(--nx-elevation-medium);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--nx-spacing-3);
      padding: var(--nx-spacing-3) var(--nx-spacing-4);
      border-block-end: var(--nx-border-width-thin) solid var(--nx-color-border);
    }

    h2 {
      margin: 0;
      font-size: var(--nx-font-size-md);
      font-weight: var(--nx-font-weight-semibold);
      line-height: 1.3;
    }

    .content {
      padding: var(--nx-spacing-4);
      line-height: 1.5;
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: String, reflect: true })
  trigger: NxPopoverTrigger = 'click';

  @property({ type: String, reflect: true })
  placement: NxPopoverPlacement = 'bottom';

  @property({ type: String })
  title = 'Popover';

  private readonly popoverId = `nx-popover-${++popoverInstance}`;
  private readonly titleId = `${this.popoverId}-title`;
  private useNativePopover = false;
  private surfaceOpen = false;
  private readonly handleDocumentPointer = (event: Event): void => {
    if (!event.composedPath().includes(this)) this.close(false);
  };
  private readonly handleDocumentKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !this.open) return;
    event.preventDefault();
    this.close();
  };

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('open') || changed.has('placement')) this.syncPopover();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeOpenListeners();
  }

  private get surface(): HTMLElement | null {
    return this.renderRoot.querySelector('.surface');
  }

  private syncPopover(): void {
    const surface = this.surface;
    const triggerButton = this.renderRoot.querySelector<HTMLElement>('.trigger');
    if (!surface || !triggerButton) return;

    if (this.open) {
      this.addOpenListeners();
      if (!this.surfaceOpen) {
        surface.hidden = false;
        const popoverSurface = surface as HTMLElement & { showPopover?: () => void };
        if (typeof popoverSurface.showPopover === 'function') {
          try {
            popoverSurface.showPopover();
            this.useNativePopover = true;
          } catch {
            this.useNativePopover = false;
          }
        }
        this.surfaceOpen = true;
      }
      this.positionSurface(surface, triggerButton);
      return;
    }

    this.removeOpenListeners();
    if (this.surfaceOpen) {
      const popoverSurface = surface as HTMLElement & { hidePopover?: () => void };
      if (this.useNativePopover && typeof popoverSurface.hidePopover === 'function') {
        try {
          popoverSurface.hidePopover();
        } catch {
          surface.hidden = true;
        }
      } else {
        surface.hidden = true;
      }
    } else {
      surface.hidden = true;
    }
    this.surfaceOpen = false;
    this.useNativePopover = false;
  }

  private positionSurface(surface: HTMLElement, triggerButton: HTMLElement): void {
    const triggerRect = triggerButton.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const gap = 8;
    const padding = 8;
    let left = triggerRect.left + (triggerRect.width - surfaceRect.width) / 2;
    let top = triggerRect.bottom + gap;

    if (this.placement === 'top') top = triggerRect.top - surfaceRect.height - gap;
    if (this.placement === 'left') {
      left = triggerRect.left - surfaceRect.width - gap;
      top = triggerRect.top + (triggerRect.height - surfaceRect.height) / 2;
    }
    if (this.placement === 'right') {
      left = triggerRect.right + gap;
      top = triggerRect.top + (triggerRect.height - surfaceRect.height) / 2;
    }

    left = Math.max(padding, Math.min(left, window.innerWidth - surfaceRect.width - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - surfaceRect.height - padding));
    surface.style.left = `${left}px`;
    surface.style.top = `${top}px`;
  }

  private addOpenListeners(): void {
    document.addEventListener('pointerdown', this.handleDocumentPointer, true);
    document.addEventListener('keydown', this.handleDocumentKey, true);
  }

  private removeOpenListeners(): void {
    document.removeEventListener('pointerdown', this.handleDocumentPointer, true);
    document.removeEventListener('keydown', this.handleDocumentKey, true);
  }

  private handleTriggerClick(): void {
    if (this.trigger === 'manual') return;
    this.open = !this.open;
  }

  private handleNativeToggle(event: Event): void {
    const newState = (event as Event & { newState?: string }).newState;
    if (newState === 'closed' && this.open) {
      this.open = false;
      this.dispatchCloseEvent();
    } else if (newState === 'open') {
      this.open = true;
    }
  }

  private dispatchCloseEvent(): void {
    this.dispatchEvent(new CustomEvent('nx-close', { bubbles: true, composed: true }));
  }

  close(restoreFocus = true): void {
    if (!this.open) return;
    this.open = false;
    this.dispatchCloseEvent();
    if (restoreFocus) {
      this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.trigger')?.focus());
    }
  }

  render() {
    return html`
      <button
        class="trigger"
        type="button"
        aria-controls=${this.popoverId}
        aria-expanded=${this.open ? 'true' : 'false'}
        @click=${this.handleTriggerClick}
      ><slot name="trigger">Open popover</slot></button>
      <section
        id=${this.popoverId}
        class="surface"
        popover="auto"
        role="dialog"
        aria-labelledby=${this.titleId}
        @toggle=${this.handleNativeToggle}
      >
        <header class="header">
          <h2 id=${this.titleId}>${this.title || 'Popover'}</h2>
          <nx-icon-button
            icon="close"
            aria-label="Close popover"
            variant="ghost"
            size="sm"
            @click=${() => this.close()}
          ></nx-icon-button>
        </header>
        <div class="content"><slot></slot></div>
      </section>
    `;
  }
}

export default NxPopover;
