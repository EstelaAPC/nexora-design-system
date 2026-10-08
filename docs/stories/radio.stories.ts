import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxRadio } from '../../packages/components/src/radio/radio';

type RadioArgs = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  disabled: boolean;
  required: boolean;
};

const meta: Meta<RadioArgs> = {
  title: 'Components/Radio',
  component: 'nx-radio',
  render: (args) => {
    const radio = document.createElement('nx-radio') as NxRadio;
    Object.assign(radio, args);
    return radio;
  },
  args: {
    label: 'Email',
    name: 'notification',
    value: 'email',
    checked: false,
    disabled: false,
    required: false
  }
};

export default meta;
type Story = StoryObj<RadioArgs>;

export const Default: Story = {};
export const Group: Story = {
  render: () => {
    const group = document.createElement('div');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Notification preference');
    for (const [value, label] of [['email', 'Email'], ['sms', 'SMS'], ['none', 'None']]) {
      const radio = document.createElement('nx-radio') as NxRadio;
      radio.name = 'notification';
      radio.value = value;
      radio.label = label;
      group.append(radio);
    }
    return group;
  }
};
export const Selected: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
