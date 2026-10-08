import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxSelect } from '../../packages/components/src/select/select';

type SelectArgs = {
  label: string;
  value: string;
  placeholder: string;
  required: boolean;
  disabled: boolean;
  helpText: string;
  error: string;
};

const countries = [
  { value: 'br', label: 'Brazil' },
  { value: 'us', label: 'United States' },
  { value: 'pt', label: 'Portugal' }
];

const meta: Meta<SelectArgs> = {
  title: 'Components/Select',
  component: 'nx-select',
  render: (args) => {
    const select = document.createElement('nx-select') as NxSelect;
    Object.assign(select, args);
    for (const country of countries) {
      const option = document.createElement('option');
      option.value = country.value;
      option.textContent = country.label;
      select.append(option);
    }
    return select;
  },
  args: {
    label: 'Country',
    value: '',
    placeholder: 'Choose a country',
    required: false,
    disabled: false,
    helpText: '',
    error: ''
  }
};

export default meta;
type Story = StoryObj<SelectArgs>;

export const Default: Story = {};
export const Placeholder: Story = {};
export const Selected: Story = { args: { value: 'br' } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { error: 'Choose a country.' } };
export const LongOptions: Story = {
  render: (args) => {
    const select = document.createElement('nx-select') as NxSelect;
    Object.assign(select, args);
    for (let index = 1; index <= 40; index += 1) {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `Country ${index}`;
      select.append(option);
    }
    return select;
  }
};
export const KeyboardInteraction: Story = {};
export const FormIntegration: Story = {
  render: (args) => {
    const form = document.createElement('form');
    const select = document.createElement('nx-select') as NxSelect;
    Object.assign(select, { ...args, name: 'country', required: true });
    for (const country of countries) {
      const option = document.createElement('option');
      option.value = country.value;
      option.textContent = country.label;
      select.append(option);
    }
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Submit';
    form.append(select, submit);
    return form;
  }
};
