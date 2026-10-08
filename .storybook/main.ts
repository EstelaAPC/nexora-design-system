import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../docs/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  addons: ['@storybook/addon-essentials']
};

export default config;
