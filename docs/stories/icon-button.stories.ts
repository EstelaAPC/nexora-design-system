import type { Meta, StoryObj } from '@storybook/web-components';
import type { IconName } from '@nexora-ds/icons';
import type { NxIconButton, NxIconButtonSize, NxIconButtonVariant } from '../../packages/components/src/icon-button/icon-button';

type IconButtonArgs = {
  icon: IconName;
  size: NxIconButtonSize;
  variant: NxIconButtonVariant;
  disabled: boolean;
};

const icons: IconName[] = ['close', 'search', 'plus', 'minus', 'check', 'warning'];
const sizes: NxIconButtonSize[] = ['sm', 'md', 'lg'];
const variants: NxIconButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];

function createButton(args: IconButtonArgs, label = 'Search'): NxIconButton {
  const button = document.createElement('nx-icon-button') as NxIconButton;
  button.icon = args.icon;
  button.size = args.size;
  button.variant = args.variant;
  button.disabled = args.disabled;
  button.ariaLabel = label;
  return button;
}

const meta: Meta<IconButtonArgs> = {
  title: 'Components/Icon Button',
  component: 'nx-icon-button',
  render: (args) => createButton(args),
  argTypes: {
    icon: { control: 'select', options: icons },
    size: { control: 'inline-radio', options: sizes },
    variant: { control: 'select', options: variants },
    disabled: { control: 'boolean' }
  },
  args: { icon: 'search', size: 'md', variant: 'primary', disabled: false },
  parameters: {
    docs: {
      description: {
        component: 'Icon-only buttons require a meaningful aria-label. The icon remains decorative and never supplies an inferred accessible name.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<IconButtonArgs>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:1rem';
    for (const size of sizes) row.append(createButton({ ...args, size }, `Search (${size})`));
    return row;
  }
};

export const Variants: Story = {
  render: (args) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:1rem';
    for (const variant of variants) row.append(createButton({ ...args, variant }, `Search (${variant})`));
    return row;
  }
};

export const Disabled: Story = {
  args: { disabled: true }
};

export const Focus: Story = {
  render: (args) => {
    const wrapper = document.createElement('div');
    const button = createButton(args);
    wrapper.append(button);
    window.setTimeout(() => {
      void button.updateComplete.then(() => button.shadowRoot?.querySelector('button')?.focus());
    }, 0);
    return wrapper;
  }
};

export const Submit: Story = {
  render: (args) => {
    const form = document.createElement('form');
    form.innerHTML = '<input name="query" value="Nexora"><span aria-live="polite"></span>';
    form.style.cssText = 'display:flex;align-items:center;gap:.5rem';
    const button = createButton({ ...args, icon: 'search' }, 'Search');
    button.type = 'submit';
    form.append(button);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = form.querySelector('span');
      if (status) status.textContent = 'Submitted';
    });
    return form;
  }
};

export const Reset: Story = {
  render: (args) => {
    const form = document.createElement('form');
    form.innerHTML = '<input name="query" value="Reset me">';
    form.style.cssText = 'display:flex;align-items:center;gap:.5rem';
    const button = createButton({ ...args, icon: 'close' }, 'Reset form');
    button.type = 'reset';
    form.append(button);
    return form;
  }
};

export const Theme: Story = {
  render: (args) => {
    const container = document.createElement('div');
    container.dataset.theme = 'dark';
    container.style.cssText = 'display:flex;gap:1rem;padding:1rem;background:var(--nx-color-background);color:var(--nx-color-text-primary)';
    container.append(createButton(args, 'Search'));
    return container;
  }
};

export const AccessibleIconButton: Story = {
  name: 'Accessible Icon Button',
  render: (args) => createButton({ ...args, icon: 'warning' }, 'Show warning details')
};

export const DifferentIcons: Story = {
  render: (args) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:1rem';
    for (const icon of icons) row.append(createButton({ ...args, icon }, `${icon} action`));
    return row;
  }
};
