import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

let tooltipInstance = 0;
const focusableSelector =
  'a[href], area[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

@customElement('nx-tooltip')
export class NxTooltip extends LitElement {
  static styles = css`
    :host {
      position: relative;
      display: inline-block;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans);
    }

    .trigger {
      display: inline-block;
    }

    .tooltip {
      position: absolute;
      z-index: 1;
      inset-block-end: calc(100% + var(--nx-spacing-2));
      inset-inline-start: 50%;
      width: max-content;
      max-width: min(20rem, calc(100vw - 2rem));
      padding: var(--nx-spacing-2) var(--nx-spacing-3);
      transform: translateX(-50%);
      border-radius: var(--nx-radius-sm);
      background: var(--nx-color-text-primary);
      color: var(--nx-color-surface);
      box-shadow: var(--nx-elevation-low);
      font-size: var(--nx-font-size-xs);
      line-height: 1.4;
      transition: opacity var(--nx-motion-duration-fast) var(--nx-motion-easing-standard);
    }

    .tooltip[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .tooltip {
        transition-duration: var(--nx-motion-duration-reduced);
      }
    }
  `;

  @property({ type: String })
  text = '';

  private readonly tooltipId = `nx-tooltip-${++tooltipInstance}`;
  private pointerActive = false;
  private focusActive = false;
  private dismissed = false;
  private describedElements = new Map<HTMLElement, string | null>();

  private get visible(): boolean {
    return Boolean(this.text.trim()) && !this.dismissed && (this.pointerActive || this.focusActive);
  }

  private handlePointerEnter(): void {
    this.pointerActive = true;
    this.requestUpdate();
  }

  private handlePointerLeave(): void {
    this.pointerActive = false;
    this.resetDismissalWhenInactive();
  }

  private handleFocusIn(): void {
    this.focusActive = true;
    this.requestUpdate();
  }

  private handleFocusOut(event: Event & { relatedTarget: Node | null }): void {
    const next = event.relatedTarget;
    if (next instanceof Node && (this.contains(next) || this.shadowRoot?.contains(next))) return;
    this.focusActive = false;
    this.resetDismissalWhenInactive();
  }

  private resetDismissalWhenInactive(): void {
    if (!this.pointerActive && !this.focusActive) this.dismissed = false;
    this.requestUpdate();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.visible) return;
    this.dismissed = true;
    this.requestUpdate();
  }

  private handleSlotChange(): void {
    const slot = this.renderRoot.querySelector('slot');
    const trigger = this.renderRoot.querySelector<HTMLElement>('.trigger');
    if (!slot || !trigger) return;

    const elements = slot.assignedElements({ flatten: true });
    const focusable = elements.flatMap((element) => {
      const root = element as HTMLElement;
      const descendants = [...root.querySelectorAll<HTMLElement>(focusableSelector)];
      return root.matches(focusableSelector) ? [root, ...descendants] : descendants;
    });

    const targets = focusable.length ? focusable : [trigger];
    trigger.tabIndex = focusable.length ? -1 : 0;
    const targetSet = new Set(targets);
    for (const [element, original] of this.describedElements) {
      if (!targetSet.has(element)) this.restoreDescription(element, original);
    }
    this.describedElements = new Map([...this.describedElements].filter(([element]) => targetSet.has(element)));

    for (const element of targets) {
      if (!this.describedElements.has(element)) {
        this.describedElements.set(element, element.getAttribute('aria-describedby'));
      }
      const original = this.describedElements.get(element);
      const ids = (original ?? '').split(/\s+/).filter(Boolean);
      if (!ids.includes(this.tooltipId)) ids.push(this.tooltipId);
      element.setAttribute('aria-describedby', ids.join(' '));
    }
  }

  private restoreDescription(element: HTMLElement, original: string | null): void {
    if (original === null) element.removeAttribute('aria-describedby');
    else element.setAttribute('aria-describedby', original);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const [element, original] of this.describedElements) {
      this.restoreDescription(element, original);
    }
    this.describedElements.clear();
  }

  render() {
    return html`
      <span
        class="trigger"
        @pointerenter=${this.handlePointerEnter}
        @pointerleave=${this.handlePointerLeave}
        @focusin=${this.handleFocusIn}
        @focusout=${this.handleFocusOut}
        @keydown=${this.handleKeyDown}
      ><slot @slotchange=${this.handleSlotChange}></slot></span>
      <span id=${this.tooltipId} class="tooltip" role="tooltip" ?hidden=${!this.visible}>
        ${this.text}
      </span>
    `;
  }
}

export default NxTooltip;
