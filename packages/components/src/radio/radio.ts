import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { NxFormAssociatedElement } from '../form-associated';

export interface NxRadioChangeDetail {
  checked: true;
  name: string;
  value: string;
}

@customElement('nx-radio')
export class NxRadio extends NxFormAssociatedElement {
  static formAssociated = true;

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
      border-radius: var(--nx-radius-pill);
      background: var(--nx-color-surface);
      cursor: pointer;
    }

    input:checked {
      border-color: var(--nx-color-primary);
    }

    input:checked::before {
      width: var(--nx-spacing-2);
      height: var(--nx-spacing-2);
      border-radius: var(--nx-radius-pill);
      background: var(--nx-color-primary);
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
      cursor: not-allowed;
    }

    input[aria-invalid='true'] {
      border-color: var(--nx-color-error);
    }

    label:has(input:disabled) {
      color: var(--nx-color-disabled-text);
      cursor: not-allowed;
    }
  `;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: String, reflect: true }) name = '';
  @property({ type: String }) value = 'on';
  @property({ type: String }) label = '';
  private defaultChecked = false;

  protected firstUpdated(): void {
    this.defaultChecked = this.checked;
    this.syncFormControl();
  }

  protected updated(): void {
    this.syncFormControl();
  }

  protected syncFormControl(): void {
    const input = this.shadowRoot?.querySelector('input');
    if (!input) {
      this.internals.setFormValue(
        !this.isEffectivelyDisabled && this.checked && this.name ? this.value : null
      );
      return;
    }
    input.disabled = this.isEffectivelyDisabled;
    input.tabIndex = this.groupTabIndex;
    this.internals.setFormValue(
      !this.isEffectivelyDisabled && this.checked && this.name ? this.value : null
    );

    if (this.isEffectivelyDisabled) {
      this.internals.setValidity({});
      input.removeAttribute('aria-invalid');
      return;
    }
    const groupHasSelection = this.getGroup().some((radio) => radio.checked);
    if (this.customValidationMessage) {
      this.internals.setValidity({ customError: true }, this.customValidationMessage, input);
    } else if (this.required && !groupHasSelection) {
      this.internals.setValidity(
        { valueMissing: true },
        `${this.label || 'An option'} must be selected.`,
        input
      );
    } else {
      this.internals.setValidity({});
    }
    if (this.internals.validity.valid) input.removeAttribute('aria-invalid');
    else input.setAttribute('aria-invalid', 'true');
  }

  protected resetFormControl(): void {
    this.checked = this.defaultChecked;
    this.resetRadioGroup();
  }

  private resetRadioGroup(): void {
    const group = this.getGroup();
    const selected = group.find((radio) => radio.defaultChecked);
    for (const radio of group) {
      radio.checked = radio === selected;
      radio.syncFormControl();
      radio.requestUpdate();
    }
  }

  private getGroup(): NxRadio[] {
    if (!this.name) return [this];
    const root = this.getRootNode();
    if (!(root instanceof Document || root instanceof ShadowRoot)) return [this];
    return Array.from(root.querySelectorAll<NxRadio>('nx-radio')).filter(
      (radio) => radio.name === this.name && radio.form === this.form
    );
  }

  private setCheckedFromGroup(): void {
    for (const radio of this.getGroup()) {
      const checked = radio === this;
      if (radio.checked !== checked) {
        radio.checked = checked;
        const input = radio.shadowRoot?.querySelector<HTMLInputElement>('input');
        if (input) input.checked = checked;
        radio.requestUpdate();
      }
      radio.syncFormControl();
    }
  }

  private get groupTabIndex(): number {
    const group = this.getGroup().filter((radio) => !radio.isEffectivelyDisabled);
    const selected = group.find((radio) => radio.checked);
    return (selected ?? group[0]) === this ? 0 : -1;
  }

  private emitChange(): void {
    this.dispatchEvent(
      new CustomEvent<NxRadioChangeDetail>('nx-change', {
        detail: { checked: true, name: this.name, value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

  private handleChange(event: Event): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement) || !input.checked) return;
    this.setCheckedFromGroup();
    this.emitChange();
  }

  private handleKeydown(event: KeyboardEvent): void {
    const directions: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1
    };
    const direction = directions[event.key];
    if (!direction) return;

    const group = this.getGroup().filter((radio) => !radio.isEffectivelyDisabled);
    if (group.length < 2) return;
    event.preventDefault();

    const currentIndex = Math.max(group.indexOf(this), 0);
    const nextIndex = (currentIndex + direction + group.length) % group.length;
    const next = group[nextIndex];
    next.setCheckedFromGroup();
    next.shadowRoot?.querySelector<HTMLInputElement>('input')?.focus();
    next.emitChange();
  }

  render() {
    return html`
      <label>
        <input
          type="radio"
          name=${this.name}
          value=${this.value}
          .checked=${this.checked}
          ?disabled=${this.isEffectivelyDisabled}
          ?required=${this.required}
          .tabIndex=${this.groupTabIndex}
          @change=${this.handleChange}
          @keydown=${this.handleKeydown}
        />
        <span><slot>${this.label}</slot></span>
      </label>
    `;
  }
}

export default NxRadio;
