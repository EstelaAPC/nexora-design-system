import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type NxButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type NxButtonSize = 'sm' | 'md' | 'lg';
export type NxButtonType = 'button' | 'submit' | 'reset';

@customElement('nx-button')
export class NxButton extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      max-width: 100%;
      font-family: var(--nx-font-family-sans);
    }

    :host([full-width]) {
      display: flex;
      width: 100%;
    }

    button {
      position: relative;
      display: inline-flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      gap: var(--nx-button-content-gap);
      min-height: var(--nx-button-height-md);
      padding-inline: var(--nx-button-padding-inline-md);
      border: var(--nx-button-border-width) solid transparent;
      border-radius: var(--nx-button-radius);
      background: var(--nx-color-primary);
      color: var(--nx-color-on-primary);
      box-shadow: var(--nx-button-shadow);
      font-family: inherit;
      font-size: var(--nx-button-font-size-md);
      font-weight: var(--nx-button-font-weight);
      line-height: var(--nx-line-height-control);
      cursor: pointer;
      transition:
        background-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        border-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        box-shadow var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    :host([size='sm']) button {
      min-height: var(--nx-button-height-sm);
      padding-inline: var(--nx-button-padding-inline-sm);
      font-size: var(--nx-button-font-size-sm);
    }

    :host([size='lg']) button {
      min-height: var(--nx-button-height-lg);
      padding-inline: var(--nx-button-padding-inline-lg);
      font-size: var(--nx-button-font-size-lg);
    }

    :host([variant='secondary']) {
      button {
        background: var(--nx-color-secondary);
        color: var(--nx-color-on-secondary);
        border-color: var(--nx-color-border);
      }
    }

    :host([variant='outline']) {
      button {
        background: transparent;
        color: var(--nx-color-outline);
        border-color: var(--nx-color-outline);
      }
    }

    :host([variant='ghost']) {
      button {
        background: transparent;
        color: var(--nx-color-on-ghost);
        box-shadow: none;
      }
    }

    :host([variant='danger']) {
      button {
        background: var(--nx-color-error);
        color: var(--nx-color-on-error);
      }
    }

    button:hover:not(:disabled) {
      background: var(--nx-color-primary-hover);
    }

    :host([variant='secondary']) button:hover:not(:disabled) {
      background: var(--nx-color-secondary-hover);
    }

    :host([variant='outline']) button:hover:not(:disabled),
    :host([variant='ghost']) button:hover:not(:disabled) {
      background: var(--nx-color-ghost-hover);
    }

    :host([variant='danger']) button:hover:not(:disabled) {
      background: var(--nx-color-error-hover);
    }

    button:active:not(:disabled) {
      background: var(--nx-color-primary-active);
    }

    :host([variant='secondary']) button:active:not(:disabled),
    :host([variant='outline']) button:active:not(:disabled) {
      background: var(--nx-color-secondary-hover);
    }

    :host([variant='ghost']) button:active:not(:disabled) {
      background: var(--nx-color-ghost-hover);
    }

    :host([variant='danger']) button:active:not(:disabled) {
      background: var(--nx-color-error-hover);
    }

    button:focus {
      outline: none;
    }

    button:focus-visible {
      outline: var(--nx-button-focus-width) solid var(--nx-color-focus-ring);
      outline-offset: var(--nx-spacing-1);
    }

    button:disabled {
      border-color: var(--nx-color-disabled-border);
      background: var(--nx-color-disabled-surface);
      color: var(--nx-color-disabled-text);
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
    }

    .content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: inherit;
    }

    .spinner {
      width: var(--nx-spacing-4);
      height: var(--nx-spacing-4);
      flex: none;
      border: var(--nx-border-width-thin) solid currentColor;
      border-inline-end-color: transparent;
      border-radius: var(--nx-radius-pill);
      animation:
        nx-button-spin var(--nx-motion-duration-spinner) var(--nx-motion-easing-linear)
        infinite;
    }

    @keyframes nx-button-spin {
      to {
        transform: rotate(1turn);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      button,
      .spinner {
        animation-duration: var(--nx-motion-duration-reduced);
        transition-duration: var(--nx-motion-duration-reduced);
      }
    }
  `;

  @property({ type: String, reflect: true })
  variant: NxButtonVariant = 'primary';

  @property({ type: String, reflect: true })
  size: NxButtonSize = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  loading = false;

  @property({ type: Boolean, reflect: true, attribute: 'full-width' })
  fullWidth = false;

  @property({ type: String })
  type: NxButtonType = 'button';

  private get isUnavailable(): boolean {
    return this.disabled || this.loading;
  }

  private renderContent() {
    return html`
      ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
      <span class="content"><slot></slot></span>
    `;
  }

  render() {
    return html`
      <button
        type=${this.type}
        ?disabled=${this.isUnavailable}
        aria-busy=${this.loading ? 'true' : nothing}
      >
        ${this.renderContent()}
      </button>
    `;
  }
}

export default NxButton;
