import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nx-card')
export class NxCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--nx-surface, var(--nx-color-neutral-0));
      border: 1px solid var(--nx-border, var(--nx-color-neutral-200));
      border-radius: var(--nx-radius-lg, 16px);
      box-shadow: var(--nx-shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.08));
      overflow: hidden;
      font-family: var(--nx-font-sans, sans-serif);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid var(--nx-border, var(--nx-color-neutral-200));
      background: var(--nx-surface-subtle, var(--nx-color-neutral-50));
      font-weight: 700;
    }

    .content {
      padding: 1.1rem;
      color: var(--nx-text-soft, var(--nx-color-neutral-600));
    }
  `;

  @property({ type: String }) title = 'Card';

  render() {
    return html`
      <div class="header">
        <span>${this.title}</span>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }
}

export default NxCard;
