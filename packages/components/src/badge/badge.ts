import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nx-badge')
export class NxBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.6rem;
      border-radius: 999px;
      background: var(--nx-color-brand-100, #e0e7ff);
      color: var(--nx-color-brand-700, #4338ca);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      font-family: var(--nx-font-sans, sans-serif);
    }
  `;

  @property({ type: String }) tone = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

export default NxBadge;
