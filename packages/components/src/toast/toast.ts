import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../button/button';
import '../icon/icon';

export type NxToastSeverity = 'info' | 'success' | 'warning' | 'error';

@customElement('nx-toast')
export class NxToast extends LitElement {
  static styles = css`
    :host {
      --toast-accent: var(--nx-color-info);
      display: block;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans);
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--nx-spacing-3);
      padding: var(--nx-spacing-4);
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-inline-start: var(--nx-border-width-focus) solid var(--toast-accent);
      border-radius: var(--nx-radius-md);
      background: var(--nx-color-surface);
      box-shadow: var(--nx-elevation-medium);
    }

    :host([severity='info']) {
      --toast-accent: var(--nx-color-info);
    }

    :host([severity='success']) {
      --toast-accent: var(--nx-color-success);
    }

    :host([severity='warning']) {
      --toast-accent: var(--nx-color-warning);
    }

    :host([severity='error']) {
      --toast-accent: var(--nx-color-error);
    }

    nx-icon {
      margin-block-start: var(--nx-spacing-1);
      color: var(--toast-accent);
    }

    .message {
      min-width: 0;
      flex: 1;
      font-size: var(--nx-font-size-sm);
      line-height: 1.5;
    }

    nx-button {
      flex: none;
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: String, reflect: true })
  severity: NxToastSeverity = 'info';

  @property({ type: Number })
  duration = 5000;

  @property({ type: Boolean, reflect: true })
  dismissible = true;

  private timeoutId?: ReturnType<typeof setTimeout>;
  private remainingDuration = 0;
  private deadline = 0;
  private pointerPaused = false;
  private focusPaused = false;

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('open') || changed.has('duration')) {
      this.clearTimer();
      this.remainingDuration = this.normalizedDuration;
      if (this.open) {
        this.resumeTimer();
      } else {
        this.pointerPaused = false;
        this.focusPaused = false;
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearTimer();
  }

  private get normalizedDuration(): number {
    return Number.isFinite(this.duration) && this.duration > 0 ? this.duration : 0;
  }

  private get paused(): boolean {
    return this.pointerPaused || this.focusPaused;
  }

  private clearTimer(): void {
    if (this.timeoutId !== undefined) clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }

  private pauseTimer(): void {
    if (this.timeoutId === undefined) return;
    this.remainingDuration = Math.max(0, this.deadline - Date.now());
    this.clearTimer();
  }

  private resumeTimer(): void {
    if (!this.open || this.paused || this.remainingDuration <= 0) return;
    this.deadline = Date.now() + this.remainingDuration;
    this.timeoutId = setTimeout(() => {
      this.timeoutId = undefined;
      this.open = false;
    }, this.remainingDuration);
  }

  private handlePointerEnter(): void {
    this.pointerPaused = true;
    this.pauseTimer();
  }

  private handlePointerLeave(): void {
    this.pointerPaused = false;
    this.resumeTimer();
  }

  private handleFocusIn(): void {
    this.focusPaused = true;
    this.pauseTimer();
  }

  private handleFocusOut(event: Event): void {
    const relatedTarget = (event as Event & { relatedTarget: Node | null }).relatedTarget;
    if (relatedTarget && this.shadowRoot?.contains(relatedTarget)) return;
    this.focusPaused = false;
    this.resumeTimer();
  }

  private handleDismiss(): void {
    this.dispatchEvent(new CustomEvent('nx-dismiss', { bubbles: true, composed: true }));
    this.open = false;
  }

  private get iconName(): 'info' | 'check' | 'warning' {
    if (this.severity === 'success') return 'check';
    if (this.severity === 'warning' || this.severity === 'error') return 'warning';
    return 'info';
  }

  render() {
    if (!this.open) return nothing;
    const urgent = this.severity === 'warning' || this.severity === 'error';

    return html`
      <div
        class="toast"
        role=${urgent ? 'alert' : 'status'}
        aria-live=${urgent ? 'assertive' : 'polite'}
        @pointerenter=${this.handlePointerEnter}
        @pointerleave=${this.handlePointerLeave}
        @focusin=${this.handleFocusIn}
        @focusout=${this.handleFocusOut}
      >
        <nx-icon name=${this.iconName} aria-hidden="true"></nx-icon>
        <div class="message"><slot></slot></div>
        ${this.dismissible
          ? html`
              <nx-button
                size="sm"
                variant="ghost"
                @click=${this.handleDismiss}
              >
                Dismiss notification
                <nx-icon name="close" aria-hidden="true"></nx-icon>
              </nx-button>
            `
          : nothing}
      </div>
    `;
  }
}

export default NxToast;
