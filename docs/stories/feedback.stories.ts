import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxAlert } from '../../packages/components/src/alert/alert';
import type { NxProgress } from '../../packages/components/src/progress/progress';
import type { NxSpinner } from '../../packages/components/src/spinner/spinner';
import type { NxToast } from '../../packages/components/src/toast/toast';
import '../../packages/components/src/alert/alert';
import '../../packages/components/src/progress/progress';
import '../../packages/components/src/spinner/spinner';
import '../../packages/components/src/toast/toast';

type FeedbackArgs = {
  severity: 'info' | 'success' | 'warning' | 'error';
  heading: string;
  dismissible: boolean;
  size: 'sm' | 'md' | 'lg';
  label: string;
  value: number;
  max: number;
  open: boolean;
  duration: number;
};

const meta: Meta<FeedbackArgs> = {
  title: 'Components/Feedback',
  component: 'nx-alert',
  args: {
    severity: 'info',
    heading: 'System update',
    dismissible: true,
    size: 'md',
    label: 'Loading',
    value: 45,
    max: 100,
    open: true,
    duration: 0
  },
  argTypes: {
    severity: { control: 'inline-radio', options: ['info', 'success', 'warning', 'error'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'number', min: 0 } },
    max: { control: { type: 'number', min: 1 } },
    duration: { control: { type: 'number', min: 0 } }
  }
};

export default meta;
type Story = StoryObj<FeedbackArgs>;

export const Alert: Story = {
  render: (args) => {
    const alert = document.createElement('nx-alert') as NxAlert;
    alert.severity = args.severity;
    alert.heading = args.heading;
    alert.dismissible = args.dismissible;
    alert.textContent = 'Your settings have been updated.';
    return alert;
  }
};

export const Spinner: Story = {
  render: (args) => {
    const spinner = document.createElement('nx-spinner') as NxSpinner;
    spinner.size = args.size;
    spinner.label = args.label;
    return spinner;
  }
};

export const Progress: Story = {
  render: (args) => {
    const progress = document.createElement('nx-progress') as NxProgress;
    progress.label = args.label;
    progress.value = args.value;
    progress.max = args.max;
    return progress;
  }
};

export const IndeterminateProgress: Story = {
  render: (args) => {
    const progress = document.createElement('nx-progress') as NxProgress;
    progress.label = args.label;
    return progress;
  }
};

export const Toast: Story = {
  render: (args) => {
    const toast = document.createElement('nx-toast') as NxToast;
    toast.severity = args.severity;
    toast.open = args.open;
    toast.dismissible = args.dismissible;
    toast.duration = args.duration;
    toast.textContent = 'Your settings have been updated.';
    return toast;
  }
};
