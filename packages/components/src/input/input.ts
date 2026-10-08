import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nx-input')
export class NxInput extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--nx-font-sans, sans-serif);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    label {
      font-size: 0.875rem;
      color: var(--nx-text-soft, var(--nx-color-neutral-600));
      font-weight: 600;
    }

    input {
      width: 100%;
      min-height: 2.75rem;
      border: 1px solid var(--nx-border, var(--nx-color-neutral-200));
      border-radius: var(--nx-radius-md, 12px);
      background: var(--nx-surface, var(--nx-color-neutral-0));
      color: var(--nx-text, var(--nx-color-neutral-900));
      padding: 0.75rem 0.875rem;
      transition: border-color var(--nx-transition-fast, 150ms ease), box-shadow var(--nx-transition-fast, 150ms ease);
    }

    input:focus {
      outline: none;
      border-color: var(--nx-color-brand-500, #6366f1);
      box-shadow: 0 0 0 4px var(--nx-focus-ring, rgba(99, 102, 241, 0.35));
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
