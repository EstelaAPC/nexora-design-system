import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxDialog } from '../../packages/components/src/dialog/dialog';
import type { NxPopover } from '../../packages/components/src/popover/popover';
import type { NxTooltip } from '../../packages/components/src/tooltip/tooltip';
import '../../packages/components/src/dialog/dialog';
import '../../packages/components/src/popover/popover';
import '../../packages/components/src/tooltip/tooltip';

type OverlayArgs = {
  title: string;
  text: string;
  open: boolean;
  modal: boolean;
  placement: 'top' | 'right' | 'bottom' | 'left';
  trigger: 'click' | 'manual';
};

const meta: Meta<OverlayArgs> = {
  title: 'Components/Overlays',
  component: 'nx-dialog',
  args: {
    title: 'Overlay title',
    text: 'Additional information for this example.',
    open: false,
    modal: true,
    placement: 'bottom',
    trigger: 'click'
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    trigger: { control: 'inline-radio', options: ['click', 'manual'] }
  }
};

export default meta;
type Story = StoryObj<OverlayArgs>;

export const Dialog: Story = {
  render: (args) => {
    const dialog = document.createElement('nx-dialog') as NxDialog;
    dialog.title = args.title;
    dialog.modal = args.modal;
    dialog.open = args.open;
    dialog.textContent = 'Review this important information before continuing.';
    const opener = document.createElement('button');
    opener.textContent = 'Open dialog';
    opener.addEventListener('click', () => { dialog.open = true; });
    const wrapper = document.createElement('div');
    wrapper.append(opener, dialog);
    return wrapper;
  }
};

export const Tooltip: Story = {
  render: (args) => {
    const tooltip = document.createElement('nx-tooltip') as NxTooltip;
    tooltip.text = args.text;
    const trigger = document.createElement('button');
    trigger.textContent = 'Focus or hover for details';
    tooltip.append(trigger);
    return tooltip;
  }
};

export const Popover: Story = {
  render: (args) => {
    const popover = document.createElement('nx-popover') as NxPopover;
    popover.title = args.title;
    popover.open = args.open;
    popover.placement = args.placement;
    popover.trigger = args.trigger;
    const trigger = document.createElement('span');
    trigger.slot = 'trigger';
    trigger.textContent = 'More actions';
    const content = document.createElement('p');
    content.textContent = args.text;
    popover.append(trigger, content);
    return popover;
  }
};
