import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxBreadcrumb, NxBreadcrumbItem } from '../../packages/components/src/breadcrumb/breadcrumb';
import type { NxPagination } from '../../packages/components/src/pagination/pagination';
import type { NxTabs } from '../../packages/components/src/tabs/tabs';
import '../../packages/components/src/breadcrumb/breadcrumb';
import '../../packages/components/src/pagination/pagination';
import '../../packages/components/src/tabs/tabs';

type NavigationArgs = {
  currentPage: number;
  totalPages: number;
};

const meta: Meta<NavigationArgs> = {
  title: 'Components/Navigation',
  component: 'nx-tabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Navigation primitives for breadcrumbs, tabs, and pagination. Breadcrumbs take \`items\` with \`label\` and \`href\`; the last label is rendered as the current page. Tabs use native light-DOM \`<button slot="tab">\` and panel elements with \`slot="panel"\`. Tabs use automatic activation: arrow keys and Home/End both move focus and select immediately. Pagination exposes \`currentPage\` and \`totalPages\`, and emits bubbling, composed \`nx-page-change\` events with \`{ page }\` detail.
        `
      }
    }
  },
  render: (args) => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '2rem';

    const breadcrumb = document.createElement('nx-breadcrumb') as NxBreadcrumb;
    breadcrumb.items = [
      { label: 'Home', href: '/' },
      { label: 'Library', href: '/library' },
      { label: 'Current page', href: '/library/current' }
    ] satisfies NxBreadcrumbItem[];

    const tabs = document.createElement('nx-tabs') as NxTabs;
    tabs.label = 'Project information';
    tabs.innerHTML =
      '<button slot="tab">Overview</button><button slot="tab">Activity</button>' +
      '<section slot="panel">Project overview content.</section><section slot="panel">Recent activity content.</section>';

    const pagination = document.createElement('nx-pagination') as NxPagination;
    pagination.currentPage = args.currentPage;
    pagination.totalPages = args.totalPages;

    container.append(breadcrumb, tabs, pagination);
    return container;
  },
  args: {
    currentPage: 3,
    totalPages: 12
  },
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 }, description: 'Currently selected page.' },
    totalPages: { control: { type: 'number', min: 1 }, description: 'Total number of pages.' }
  }
};

export default meta;
type Story = StoryObj<NavigationArgs>;

export const BreadcrumbTabsAndPagination: Story = {};

export const PaginationAtStart: Story = { args: { currentPage: 1, totalPages: 12 } };

export const PaginationAtEnd: Story = { args: { currentPage: 12, totalPages: 12 } };
