import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nx-badge')
export class NxBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--nx-spacing-1);
      padding: var(--nx-spacing-1) var(--nx-spacing-2);
      border-radius: var(--nx-radius-pill);
      background: var(--nx-color-badge-background);
      color: var(--nx-color-badge-text);
      font-size: var(--nx-font-size-xs);
      font-weight: var(--nx-font-weight-bold);
      letter-spacing: var(--nx-letter-spacing-label);
      font-family: var(--nx-font-family-sans);
    }
  `;

  @property({ type: String }) tone = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

export default NxBadge;
