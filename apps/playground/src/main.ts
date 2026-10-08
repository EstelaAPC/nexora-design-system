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
