import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nx-card')
export class NxCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--nx-color-surface);
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-radius: var(--nx-radius-lg);
      box-shadow: var(--nx-elevation-low);
      overflow: hidden;
      font-family: var(--nx-font-family-sans);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--nx-spacing-2);
      padding: var(--nx-spacing-4);
      border-bottom: var(--nx-border-width-thin) solid var(--nx-color-border);
      background: var(--nx-color-surface-subtle);
      font-weight: var(--nx-font-weight-bold);
    }

    .content {
      padding: var(--nx-spacing-4);
      color: var(--nx-color-text-secondary);
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
