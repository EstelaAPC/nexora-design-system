import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxButton } from '../../packages/components/src/button/button';

type ButtonStoryArgs = {
  label: string;
  variant: NxButton['variant'];
  size: NxButton['size'];
  disabled: boolean;
  loading: boolean;
  fullWidth: boolean;
};

const meta: Meta<ButtonStoryArgs> = {
  title: 'Components/Button',
  component: 'nx-button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The Nexora button is a native \`<button>\` inside a Lit custom element. It preserves native click, keyboard, form, and disabled behavior.

Properties: \`variant\` (primary, secondary, outline, ghost, danger), \`size\` (sm, md, lg), \`disabled\`, \`loading\`, \`fullWidth\`, and \`type\` (button, submit, reset).

Usage: \`import '@nexora-ds/components/button';\` followed by \`<nx-button variant="primary">Save</nx-button>\`.
        `
      }
    }
  },
  render: (args) => {
    const button = document.createElement('nx-button') as NxButton;
    button.textContent = args.label;
    button.variant = args.variant;
    button.size = args.size;
    button.disabled = args.disabled;
    button.loading = args.loading;
    button.fullWidth = args.fullWidth;
    if (args.fullWidth) {
      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.append(button);
      return wrapper;
    }
    return button;
  },
  argTypes: {
    label: { control: 'text', description: 'Visible text and accessible name.' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'Visual treatment of the action.'
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Control height and horizontal padding.'
    },
    disabled: { control: 'boolean', description: 'Disables native button interaction.' },
    loading: { control: 'boolean', description: 'Shows progress and temporarily disables interaction.' },
    fullWidth: { control: 'boolean', description: 'Expands to fill the available width.' },
    type: { control: false, description: 'Native button type: button, submit, or reset.' }
  },
  args: {
    label: 'Save changes',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false
  }
};

export default meta;
type Story = StoryObj<ButtonStoryArgs>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Danger: Story = { args: { variant: 'danger' } };
export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const FullWidth: Story = { args: { fullWidth: true } };
