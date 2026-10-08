import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxCheckbox } from '../../packages/components/src/checkbox/checkbox';

type CheckboxArgs = {
  label: string;
  checked: boolean;
  disabled: boolean;
  indeterminate: boolean;
  required: boolean;
};

const meta: Meta<CheckboxArgs> = {
  title: 'Components/Checkbox',
  component: 'nx-checkbox',
  render: (args) => {
    const checkbox = document.createElement('nx-checkbox') as NxCheckbox;
    Object.assign(checkbox, args);
    return checkbox;
  },
  args: {
    label: 'Accept the terms',
    checked: false,
    disabled: false,
    indeterminate: false,
    required: false
  }
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
