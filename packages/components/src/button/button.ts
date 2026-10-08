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
      gap: var(--nx-spacing-2);
      border: var(--nx-border-width-thin) solid transparent;
      border-radius: var(--nx-radius-md);
      background: var(--button-background);
      color: var(--button-foreground);
      box-shadow: var(--nx-elevation-button);
      font-family: inherit;
      font-size: var(--button-font-size);
      font-weight: var(--nx-font-weight-semibold);
      line-height: var(--nx-line-height-control);
      cursor: pointer;
      transition:
        background-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        border-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        box-shadow var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    :host([size='sm']) button {
      min-height: var(--nx-control-height-sm);
      padding-inline: var(--nx-spacing-3);
      --button-font-size: var(--nx-font-size-sm);
    }

    :host(:not([size])) button,
    :host([size='md']) button {
      min-height: var(--nx-control-height-md);
      padding-inline: var(--nx-spacing-4);
      --button-font-size: var(--nx-font-size-md);
    }

    :host([size='lg']) button {
      min-height: var(--nx-control-height-lg);
      padding-inline: var(--nx-spacing-6);
      --button-font-size: var(--nx-font-size-lg);
    }

    :host(:not([variant])),
    :host([variant='primary']) {
      --button-background: var(--nx-color-primary);
      --button-foreground: var(--nx-color-on-primary);
      --button-hover: var(--nx-color-primary-hover);
      --button-active: var(--nx-color-primary-active);
    }

    :host([variant='secondary']) {
      --button-background: var(--nx-color-secondary);
      --button-foreground: var(--nx-color-on-secondary);
      --button-hover: var(--nx-color-secondary-hover);
      --button-active: var(--nx-color-secondary-hover);
      --button-border: var(--nx-color-border);
    }

    :host([variant='outline']) {
      --button-background: transparent;
      --button-foreground: var(--nx-color-outline);
      --button-hover: var(--nx-color-outline-hover);
      --button-active: var(--nx-color-outline-hover);
      --button-border: var(--nx-color-outline);
    }

    :host([variant='ghost']) {
      --button-background: var(--nx-color-ghost);
      --button-foreground: var(--nx-color-on-ghost);
      --button-hover: var(--nx-color-ghost-hover);
      --button-active: var(--nx-color-ghost-hover);
      --button-border: transparent;
      --button-shadow: none;
    }

    :host([variant='danger']) {
      --button-background: var(--nx-color-danger);
      --button-foreground: var(--nx-color-on-danger);
      --button-hover: var(--nx-color-danger-hover);
      --button-active: var(--nx-color-danger-hover);
    }

    button {
      border-color: var(--button-border, transparent);
      box-shadow: var(--button-shadow, var(--nx-elevation-button));
    }

    button:hover:not(:disabled) {
      background: var(--button-hover);
    }

    button:active:not(:disabled) {
      background: var(--button-active);
    }

    button:focus {
      outline: none;
    }

    button:focus-visible {
      outline: var(--nx-border-width-focus) solid var(--nx-color-focus-ring);
      outline-offset: var(--nx-spacing-1);
      box-shadow: var(--nx-elevation-focus-ring);
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
        nx-button-spin var(--nx-motion-duration-spinner) var(--nx-motion-easing-spinner)
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
