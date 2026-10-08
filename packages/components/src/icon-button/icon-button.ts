import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IconName } from '@nexora/icons';
import '../icon/icon';

export type NxIconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type NxIconButtonSize = 'sm' | 'md' | 'lg';
export type NxIconButtonType = 'button' | 'submit' | 'reset';

@customElement('nx-icon-button')
export class NxIconButton extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      max-width: 100%;
      font-family: var(--nx-font-family-sans);
    }

    button {
      display: inline-flex;
      width: var(--nx-button-height-md);
      height: var(--nx-button-height-md);
      align-items: center;
      justify-content: center;
      padding: 0;
      border: var(--nx-button-border-width) solid transparent;
      border-radius: var(--nx-icon-button-radius, var(--nx-button-radius));
      background: var(--nx-color-primary);
      color: var(--nx-color-on-primary);
      box-shadow: var(--nx-button-shadow);
      cursor: pointer;
      transition:
        background-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        border-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        box-shadow var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    :host([size='sm']) button {
      width: var(--nx-button-height-sm);
      height: var(--nx-button-height-sm);
    }

    :host([size='lg']) button {
      width: var(--nx-button-height-lg);
      height: var(--nx-button-height-lg);
    }

    :host([variant='secondary']) button {
      border-color: var(--nx-color-border);
      background: var(--nx-color-secondary);
      color: var(--nx-color-on-secondary);
    }

    :host([variant='ghost']) button {
      background: transparent;
      color: var(--nx-color-on-ghost);
      box-shadow: none;
    }

    :host([variant='danger']) button {
      background: var(--nx-color-error);
      color: var(--nx-color-on-error);
    }

    button:hover:not(:disabled) {
      background: var(--nx-color-primary-hover);
    }

    :host([variant='secondary']) button:hover:not(:disabled) {
      background: var(--nx-color-secondary-hover);
    }

    :host([variant='ghost']) button:hover:not(:disabled) {
      background: var(--nx-color-ghost-hover);
    }

    :host([variant='danger']) button:hover:not(:disabled) {
      background: var(--nx-color-error-hover);
    }

    button:active:not(:disabled) {
      background: var(--nx-color-primary-active);
    }

    :host([variant='secondary']) button:active:not(:disabled) {
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
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition-duration: var(--nx-motion-duration-reduced);
      }
    }
  `;

  @property({ type: String, reflect: true })
  icon: IconName | '' = '';

  @property({ type: String, attribute: 'aria-label' })
  ariaLabel = '';

  @property({ type: String })
  type: NxIconButtonType = 'button';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true })
  size: NxIconButtonSize = 'md';

  @property({ type: String, reflect: true })
  variant: NxIconButtonVariant = 'primary';

  private hasWarnedMissingLabel = false;

  protected updated(): void {
    const isDevelopment = (import.meta as ImportMeta & { readonly env?: { readonly DEV?: boolean } }).env?.DEV === true;
    const accessibleName = this.ariaLabel?.trim() ?? '';
    if (isDevelopment && !accessibleName && !this.hasWarnedMissingLabel) {
      console.warn('<nx-icon-button> requires a meaningful aria-label for an accessible name.');
      this.hasWarnedMissingLabel = true;
    } else if (accessibleName) {
      this.hasWarnedMissingLabel = false;
    }
  }

  private handleFormAction(): void {
    if (this.disabled || this.type === 'button') return;
    const form = this.closest('form');
    if (this.type === 'submit') form?.requestSubmit();
    else form?.reset();
  }

  render() {
    return html`
      <button
        type=${this.type}
        ?disabled=${this.disabled}
        aria-label=${this.ariaLabel?.trim() || nothing}
        @click=${this.handleFormAction}
      >
        <nx-icon name=${this.icon} size=${this.size} aria-hidden="true"></nx-icon>
      </button>
    `;
  }
}

export default NxIconButton;
