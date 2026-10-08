import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxSwitch } from '../../packages/components/src/switch/switch';

type SwitchArgs = {
  label: string;
  checked: boolean;
  disabled: boolean;
  required: boolean;
};

const meta: Meta<SwitchArgs> = {
  title: 'Components/Switch',
  component: 'nx-switch',
  render: (args) => {
    const control = document.createElement('nx-switch') as NxSwitch;
    Object.assign(control, args);
    return control;
  },
  args: {
    label: 'Notifications',
    checked: false,
    disabled: false,
    required: false
  }
};

export default meta;
type Story = StoryObj<SwitchArgs>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
