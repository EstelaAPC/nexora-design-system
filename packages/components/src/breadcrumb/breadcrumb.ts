import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface NxBreadcrumbItem {
  label: string;
  href?: string;
}

@customElement('nx-breadcrumb')
export class NxBreadcrumb extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans, sans-serif);
    }

    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nx-spacing-2, 0.5rem);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    a {
      color: var(--nx-color-primary);
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }

    a:focus-visible {
      outline: var(--nx-button-focus-width) solid var(--nx-color-focus-ring);
      outline-offset: 2px;
    }

    .separator {
      color: var(--nx-color-text-secondary);
    }

    [aria-current='page'] {
      font-weight: var(--nx-font-weight-semibold, 600);
    }
  `;

  @property({ type: Array })
  items: NxBreadcrumbItem[] = [];

  @property({ type: String })
  label = 'Breadcrumb';

  render() {
    return html`
      <nav aria-label=${this.label}>
        <ol>
          ${this.items.map(
            (item, index) => html`
              <li>
                ${index === this.items.length - 1
                  ? html`<span aria-current="page">${item.label}</span>`
                  : item.href
                    ? html`<a href=${item.href}>${item.label}</a>`
                    : html`<span>${item.label}</span>`}
                ${index < this.items.length - 1
                  ? html`<span class="separator" aria-hidden="true">/</span>`
                  : ''}
              </li>
            `
          )}
        </ol>
      </nav>
    `;
  }
}

export default NxBreadcrumb;
