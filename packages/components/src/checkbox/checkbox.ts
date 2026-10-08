import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface NxCheckboxChangeDetail {
  checked: boolean;
  indeterminate: boolean;
  value: string;
}

@customElement('nx-checkbox')
export class NxCheckbox extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      font-family: var(--nx-font-family-sans);
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--nx-spacing-2);
      color: var(--nx-color-text-primary);
      cursor: pointer;
    }

    input {
      display: grid;
      width: var(--nx-spacing-4);
      height: var(--nx-spacing-4);
      flex: none;
      place-content: center;
      margin: 0;
      appearance: none;
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-radius: var(--nx-radius-sm);
      background: var(--nx-color-surface);
      color: var(--nx-color-on-primary);
      cursor: pointer;
    }

    input:checked,
    input:indeterminate {
      border-color: var(--nx-color-primary);
      background: var(--nx-color-primary);
    }

    input:checked::before {
      width: var(--nx-spacing-2);
      height: var(--nx-spacing-1);
      border: var(--nx-border-width-thin) solid currentColor;
      border-top: 0;
      border-right: 0;
      content: '';
      transform: rotate(-45deg) translateY(calc(var(--nx-spacing-1) / -2));
    }

    input:indeterminate::before {
      width: var(--nx-spacing-2);
      height: var(--nx-border-width-thin);
      background: currentColor;
      content: '';
    }

    input:hover:not(:disabled) {
      border-color: var(--nx-color-primary);
    }

    input:focus-visible {
      outline: var(--nx-border-width-focus) solid var(--nx-color-focus-ring);
      outline-offset: var(--nx-spacing-1);
    }

    input:disabled {
      border-color: var(--nx-color-disabled-border);
      background: var(--nx-color-disabled-surface);
      color: var(--nx-color-disabled-text);
      cursor: not-allowed;
    }

    label:has(input:disabled) {
      color: var(--nx-color-disabled-text);
      cursor: not-allowed;
    }
  `;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: String }) name = '';
  @property({ type: String }) value = 'on';
  @property({ type: String }) label = '';

  protected updated(): void {
    const input = this.shadowRoot?.querySelector('input');
    if (input) input.indeterminate = this.indeterminate;
  }

  private handleChange(event: Event): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;

    this.checked = input.checked;
    this.indeterminate = input.indeterminate;
    this.dispatchEvent(
      new CustomEvent<NxCheckboxChangeDetail>('nx-change', {
        detail: {
          checked: this.checked,
          indeterminate: this.indeterminate,
          value: this.value
        },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <label>
        <input
          type="checkbox"
          name=${this.name}
          value=${this.value}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.handleChange}
        />
        <span>${this.label}</span>
      </label>
    `;
  }
}

export default NxCheckbox;
