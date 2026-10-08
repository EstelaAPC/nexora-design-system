import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { NxFormAssociatedElement } from '../form-associated';

export interface NxTextareaChangeDetail {
  value: string;
}

let nextTextareaId = 0;

@customElement('nx-textarea')
export class NxTextarea extends NxFormAssociatedElement {
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

    textarea {
      width: 100%;
      min-height: calc(var(--nx-spacing-8) + var(--nx-spacing-3));
      padding: var(--textarea-padding);
      border: var(--nx-border-width-thin) solid var(--textarea-border, var(--nx-color-border));
      border-radius: var(--nx-radius-md);
      background: var(--nx-color-surface);
      color: var(--nx-color-text-primary);
      font: inherit;
      font-size: var(--textarea-font-size);
      resize: vertical;
      transition:
        border-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        box-shadow var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    textarea:hover:not(:disabled, :read-only) {
      border-color: var(--nx-color-primary);
    }

    textarea:focus-visible {
      outline: var(--nx-border-width-focus) solid var(--nx-color-focus-ring);
      outline-offset: var(--nx-spacing-1);
    }

    textarea:disabled {
      border-color: var(--nx-color-disabled-border);
      background: var(--nx-color-disabled-surface);
      color: var(--nx-color-disabled-text);
      cursor: not-allowed;
    }

    textarea:read-only {
      background: var(--nx-color-surface-subtle);
    }

    textarea[aria-invalid='true'] {
      --textarea-border: var(--nx-color-error);
    }

    textarea[aria-invalid='true']:focus-visible {
      outline-color: var(--nx-color-error);
    }

    .message {
      color: var(--nx-color-text-secondary);
      font-size: var(--nx-font-size-sm);
    }

    .error {
      color: var(--nx-color-error);
    }

    :host([size='sm']) textarea {
      --textarea-font-size: var(--nx-font-size-sm);
      --textarea-padding: var(--nx-spacing-2) var(--nx-spacing-3);
    }

    :host(:not([size])) textarea,
    :host([size='md']) textarea {
      --textarea-font-size: var(--nx-font-size-md);
      --textarea-padding: var(--nx-spacing-3) var(--nx-spacing-4);
    }

    :host([size='lg']) textarea {
      --textarea-font-size: var(--nx-font-size-lg);
      --textarea-padding: var(--nx-spacing-4) var(--nx-spacing-5);
    }
  `;

  private readonly controlId = `nx-textarea-${++nextTextareaId}`;
  private defaultValue = '';

  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) name = '';
  @property({ type: Number }) rows = 4;
  @property({ type: Number }) cols?: number;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true, attribute: 'readonly' }) readOnly = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Number, attribute: 'maxlength' }) maxlength?: number;
  @property({ type: Number, attribute: 'minlength' }) minlength?: number;
  @property({ type: String }) error = '';
  @property({ type: String, attribute: 'helper-text' }) helperText = '';
  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  protected firstUpdated(): void {
    this.defaultValue = this.value;
    this.syncFormControl();
  }

  protected updated(): void {
    this.syncFormControl();
  }

  protected syncFormControl(): void {
    const control = this.shadowRoot?.querySelector('textarea');
    if (!control) {
      this.internals.setFormValue(this.isEffectivelyDisabled || !this.name ? null : this.value);
      return;
    }
    control.disabled = this.isEffectivelyDisabled;
    this.internals.setFormValue(this.isEffectivelyDisabled || !this.name ? null : this.value);
    this.syncValidity(control, `${this.label || 'This field'} is required.`, this.error);
    if (this.internals.validity.valid) control.removeAttribute('aria-invalid');
    else control.setAttribute('aria-invalid', 'true');
  }

  protected resetFormControl(): void {
    this.value = this.defaultValue;
    const control = this.shadowRoot?.querySelector('textarea');
    if (control) control.value = this.defaultValue;
    this.syncFormControl();
    this.requestUpdate();
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
    if (!(control instanceof HTMLTextAreaElement)) return;

    this.value = control.value;
    this.syncFormControl();
    this.dispatchEvent(
      new CustomEvent<NxTextareaChangeDetail>('nx-change', {
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
        <textarea
          id=${this.controlId}
          name=${this.name}
          .value=${this.value}
          placeholder=${this.placeholder}
          rows=${this.rows}
          cols=${this.cols ?? nothing}
          maxlength=${this.maxlength ?? nothing}
          minlength=${this.minlength ?? nothing}
          ?disabled=${this.disabled}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          aria-describedby=${this.describedBy}
          @input=${this.handleInput}
        ></textarea>
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

export default NxTextarea;
