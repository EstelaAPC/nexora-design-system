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
}
