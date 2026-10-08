const originalAttachInternals = HTMLElement.prototype.attachInternals;
const owners = new WeakMap<ElementInternals, HTMLElement>();
const state = new WeakMap<ElementInternals, {
  value: string | FormData | null;
  flags: ValidityStateFlags;
  message: string;
}>();

HTMLElement.prototype.attachInternals = function attachInternals(): ElementInternals {
  const internals = originalAttachInternals.call(this);
  owners.set(internals, this);
  state.set(internals, { value: null, flags: {}, message: '' });
  return internals;
};

ElementInternals.prototype.setFormValue = function setFormValue(
  value: string | FormData | null,
  _state?: string | File | FormData | null
): void {
  const current = state.get(this);
  if (current) current.value = value;
};

ElementInternals.prototype.setValidity = function setValidity(
  flags: ValidityStateFlags = {},
  message = ''
): void {
  const current = state.get(this);
  if (!current) return;
  current.flags = flags;
  current.message = message;
};

ElementInternals.prototype.checkValidity = function checkValidity(): boolean {
  const current = state.get(this);
  const valid = !current || Object.values(current.flags).every((flag) => !flag);
  if (!valid) owners.get(this)?.dispatchEvent(new Event('invalid', { cancelable: true }));
  return valid;
};

ElementInternals.prototype.reportValidity = function reportValidity(): boolean {
  return this.checkValidity();
};

Object.defineProperties(ElementInternals.prototype, {
  validity: {
    configurable: true,
    get(): ValidityState {
      const flags = state.get(this)?.flags ?? {};
      const keys = [
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
      return {
        badInput: Boolean(flags.badInput),
        customError: Boolean(flags.customError),
        patternMismatch: Boolean(flags.patternMismatch),
        rangeOverflow: Boolean(flags.rangeOverflow),
        rangeUnderflow: Boolean(flags.rangeUnderflow),
        stepMismatch: Boolean(flags.stepMismatch),
        tooLong: Boolean(flags.tooLong),
        tooShort: Boolean(flags.tooShort),
        typeMismatch: Boolean(flags.typeMismatch),
        valueMissing: Boolean(flags.valueMissing),
        valid: keys.every((key) => !flags[key])
      };
    }
  },
  validationMessage: {
    configurable: true,
    get(): string {
      return state.get(this)?.message ?? '';
    }
  },
  willValidate: {
    configurable: true,
    get(): boolean {
      return !owners.get(this)?.hasAttribute('disabled');
    }
  }
});
