import '@nexora-ds/theme';
import '@nexora-ds/components';
import './styles.css';

const app = document.querySelector('#app');

if (app) {
  app.innerHTML = `
    <section class="panel">
      <h1>Nexora Design System</h1>
      <div class="demo-grid">
        <nx-button id="playground-action" variant="primary">Primary action</nx-button>
        <nx-button variant="secondary">Secondary</nx-button>
        <nx-button variant="ghost">Ghost</nx-button>
      </div>
      <p data-testid="button-status" aria-live="polite">Ready</p>
      <span id="button-click-count" aria-hidden="true">0</span>
    </section>

    <section class="panel">
      <h2>Icons</h2>
      <div id="playground-icon-gallery" class="icon-gallery">
        <span><nx-icon id="playground-icon" name="check" size="md"></nx-icon> Check</span>
        <span><nx-icon name="search" size="sm"></nx-icon> Search</span>
        <span><nx-icon name="warning" size="lg" aria-label="Warning"></nx-icon> Warning</span>
        <button id="playground-icon-button" type="button" aria-label="Close dialog">
          <nx-icon name="close"></nx-icon>
        </button>
      </div>
    </section>

    <section class="panel">
      <h2>Icon buttons</h2>
      <div class="icon-actions">
        <nx-icon-button id="playground-search-button" icon="search" aria-label="Search" variant="primary"></nx-icon-button>
        <nx-icon-button icon="close" aria-label="Close" variant="ghost"></nx-icon-button>
        <nx-icon-button icon="plus" aria-label="Add item" variant="secondary"></nx-icon-button>
        <nx-icon-button icon="warning" aria-label="Show warning" variant="danger"></nx-icon-button>
      </div>
      <form id="playground-icon-button-form" class="icon-actions">
        <input name="query" value="Nexora" aria-label="Search query">
        <nx-icon-button id="playground-icon-submit" icon="search" aria-label="Submit search" type="submit"></nx-icon-button>
        <nx-icon-button id="playground-icon-reset" icon="close" aria-label="Reset search" type="reset"></nx-icon-button>
        <span id="playground-icon-form-status" aria-live="polite"></span>
      </form>
    </section>

    <section class="panel">
      <h2>Feedback</h2>
      <div class="feedback-grid">
        <nx-alert id="playground-alert" severity="success" heading="Settings saved" dismissible>
          Your preferences have been updated.
        </nx-alert>
        <div class="feedback-status">
          <nx-spinner id="playground-spinner" size="md" label="Loading results"></nx-spinner>
          <nx-progress id="playground-progress" value="60" max="100" label="Upload progress"></nx-progress>
        </div>
        <nx-toast id="playground-toast" open severity="info" duration="0" dismissible>
          This notification can be dismissed.
        </nx-toast>
      </div>
    </section>

    <section class="panel">
      <h2>Navigation</h2>
      <nx-breadcrumb
        id="playground-breadcrumb"
        label="Page location"
      ></nx-breadcrumb>
      <nx-tabs id="playground-tabs" label="Project details">
        <button slot="tab">Overview</button>
        <button slot="tab">Activity</button>
        <section slot="panel">Project overview content.</section>
        <section slot="panel">Recent project activity.</section>
      </nx-tabs>
      <nx-pagination id="playground-pagination" current-page="3" total-pages="12"></nx-pagination>
      <span id="playground-pagination-status" aria-live="polite">Page 3</span>
    </section>

    <section class="panel">
      <h2>Overlays</h2>
      <div class="overlay-actions">
        <button id="playground-open-dialog" type="button">Open dialog</button>
        <nx-dialog id="playground-dialog" title="Project details">
          This dialog uses the native dialog element.
        </nx-dialog>
        <nx-tooltip id="playground-tooltip" text="Additional information">
          <button type="button">Focus or hover for a tooltip</button>
        </nx-tooltip>
        <nx-popover id="playground-popover" title="Actions">
          <span slot="trigger">More actions</span>
          <button type="button">Rename project</button>
        </nx-popover>
      </div>
    </section>

    <section class="panel">
      <h2>Data display</h2>
      <nx-table id="playground-table" header="Team directory" striped hover></nx-table>
    </section>

    <section class="panel">
      <nx-card title="Form demo">
        <nx-input label="Email" type="email" placeholder="name@example.com"></nx-input>
        <div style="margin-top: 1rem; display: flex; gap: 0.75rem; align-items: center;">
          <nx-badge>New</nx-badge>
          <nx-badge tone="success">Ready</nx-badge>
        </div>
      </nx-card>
    </section>

    <section class="panel demo-grid">
      <nx-textarea
        id="playground-textarea"
        label="Description"
        name="description"
        placeholder="Describe your update"
        helper-text="Keep it concise."
        rows="3"
      ></nx-textarea>
      <nx-checkbox id="playground-checkbox" name="terms" value="accepted" label="Accept the terms"></nx-checkbox>
      <nx-checkbox id="playground-indeterminate" indeterminate label="Select all items"></nx-checkbox>
      <div role="radiogroup" aria-label="Notification preference">
        <nx-radio name="preference" value="email" label="Email"></nx-radio>
        <nx-radio name="preference" value="sms" label="SMS"></nx-radio>
      </div>
      <nx-switch id="playground-switch" name="notifications" value="enabled" label="Notifications"></nx-switch>
      <nx-switch disabled label="Disabled switch"></nx-switch>
    </section>

    <section class="panel demo-grid">
      <nx-select id="playground-select" label="Country" name="country" placeholder="Choose a country">
        <option value="br">Brazil</option>
        <option value="us">United States</option>
        <option value="pt">Portugal</option>
      </nx-select>
      <nx-select label="Required country" name="required-country" required placeholder="Choose a country">
        <option value="br">Brazil</option>
        <option value="pt">Portugal</option>
      </nx-select>
      <form id="playground-select-form">
        <nx-select label="Shipping country" name="shipping-country" value="br">
          <option value="br">Brazil</option>
          <option value="us">United States</option>
        </nx-select>
        <button type="submit">Submit country</button>
      </form>
    </section>
  `;

  const action = app.querySelector('#playground-action');
  const status = app.querySelector('[data-testid="button-status"]');
  const clickCount = app.querySelector('#button-click-count');
  let count = 0;
  action?.addEventListener('click', () => {
    count += 1;
    if (status) status.textContent = 'Primary action clicked';
    if (clickCount) clickCount.textContent = String(count);
  });

  app.querySelector('#playground-icon-button-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = app.querySelector('#playground-icon-form-status');
    if (status) status.textContent = 'Search submitted';
  });

  const breadcrumb = app.querySelector('#playground-breadcrumb') as HTMLElement & {
    items: Array<{ label: string; href?: string }>;
  } | null;
  if (breadcrumb) {
    breadcrumb.items = [
      { label: 'Home', href: '/' },
      { label: 'Components', href: '/components' },
      { label: 'Navigation' }
    ];
  }

  app.querySelector('#playground-pagination')?.addEventListener('nx-page-change', (event) => {
    const pagination = event.currentTarget as HTMLElement & { currentPage: number };
    app.querySelector('#playground-pagination-status')?.replaceChildren(
      document.createTextNode(`Page ${pagination.currentPage}`)
    );
  });

  app.querySelector('#playground-open-dialog')?.addEventListener('click', () => {
    const dialog = app.querySelector('#playground-dialog') as HTMLElement & { open: boolean } | null;
    if (dialog) dialog.open = true;
  });

  const table = app.querySelector('#playground-table') as HTMLElement & {
    columns: Array<{ key: string; header: string; rowHeader?: boolean }>;
    rows: Array<Record<string, string>>;
  } | null;
  if (table) {
    table.columns = [
      { key: 'name', header: 'Name', rowHeader: true },
      { key: 'role', header: 'Role' },
      { key: 'location', header: 'Location' }
    ];
    table.rows = [
      { name: 'Avery Johnson', role: 'Product designer', location: 'New York' },
      { name: 'Jordan Lee', role: 'Frontend engineer', location: 'Toronto' },
      { name: 'Sam Patel', role: 'Design systems lead', location: 'London' }
    ];
  }
}
