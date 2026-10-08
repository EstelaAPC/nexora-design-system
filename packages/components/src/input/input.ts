import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { NxFormAssociatedElement } from '../form-associated';

export interface NxInputChangeDetail {
  value: string;
}

let nextInputId = 0;

@customElement('nx-input')
export class NxInput extends NxFormAssociatedElement {
  static formAssociated = true;

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
      color: var(--nx-color-text-primary);
      font-size: var(--nx-font-size-sm);
      font-weight: var(--nx-font-weight-semibold);
    }

    input {
      width: 100%;
      min-height: calc(var(--nx-spacing-8) + var(--nx-spacing-3));
      padding: var(--nx-spacing-3) var(--nx-spacing-4);
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-radius: var(--nx-radius-md);
      background: var(--nx-color-surface);
      color: var(--nx-color-text-primary);
      font: inherit;
      transition:
        border-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        box-shadow var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    input:hover:not(:disabled, :read-only) {
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

    input[aria-invalid='true'] {
      border-color: var(--nx-color-error);
    }

    .message {
      color: var(--nx-color-text-secondary);
      font-size: var(--nx-font-size-sm);
    }

    .error {
      color: var(--nx-color-error);
    }
  `;

  private readonly controlId = `nx-input-${++nextInputId}`;
  private defaultValue = '';

  @property({ type: String }) label = 'Label';
  @property({ type: String }) value = '';
  @property({ type: String }) type = 'text';
  @property({ type: String }) placeholder = '';
  @property({ type: String, reflect: true }) name = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true, attribute: 'readonly' }) readOnly = false;
  @property({ type: Number, attribute: 'minlength' }) minlength?: number;
  @property({ type: Number, attribute: 'maxlength' }) maxlength?: number;
  @property({ type: String }) error = '';
  @property({ type: String, attribute: 'helper-text' }) helperText = '';

  protected firstUpdated(): void {
    this.defaultValue = this.value;
    this.syncFormControl();
  }

  protected updated(): void {
    this.syncFormControl();
  }

  protected syncFormControl(): void {
    const control = this.shadowRoot?.querySelector('input');
    if (!control) {
      this.internals.setFormValue(this.isEffectivelyDisabled || !this.name ? null : this.value);
      return;
    }
    control.disabled = this.isEffectivelyDisabled;
    this.internals.setFormValue(this.isEffectivelyDisabled || !this.name ? null : this.value);
    this.syncValidity(control, `${this.label || 'This field'} is required.`, this.error);
    this.setInvalidState(control);
  }

  protected resetFormControl(): void {
    this.value = this.defaultValue;
    const control = this.shadowRoot?.querySelector('input');
    if (control) control.value = this.defaultValue;
    this.syncFormControl();
    this.requestUpdate();
  }

  private setInvalidState(control: HTMLInputElement): void {
    if (this.internals.validity.valid) control.removeAttribute('aria-invalid');
    else control.setAttribute('aria-invalid', 'true');
  }

  private get describedBy(): string | typeof nothing {
    const ids = [
      this.helperText ? `${this.controlId}-helper` : '',
      this.error ? `${this.controlId}-error` : ''
    ].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : nothing;
  }

  private handleInput(event: Event): void {
    const control = event.currentTarget;
    if (!(control instanceof HTMLInputElement)) return;
    this.value = control.value;
    this.syncFormControl();
    this.dispatchEvent(
      new CustomEvent<NxInputChangeDetail>('nx-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <div class="field">
        <label for=${this.controlId}><slot name="label">${this.label}</slot></label>
        <input
          id=${this.controlId}
          type=${this.type}
          name=${this.name}
          .value=${this.value}
          placeholder=${this.placeholder}
          minlength=${this.minlength ?? nothing}
          maxlength=${this.maxlength ?? nothing}
          ?required=${this.required}
          ?readonly=${this.readOnly}
          ?disabled=${this.isEffectivelyDisabled}
          aria-describedby=${this.describedBy}
          @input=${this.handleInput}
        />
        ${this.helperText
          ? html`<span class="message" id=${`${this.controlId}-helper`}>${this.helperText}</span>`
          : nothing}
        ${this.error
          ? html`<span class="message error" id=${`${this.controlId}-error`} role="alert">${this.error}</span>`
          : nothing}
      </div>
    `;
  }
}

export default NxInput;
