import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface NxSwitchChangeDetail {
  checked: boolean;
  value: string;
}

@customElement('nx-switch')
export class NxSwitch extends LitElement {
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
      position: relative;
      width: var(--nx-switch-track-width);
      height: var(--nx-switch-track-height);
      flex: none;
      margin: 0;
      appearance: none;
      border: var(--nx-border-width-thin) solid var(--nx-color-control-track);
      border-radius: var(--nx-radius-pill);
      background: var(--nx-color-control-track);
      cursor: pointer;
      transition:
        background-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        border-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    input::before {
      position: absolute;
      top: 50%;
      left: var(--nx-switch-thumb-inset);
      width: var(--nx-switch-thumb-size);
      height: var(--nx-switch-thumb-size);
      border-radius: var(--nx-radius-pill);
      background: var(--nx-color-surface);
      box-shadow: var(--nx-elevation-low);
      content: '';
      transform: translateY(-50%);
      transition: transform var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    input:checked {
      border-color: var(--nx-color-primary);
      background: var(--nx-color-primary);
    }

    input:checked::before {
      transform: translate(calc(var(--nx-switch-track-width) - var(--nx-switch-thumb-size) - var(--nx-switch-thumb-inset) * 2), -50%);
    }

    input:hover:not(:disabled) {
      border-color: var(--nx-color-primary-hover);
    }

    input:focus-visible {
      outline: var(--nx-border-width-focus) solid var(--nx-color-focus-ring);
      outline-offset: var(--nx-spacing-1);
    }

    input:disabled {
      border-color: var(--nx-color-disabled-border);
      background: var(--nx-color-disabled-surface);
      cursor: not-allowed;
    }

    input:disabled::before {
      background: var(--nx-color-disabled-text);
    }

    label:has(input:disabled) {
      color: var(--nx-color-disabled-text);
      cursor: not-allowed;
    }
  `;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: String }) label = '';
  @property({ type: String }) name = '';
  @property({ type: String }) value = 'on';

  private handleChange(event: Event): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;

    this.checked = input.checked;
    this.dispatchEvent(
      new CustomEvent<NxSwitchChangeDetail>('nx-change', {
        detail: { checked: this.checked, value: this.value },
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
          role="switch"
          name=${this.name}
          value=${this.value}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-checked=${String(this.checked)}
          @change=${this.handleChange}
        />
        <span>${this.label}</span>
      </label>
    `;
  }
}

export default NxSwitch;
