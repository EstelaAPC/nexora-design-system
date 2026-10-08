import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { IconDefinition, IconName } from '@nexora/icons';

type IconLoader = () => Promise<IconDefinition>;

const iconLoaders = new Map<IconName, IconLoader>([
  ['check', () => import('@nexora/icons/check').then(({ check }) => check)],
  ['close', () => import('@nexora/icons/close').then(({ close }) => close)],
  ['plus', () => import('@nexora/icons/plus').then(({ plus }) => plus)],
  ['minus', () => import('@nexora/icons/minus').then(({ minus }) => minus)],
  ['chevron-down', () => import('@nexora/icons/chevron-down').then(({ chevronDown }) => chevronDown)],
  ['chevron-up', () => import('@nexora/icons/chevron-up').then(({ chevronUp }) => chevronUp)],
  ['arrow-left', () => import('@nexora/icons/arrow-left').then(({ arrowLeft }) => arrowLeft)],
  ['arrow-right', () => import('@nexora/icons/arrow-right').then(({ arrowRight }) => arrowRight)],
  ['info', () => import('@nexora/icons/info').then(({ info }) => info)],
  ['warning', () => import('@nexora/icons/warning').then(({ warning }) => warning)],
  ['search', () => import('@nexora/icons/search').then(({ search }) => search)]
]);

let nextIconId = 0;

@customElement('nx-icon')
export class NxIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      width: var(--nx-icon-size, var(--nx-icon-render-size, var(--nx-icon-size-md)));
      height: var(--nx-icon-size, var(--nx-icon-render-size, var(--nx-icon-size-md)));
      flex: none;
      color: inherit;
      vertical-align: middle;
    }

    :host([size='sm']) {
      --nx-icon-render-size: var(--nx-icon-size-sm);
    }

    :host([size='md']) {
      --nx-icon-render-size: var(--nx-icon-size-md);
    }

    :host([size='lg']) {
      --nx-icon-render-size: var(--nx-icon-size-lg);
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `;

  private readonly titleId = `nx-icon-title-${++nextIconId}`;
  private loadSequence = 0;
  private requestedName: IconName | '' | null = null;

  @property({ type: String, reflect: true }) name: IconName | '' = '';
  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';
  @property({ type: String, attribute: 'aria-label' }) ariaLabel = '';
  @property({ type: String }) title = '';
  @property({
    attribute: 'aria-hidden',
    converter: {
      fromAttribute: (value: string | null): boolean | undefined =>
        value === null ? undefined : value !== 'false',
      toAttribute: (value: boolean | undefined): string | null =>
        value === undefined ? null : String(value)
    }
  })
  ariaHiddenValue?: boolean;
  @state() private icon?: IconDefinition;

  protected willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('name')) this.loadIcon();
  }

  private loadIcon(): void {
    if (this.requestedName === this.name) return;
    this.requestedName = this.name;
    const sequence = ++this.loadSequence;
    this.icon = undefined;
    if (!this.name) return;
    const load = iconLoaders.get(this.name);
    if (!load) return;

    load().then((icon) => {
      if (sequence === this.loadSequence && this.name) this.icon = icon;
    });
  }

  render() {
    if (!this.icon) return nothing;
    const hidden = this.ariaHiddenValue ?? !(this.ariaLabel || this.title);
    const accessibleLabel = this.ariaLabel || nothing;
    const title = this.title
      ? html`<title id=${this.titleId}>${this.title}</title>`
      : nothing;

    return html`
      <svg
        viewBox=${this.icon.viewBox}
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
        aria-hidden=${hidden ? 'true' : nothing}
        role=${hidden ? nothing : 'img'}
        aria-label=${accessibleLabel}
        aria-labelledby=${!hidden && !this.ariaLabel && this.title ? this.titleId : nothing}
      >
        ${title}
        ${this.icon.paths.map((path) => html`<path d=${path}></path>`)}
      </svg>
    `;
  }
}

export default NxIcon;
