import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxTextarea } from '../../packages/components/src/textarea/textarea';

type TextareaArgs = {
  label: string;
  value: string;
  placeholder: string;
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  error: string;
  helperText: string;
  size: NxTextarea['size'];
};

const meta: Meta<TextareaArgs> = {
  title: 'Components/Textarea',
  component: 'nx-textarea',
  render: (args) => {
    const textarea = document.createElement('nx-textarea') as NxTextarea;
    Object.assign(textarea, args);
    return textarea;
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }
  },
  args: {
    label: 'Description',
    value: '',
    placeholder: 'Write a description',
    required: false,
    disabled: false,
    readOnly: false,
    error: '',
    helperText: '',
    size: 'md'
  }
};

export default meta;
type Story = StoryObj<TextareaArgs>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = { args: { error: 'Please provide a description.' } };
export const WithHelperText: Story = { args: { helperText: 'Keep it concise.' } };
export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };
