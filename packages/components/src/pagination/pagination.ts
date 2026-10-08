import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface NxPageChangeDetail {
  page: number;
}

export type NxPageChangeEvent = CustomEvent<NxPageChangeDetail>;

type PageToken = number | 'ellipsis';

@customElement('nx-pagination')
export class NxPagination extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans, sans-serif);
    }

    nav,
    ol {
      display: flex;
      align-items: center;
      gap: var(--nx-spacing-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    button {
      min-width: var(--nx-button-height-md);
      min-height: var(--nx-button-height-md);
      padding-inline: var(--nx-spacing-2);
      border: var(--nx-border-width-thin) solid var(--nx-color-border);
      border-radius: var(--nx-button-radius);
      background: var(--nx-color-surface);
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    button[aria-current='page'] {
      border-color: var(--nx-color-primary);
      background: var(--nx-color-primary);
      color: var(--nx-color-on-primary);
    }

    button:focus-visible {
      outline: var(--nx-button-focus-width) solid var(--nx-color-focus-ring);
      outline-offset: 2px;
    }

    button:disabled {
      color: var(--nx-color-disabled-text);
      cursor: not-allowed;
    }

    .ellipsis {
      min-width: var(--nx-button-height-md);
      text-align: center;
    }
  `;

  @property({ type: Number, attribute: 'current-page' })
  currentPage = 1;

  @property({ type: Number, attribute: 'total-pages' })
  totalPages = 1;

  @property({ type: String })
  label = 'Pagination';

  @property({ type: String, attribute: 'previous-label' })
  previousLabel = 'Previous page';

  @property({ type: String, attribute: 'next-label' })
  nextLabel = 'Next page';

  private get pageCount(): number {
    return Math.max(1, Math.floor(Number.isFinite(this.totalPages) ? this.totalPages : 1));
  }

  protected willUpdate(): void {
    if (this.totalPages !== this.pageCount) this.totalPages = this.pageCount;
    const page = Math.min(this.pageCount, Math.max(1, Math.floor(this.currentPage || 1)));
    if (this.currentPage !== page) this.currentPage = page;
  }

  private get pageTokens(): PageToken[] {
    const total = this.pageCount;
    const current = Math.min(total, Math.max(1, Math.floor(this.currentPage || 1)));
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
    if (current >= total - 3) return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
    return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
  }

  private changePage(page: number): void {
    const nextPage = Math.min(this.pageCount, Math.max(1, Math.floor(page)));
    if (nextPage === this.currentPage) return;
    this.currentPage = nextPage;
    this.dispatchEvent(
      new CustomEvent<NxPageChangeDetail>('nx-page-change', {
        detail: { page: nextPage },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <nav aria-label=${this.label}>
        <button
          type="button"
          aria-label=${this.previousLabel}
          ?disabled=${this.currentPage <= 1}
          @click=${() => this.changePage(this.currentPage - 1)}
        >${this.previousLabel}</button>
        <ol>
          ${this.pageTokens.map((token) =>
            token === 'ellipsis'
              ? html`<li class="ellipsis" aria-hidden="true">…</li>`
              : html`
                  <li>
                    <button
                      type="button"
                      aria-label=${`Page ${token}`}
                      aria-current=${token === this.currentPage ? 'page' : nothing}
                      @click=${() => this.changePage(token)}
                    >${token}</button>
                  </li>
                `
          )}
        </ol>
        <button
          type="button"
          aria-label=${this.nextLabel}
          ?disabled=${this.currentPage >= this.pageCount}
          @click=${() => this.changePage(this.currentPage + 1)}
        >${this.nextLabel}</button>
      </nav>
    `;
  }
}

export default NxPagination;
