import type { Meta, StoryObj } from '@storybook/web-components';
import type { IconName } from '@nexora-ds/icons';
import type { NxIcon } from '../../packages/components/src/icon/icon';

type IconArgs = {
  name: IconName;
  size: 'sm' | 'md' | 'lg';
};

const names: IconName[] = [
  'check',
  'close',
  'plus',
  'minus',
  'chevron-down',
  'chevron-up',
  'arrow-left',
  'arrow-right',
  'info',
  'warning',
  'search'
];

const meta: Meta<IconArgs> = {
  title: 'Components/Icon',
  component: 'nx-icon',
  render: (args) => {
    const icon = document.createElement('nx-icon') as NxIcon;
    icon.name = args.name;
    icon.size = args.size;
    return icon;
  },
  argTypes: {
    name: { control: 'select', options: names },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }
  },
  args: { name: 'check', size: 'md' }
};

export default meta;
type Story = StoryObj<IconArgs>;

export const Default: Story = {};

export const Gallery: Story = {
  render: () => {
    const gallery = document.createElement('div');
    gallery.style.display = 'grid';
    gallery.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
    gallery.style.gap = '1rem';
    for (const name of names) {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '0.5rem';
      const icon = document.createElement('nx-icon') as NxIcon;
      icon.name = name;
      item.append(icon, document.createTextNode(name));
      gallery.append(item);
    }
    return gallery;
  }
};

export const Sizes: Story = {
  render: () => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '1rem';
    for (const size of ['sm', 'md', 'lg'] as const) {
      const icon = document.createElement('nx-icon') as NxIcon;
      icon.name = 'check';
      icon.size = size;
      row.append(icon);
    }
    return row;
  }
};

export const Decorative: Story = {};

export const Accessible: Story = {
  render: () => {
    const icon = document.createElement('nx-icon') as NxIcon;
    icon.name = 'warning';
    icon.ariaLabel = 'Warning';
    return icon;
  }
};

export const Theme: Story = {
  render: () => {
    const row = document.createElement('div');
    row.dataset.theme = 'dark';
    row.style.cssText = 'display:inline-flex;align-items:center;gap:var(--nx-spacing-4);padding:var(--nx-spacing-4);background:var(--nx-color-surface);color:var(--nx-color-text-primary)';
    const icon = document.createElement('nx-icon') as NxIcon;
    icon.name = 'info';
    row.append(icon, document.createTextNode('Theme-aware currentColor'));
    return row;
  }
};

export const InsideButton: Story = {
  render: () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Close dialog');
    button.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;padding:0.5rem;color:inherit';
    const icon = document.createElement('nx-icon') as NxIcon;
    icon.name = 'close';
    button.append(icon);
    return button;
  }
};
