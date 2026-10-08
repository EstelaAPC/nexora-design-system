import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type NxSpinnerSize = 'sm' | 'md' | 'lg';

@customElement('nx-spinner')
export class NxSpinner extends LitElement {
  static styles = css`
    :host {
      --spinner-size: var(--nx-icon-size-md);
      display: inline-flex;
      width: var(--spinner-size);
      height: var(--spinner-size);
      flex: none;
      color: inherit;
      vertical-align: middle;
    }

    :host([size='sm']) {
      --spinner-size: var(--nx-icon-size-sm);
    }

    :host([size='md']) {
      --spinner-size: var(--nx-icon-size-md);
    }

    :host([size='lg']) {
      --spinner-size: var(--nx-icon-size-lg);
    }

    .spinner {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      border: var(--nx-border-width-thin) solid currentColor;
      border-inline-end-color: transparent;
      border-radius: var(--nx-radius-pill);
      animation: nx-spinner-rotate var(--nx-motion-duration-spinner)
        var(--nx-motion-easing-linear) infinite;
    }

    @keyframes nx-spinner-rotate {
      to {
        transform: rotate(1turn);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }
  `;

  @property({ type: String, reflect: true })
  size: NxSpinnerSize = 'md';

  @property({ type: String })
  label = '';

  render() {
    const label = this.label.trim();
    return html`
      <span
        class="spinner"
        role=${label ? 'status' : nothing}
        aria-label=${label || nothing}
        aria-hidden=${label ? nothing : 'true'}
      ></span>
    `;
  }
}

export default NxSpinner;
