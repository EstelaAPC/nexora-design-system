import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../button/button';
import '../icon/icon';

export type NxAlertSeverity = 'info' | 'success' | 'warning' | 'error';

@customElement('nx-alert')
export class NxAlert extends LitElement {
  static styles = css`
    :host {
      --alert-accent: var(--nx-color-info);
      display: block;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans);
    }

    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--nx-spacing-3);
      padding: var(--nx-spacing-4);
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-inline-start: var(--nx-border-width-focus) solid var(--alert-accent);
      border-radius: var(--nx-radius-md);
      background: var(--nx-color-surface);
    }

    :host([severity='info']) {
      --alert-accent: var(--nx-color-info);
    }

    :host([severity='success']) {
      --alert-accent: var(--nx-color-success);
    }

    :host([severity='warning']) {
      --alert-accent: var(--nx-color-warning);
    }

    :host([severity='error']) {
      --alert-accent: var(--nx-color-error);
    }

    nx-icon {
      margin-block-start: var(--nx-spacing-1);
      color: var(--alert-accent);
    }

    .content {
      min-width: 0;
      flex: 1;
    }

    h2 {
      margin: 0 0 var(--nx-spacing-1);
      font-size: var(--nx-font-size-md);
      line-height: 1.25;
    }

    .message {
      font-size: var(--nx-font-size-sm);
      line-height: 1.5;
    }

    .message:empty {
      display: none;
    }

    h2 {
      font-weight: var(--nx-font-weight-semibold);
      color: var(--nx-color-text-primary);
    }

    nx-button {
      flex: none;
    }
  `;

  @property({ type: String, reflect: true })
  severity: NxAlertSeverity = 'info';

  @property({ type: String })
  heading = '';

  @property({ type: Boolean, reflect: true })
  dismissible = false;

  private get iconName(): 'info' | 'check' | 'warning' {
    if (this.severity === 'success') return 'check';
    if (this.severity === 'warning' || this.severity === 'error') return 'warning';
    return 'info';
  }

  private handleDismiss(): void {
    this.dispatchEvent(new CustomEvent('nx-dismiss', { bubbles: true, composed: true }));
    this.remove();
  }

  render() {
    const urgent = this.severity === 'warning' || this.severity === 'error';

    return html`
      <section
        class="alert"
        role=${urgent ? 'alert' : 'status'}
        aria-labelledby=${this.heading ? 'alert-heading' : nothing}
      >
        <nx-icon name=${this.iconName} aria-hidden="true"></nx-icon>
        <div class="content">
          ${this.heading ? html`<h2 id="alert-heading">${this.heading}</h2>` : nothing}
          <div class="message"><slot></slot></div>
        </div>
        ${this.dismissible
          ? html`
              <nx-button
                class="dismiss"
                size="sm"
                variant="ghost"
                @click=${this.handleDismiss}
              >
                Dismiss alert
                <nx-icon name="close" aria-hidden="true"></nx-icon>
              </nx-button>
            `
          : nothing}
      </section>
    `;
  }
}

export default NxAlert;
