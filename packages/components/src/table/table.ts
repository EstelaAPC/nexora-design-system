import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type NxTableCellValue = string | number | boolean | null | undefined;
export type NxTableRow = Readonly<Record<string, NxTableCellValue>>;
export type NxTableDensity = 'comfortable' | 'compact';

export interface NxTableColumnDefinition {
  key: string;
  header: string;
  rowHeader?: boolean;
}

export type NxTableColumn<Row extends NxTableRow = NxTableRow> = NxTableColumnDefinition & {
  key: Extract<keyof Row, string>;
};

@customElement('nx-table')
export class NxTable extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans);
    }

    .table-container {
      overflow-x: auto;
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-radius: var(--nx-radius-md);
      background: var(--nx-color-surface);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    caption {
      padding: var(--nx-spacing-4);
      color: var(--nx-color-text-primary);
      font-size: var(--nx-font-size-lg);
      font-weight: var(--nx-font-weight-semibold);
      text-align: left;
    }

    th,
    td {
      padding: var(--nx-spacing-3) var(--nx-spacing-4);
      border-bottom: var(--nx-border-width-thin) solid var(--nx-color-border);
      vertical-align: top;
    }

    th {
      background: var(--nx-color-surface-subtle);
      color: var(--nx-color-text-primary);
      font-size: var(--nx-font-size-sm);
      font-weight: var(--nx-font-weight-semibold);
    }

    td {
      color: var(--nx-color-text-secondary);
      font-size: var(--nx-font-size-sm);
    }

    tbody tr:last-child th,
    tbody tr:last-child td {
      border-bottom: 0;
    }

    :host([striped]) tbody tr:nth-child(even) {
      background: var(--nx-color-surface-subtle);
    }

    :host([hover]) tbody tr:hover {
      background: var(--nx-color-surface-hover);
    }

    :host([density='compact']) th,
    :host([density='compact']) td {
      padding-block: var(--nx-spacing-2);
    }

    .empty-state {
      color: var(--nx-color-text-secondary);
      text-align: center;
    }

    @media (prefers-reduced-motion: no-preference) {
      tbody tr {
        transition: background-color var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
      }
    }
  `;

  @property({ type: String })
  header = '';

  @property({ attribute: false })
  columns: NxTableColumnDefinition[] = [];

  @property({ attribute: false })
  rows: NxTableRow[] = [];

  @property({ type: Boolean, reflect: true })
  striped = false;

  @property({ type: Boolean, reflect: true })
  hover = false;

  @property({ type: String, reflect: true })
  density: NxTableDensity = 'comfortable';

  @property({ type: String, attribute: 'empty-state' })
  emptyState = 'No data available.';

  protected willUpdate(): void {
    this.validateData();
  }

  private validateData(): void {
    if (!Array.isArray(this.columns)) {
      throw new TypeError('nx-table columns must be an array of column definitions.');
    }
    if (!Array.isArray(this.rows)) {
      throw new TypeError('nx-table rows must be an array of row objects.');
    }

    const keys = new Set<string>();
    for (const column of this.columns) {
      if (!column || typeof column.key !== 'string' || typeof column.header !== 'string') {
        throw new TypeError('Each nx-table column must have a string key and header.');
      }
      if (keys.has(column.key)) {
        throw new TypeError(`nx-table column keys must be unique; "${column.key}" is repeated.`);
      }
      keys.add(column.key);
    }

    for (const [rowIndex, row] of this.rows.entries()) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        throw new TypeError(`nx-table row at index ${rowIndex} must be an object.`);
      }
      for (const column of this.columns) {
        const value = row[column.key];
        if (value !== null && value !== undefined && !['string', 'number', 'boolean'].includes(typeof value)) {
          throw new TypeError(
            `nx-table cell "${column.key}" in row ${rowIndex} must be a string, number, boolean, or nullish value.`
          );
        }
      }
    }
  }

  private renderCell(value: NxTableCellValue) {
    return value === null || value === undefined ? '' : String(value);
  }

  render() {
    return html`
      <div class="table-container">
        <table>
          ${this.header ? html`<caption>${this.header}</caption>` : ''}
          <thead>
            <tr>
              ${this.columns.map((column) => html`<th scope="col">${column.header}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${this.rows.length === 0
              ? html`<tr><td class="empty-state" colspan=${Math.max(this.columns.length, 1)}>${this.emptyState}</td></tr>`
              : this.rows.map((row) => html`
                  <tr>
                    ${this.columns.map((column) => {
                      const value = this.renderCell(row[column.key]);
                      return column.rowHeader
                        ? html`<th scope="row">${value}</th>`
                        : html`<td>${value}</td>`;
                    })}
                  </tr>
                `)}
          </tbody>
        </table>
      </div>
    `;
  }
}

export default NxTable;
