import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nx-input')
export class NxInput extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--nx-font-family-sans);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--nx-spacing-2);
    }

    label {
      font-size: var(--nx-font-size-sm);
      color: var(--nx-color-text-secondary);
      font-weight: var(--nx-font-weight-semibold);
    }

    input {
      width: 100%;
      min-height: calc(var(--nx-spacing-8) + var(--nx-spacing-3));
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-radius: var(--nx-radius-md);
      background: var(--nx-color-surface);
      color: var(--nx-color-text-primary);
      padding: var(--nx-spacing-3) var(--nx-spacing-4);
      transition:
        border-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        box-shadow var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    input:focus {
      outline: none;
      border-color: var(--nx-color-focus-ring);
      outline: var(--nx-border-width-focus) solid var(--nx-color-focus-ring);
      outline-offset: var(--nx-spacing-1);
    }
  `;

  @property({ type: String }) label = 'Label';
  @property({ type: String }) value = '';
  @property({ type: String }) type = 'text';
  @property({ type: String }) placeholder = '';

  render() {
    return html`
      <div class="field">
        <label>${this.label}</label>
        <input
          type="${this.type}"
          .value="${this.value}"
          placeholder="${this.placeholder}"
          aria-label="${this.label}"
        />
      </div>
    `;
  }
}

export default NxInput;
