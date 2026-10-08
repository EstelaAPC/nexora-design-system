import '@nexora/theme';
import '@nexora/components';
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
}
