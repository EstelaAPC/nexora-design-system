import { LitElement } from 'lit';

const validityKeys = [
  'badInput',
  'customError',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing'
] as const;

export abstract class NxFormAssociatedElement extends LitElement {
  static formAssociated = true;

  protected readonly internals: ElementInternals;
  protected formDisabled = false;
  protected customValidationMessage = '';

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  get form(): HTMLFormElement | null {
    return this.internals.form ?? null;
  }

  get validity(): ValidityState {
    return this.internals.validity;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  get willValidate(): boolean {
    return this.internals.willValidate;
  }

  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.customValidationMessage = message;
    this.syncFormControl();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    this.requestUpdate();
    this.syncFormControl();
  }

  formResetCallback(): void {
    this.resetFormControl();
  }

  protected get isEffectivelyDisabled(): boolean {
    return Boolean((this as HTMLElement & { disabled?: boolean }).disabled || this.formDisabled);
  }

  protected syncValidity(
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    requiredMessage: string,
    componentError = ''
  ): void {
    if (this.isEffectivelyDisabled) {
      this.internals.setValidity({});
      return;
    }

    const validity = control.validity;
    const flags = Object.fromEntries(
      validityKeys
        .filter((key) => validity[key])
        .map((key) => [key, true])
    ) as ValidityStateFlags;

    const customError = this.customValidationMessage || componentError;
    if (customError) {
      this.internals.setValidity(
        { customError: true },
        customError,
        control
      );
      return;
    }

    if (!validity.valid) {
      this.internals.setValidity(
        flags,
        validity.valueMissing ? requiredMessage : control.validationMessage,
        control
      );
      return;
    }

    this.internals.setValidity({});
  }

  protected abstract syncFormControl(): void;
  protected abstract resetFormControl(): void;
}
