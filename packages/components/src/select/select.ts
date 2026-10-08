import { css, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { NxFormAssociatedElement } from '../form-associated';

export interface NxSelectChangeDetail {
  value: string;
}

let nextSelectId = 0;

@customElement('nx-select')
export class NxSelect extends NxFormAssociatedElement {
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

    select {
      width: 100%;
      min-height: var(--nx-select-height);
      padding-block: var(--nx-spacing-3);
      padding-inline: var(--nx-select-padding-inline);
      border: var(--nx-border-width-thin) solid var(--select-border, var(--nx-color-border));
      border-radius: var(--nx-select-radius);
      background: var(--nx-color-surface);
      color: var(--nx-color-text-primary);
      font: inherit;
      cursor: pointer;
      transition:
        border-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard),
        box-shadow var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    select:hover:not(:disabled) {
      border-color: var(--nx-color-primary);
    }

    select:focus-visible {
      outline: var(--nx-border-width-focus) solid var(--nx-color-focus-ring);
      outline-offset: var(--nx-spacing-1);
    }

    select:disabled {
      border-color: var(--nx-color-disabled-border);
      background: var(--nx-color-disabled-surface);
      color: var(--nx-color-disabled-text);
      cursor: not-allowed;
    }

    select[aria-invalid='true'] {
      --select-border: var(--nx-color-error);
    }

    .message {
      color: var(--nx-color-text-secondary);
      font-size: var(--nx-font-size-sm);
    }

    .error {
      color: var(--nx-color-error);
    }

    slot {
      display: none;
    }
  `;

  private readonly controlId = `nx-select-${++nextSelectId}`;
  private defaultValue = '';
  private initialized = false;
  private optionObserver?: MutationObserver;

  @property({ type: String }) label = '';
  @property({ type: String, reflect: true }) name = '';
  @property({ type: String, reflect: true }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: String, attribute: 'help-text' }) helpText = '';
  @property({ type: String }) error = '';
  @property({ type: String }) autocomplete = '';
  @property({ type: String, attribute: 'aria-label' }) ariaLabel = '';
  @property({ type: String, attribute: 'aria-invalid' }) ariaInvalid = '';
  @property({ type: String, attribute: 'aria-describedby' }) ariaDescribedBy = '';
  @property({ type: String, attribute: 'aria-labelledby' }) ariaLabelledBy = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.observeOptions();
    this.readOptions();
  }

  disconnectedCallback(): void {
    this.optionObserver?.disconnect();
    super.disconnectedCallback();
  }

  protected willUpdate(): void {
    if (!this.initialized) {
      if (!this.value) this.value = this.selectedOptionValue ?? '';
      this.defaultValue = this.value;
      this.initialized = true;
    }
  }

  protected updated(): void {
    this.syncFormControl();
  }

  protected syncFormControl(): void {
    const control = this.shadowRoot?.querySelector('select');
    if (!control) {
      this.internals.setFormValue(this.isEffectivelyDisabled || !this.name ? null : this.value);
      return;
    }
    control.disabled = this.isEffectivelyDisabled;
    control.required = this.required;
    control.value = this.value;
    this.internals.setFormValue(this.isEffectivelyDisabled || !this.name ? null : this.value);
    this.syncValidity(control, `${this.label || 'A selection'} is required.`, this.error);
    const invalid = this.internals.validity.valid ? this.ariaInvalid : 'true';
    if (invalid) control.setAttribute('aria-invalid', invalid);
    else control.removeAttribute('aria-invalid');
  }

  protected resetFormControl(): void {
    this.value = this.defaultValue;
    const control = this.shadowRoot?.querySelector('select');
    if (control) control.value = this.defaultValue;
    this.syncFormControl();
    this.requestUpdate();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state === 'string') {
      this.value = state;
      this.syncFormControl();
      this.requestUpdate();
    }
  }

  private get selectedOptionValue(): string | undefined {
    return Array.from(this.querySelectorAll<HTMLOptionElement>(':scope > option, :scope > optgroup > option'))
      .find((option) => option.hasAttribute('selected'))?.value;
  }

  private observeOptions(): void {
    if (typeof MutationObserver === 'undefined') return;
    this.optionObserver = new MutationObserver(() => this.readOptions());
    this.optionObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['value', 'label', 'disabled', 'selected']
    });
  }

  private readOptions(): void {
    this.requestUpdate();
  }

  private get describedBy(): string | typeof nothing {
    const ids = [
      this.ariaDescribedBy,
      this.helpText ? `${this.controlId}-help` : '',
      this.error ? `${this.controlId}-error` : ''
    ].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : nothing;
  }

  private renderOption(option: HTMLOptionElement, groupDisabled = false): TemplateResult {
    const label = option.label || option.textContent?.trim() || option.value;
    return html`
      <option
        value=${option.value}
        ?disabled=${option.disabled || groupDisabled}
        ?selected=${option.value === this.value}
      >
        ${label}
      </option>
    `;
  }

  private renderOptionTemplates(): TemplateResult[] {
    return Array.from(this.children).flatMap((child) => {
      if (child instanceof HTMLOptionElement) return [this.renderOption(child)];
      if (child instanceof HTMLOptGroupElement) {
        const options = Array.from(child.children)
          .filter((option): option is HTMLOptionElement => option instanceof HTMLOptionElement)
          .map((option) => this.renderOption(option, child.disabled));
        return [html`<optgroup label=${child.label} ?disabled=${child.disabled}>${options}</optgroup>`];
      }
      return [];
    });
  }

  private handleChange(event: Event): void {
    const control = event.currentTarget;
    if (!(control instanceof HTMLSelectElement)) return;
    this.value = control.value;
    this.syncFormControl();
    this.dispatchEvent(
      new CustomEvent<NxSelectChangeDetail>('nx-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    const accessibleLabel = this.ariaLabel || nothing;
    const labelId = `${this.controlId}-label`;
    return html`
      <div class="field">
        ${this.label
          ? html`<label id=${labelId} for=${this.controlId}><slot name="label">${this.label}</slot></label>`
          : nothing}
        <select
          id=${this.controlId}
          autocomplete=${this.autocomplete || nothing}
          .value=${this.value}
          ?disabled=${this.isEffectivelyDisabled}
          ?required=${this.required}
          aria-label=${accessibleLabel}
          aria-labelledby=${this.ariaLabelledBy || (this.label ? labelId : nothing)}
          aria-describedby=${this.describedBy}
          @change=${this.handleChange}
        >
          ${this.placeholder
            ? html`<option value="" disabled>${this.placeholder}</option>`
            : nothing}
          ${this.renderOptionTemplates()}
        </select>
        ${this.helpText
          ? html`<span class="message" id=${`${this.controlId}-help`}>${this.helpText}</span>`
          : nothing}
        ${this.error
          ? html`<span class="message error" id=${`${this.controlId}-error`} role="alert">${this.error}</span>`
          : nothing}
        <slot @slotchange=${this.readOptions}></slot>
      </div>
    `;
  }
}

export default NxSelect;
