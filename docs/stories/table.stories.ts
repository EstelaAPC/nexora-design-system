import type { Meta, StoryObj } from '@storybook/web-components';
import type { NxTable, NxTableColumn, NxTableRow } from '../../packages/components/src/table/table';
import '../../packages/components/src/table/table';

interface TeamMember extends NxTableRow {
  name: string;
  role: string;
  location: string;
  status: string;
}

const columns: NxTableColumn<TeamMember>[] = [
  { key: 'name', header: 'Name', rowHeader: true },
  { key: 'role', header: 'Role' },
  { key: 'location', header: 'Location' },
  { key: 'status', header: 'Status' }
];

const rows: TeamMember[] = [
  { name: 'Avery Johnson', role: 'Product designer', location: 'New York', status: 'Active' },
  { name: 'Jordan Lee', role: 'Frontend engineer', location: 'Toronto', status: 'On leave' },
  { name: 'Sam Patel', role: 'Design systems lead', location: 'London', status: 'Active' }
];

type TableArgs = {
  striped: boolean;
  hover: boolean;
  density: 'comfortable' | 'compact';
};

const meta: Meta<TableArgs> = {
  title: 'Components/Table',
  component: 'nx-table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A semantic native table. Set `header` for a caption, pass typed `columns` and `rows` as JavaScript properties, and use `emptyState` to customize the message shown when there are no rows. Cell values are text-only primitives; objects are rejected rather than rendered as markup.'
      }
    }
  },
  render: (args) => {
    const table = document.createElement('nx-table') as NxTable;
    Object.assign(table, {
      ...args,
      header: 'Team directory',
      columns,
      rows
    });
    return table;
  },
  args: {
    striped: true,
    hover: true,
    density: 'comfortable'
  }
};

export default meta;
type Story = StoryObj<TableArgs>;

export const Default: Story = {};
export const Compact: Story = { args: { density: 'compact' } };
export const Plain: Story = { args: { striped: false, hover: false } };

export const Empty: Story = {
  render: (args) => {
    const table = document.createElement('nx-table') as NxTable;
    Object.assign(table, {
      ...args,
      header: 'Team directory',
      columns,
      rows: [],
      emptyState: 'No team members match your search.'
    });
    return table;
  }
};
