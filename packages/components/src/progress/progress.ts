import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nx-progress')
export class NxProgress extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans);
    }

    .label {
      display: block;
      margin-block-end: var(--nx-spacing-2);
      font-size: var(--nx-font-size-sm);
    }

    .track {
      overflow: hidden;
      width: 100%;
      height: var(--nx-spacing-2);
      border-radius: var(--nx-radius-pill);
      background: var(--nx-color-surface-subtle);
    }

    .indicator {
      width: var(--progress-value, 100%);
      height: 100%;
      border-radius: inherit;
      background: var(--nx-color-primary);
      transition: width var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    .track[indeterminate] .indicator {
      width: 35%;
      animation: nx-progress-indeterminate var(--nx-motion-duration-spinner)
        var(--nx-motion-easing-standard) infinite alternate;
    }

    @keyframes nx-progress-indeterminate {
      from {
        transform: translateX(0);
      }

      to {
        transform: translateX(185%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .indicator {
        transition: none;
      }

      .track[indeterminate] .indicator {
        width: 100%;
        animation: none;
      }
    }
  `;

  @property({ type: Number })
  value?: number;

  @property({ type: Number })
  max = 100;

  @property({ type: String })
  label = 'Progress';

  private get normalizedMax(): number {
    return Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
  }

  private get normalizedValue(): number | undefined {
    if (this.value === undefined || !Number.isFinite(this.value)) return undefined;
    return Math.min(this.normalizedMax, Math.max(0, this.value));
  }

  render() {
    const max = this.normalizedMax;
    const value = this.normalizedValue;
    const indeterminate = value === undefined;
    const percentage = indeterminate ? 0 : (value / max) * 100;

    return html`
      ${this.label
        ? html`<span class="label" id="progress-label">${this.label}</span>`
        : nothing}
      <div
        class="track"
        role="progressbar"
        aria-label=${this.label || 'Progress'}
        aria-labelledby=${this.label ? 'progress-label' : nothing}
        aria-valuemin="0"
        aria-valuemax=${max}
        aria-valuenow=${value ?? nothing}
        aria-valuetext=${indeterminate ? 'Loading' : nothing}
        ?indeterminate=${indeterminate}
        style=${`--progress-value: ${percentage}%`}
      >
        <div class="indicator"></div>
      </div>
    `;
  }
}

export default NxProgress;
