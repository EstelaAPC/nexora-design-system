import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

let tabsInstance = 0;

@customElement('nx-tabs')
export class NxTabs extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--nx-color-text-primary);
      font-family: var(--nx-font-family-sans, sans-serif);
    }

    .tablist {
      display: flex;
      gap: var(--nx-spacing-2, 0.5rem);
      border-block-end: 1px solid var(--nx-color-border);
    }

    ::slotted([slot='tab']) {
      min-height: var(--nx-button-height-md);
      padding: var(--nx-spacing-2) var(--nx-spacing-4);
      border: 0;
      border-block-end: 2px solid transparent;
      background: transparent;
      color: var(--nx-color-text-secondary);
      font: inherit;
      cursor: pointer;
    }

    ::slotted([slot='tab'][aria-selected='true']) {
      border-block-end-color: var(--nx-color-primary);
      color: var(--nx-color-primary);
      font-weight: var(--nx-font-weight-semibold);
    }

    ::slotted([slot='tab']:focus-visible) {
      outline: var(--nx-button-focus-width) solid var(--nx-color-focus-ring);
      outline-offset: 2px;
    }

    ::slotted([slot='panel']) {
      padding-block: var(--nx-spacing-4);
    }
  `;

  @property({ type: Number, attribute: 'selected-index' })
  selectedIndex = 0;

  @property({ type: String })
  label = 'Tabs';

  private readonly instanceId = ++tabsInstance;

  render() {
    return html`
      <div class="tablist" role="tablist" aria-label=${this.label}>
        <slot name="tab" @slotchange=${this.syncTabs} @click=${this.handleClick} @keydown=${this.handleKeydown}></slot>
      </div>
      <slot name="panel" @slotchange=${this.syncTabs}></slot>
    `;
  }

  protected willUpdate(): void {
    const count = this.tabs.length;
    if (count && this.selectedIndex >= count) this.selectedIndex = count - 1;
    if (this.selectedIndex < 0) this.selectedIndex = 0;
  }

  protected updated(): void {
    this.syncTabs();
  }

  private get tabs(): HTMLElement[] {
    return Array.from(this.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.tagName === 'BUTTON' && child.slot === 'tab'
    );
  }

  private get panels(): HTMLElement[] {
    return Array.from(this.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.slot === 'panel'
    );
  }

  private syncTabs = (): void => {
    const tabs = this.tabs;
    const panels = this.panels;

    tabs.forEach((tab, index) => {
      const panel = panels[index];
      tab.id ||= `nx-tabs-${this.instanceId}-tab-${index}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(index === this.selectedIndex));
      tab.setAttribute('aria-controls', panel ? this.ensureId(panel, 'panel', index) : '');
      tab.tabIndex = index === this.selectedIndex ? 0 : -1;
    });

    panels.forEach((panel, index) => {
      panel.id ||= `nx-tabs-${this.instanceId}-panel-${index}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[index]?.id ?? '');
      panel.tabIndex = 0;
      panel.hidden = index !== this.selectedIndex;
    });
  };

  private ensureId(element: HTMLElement, kind: string, index: number): string {
    element.id ||= `nx-tabs-${this.instanceId}-${kind}-${index}`;
    return element.id;
  }

  private activate(index: number): void {
    const tab = this.tabs[index];
    if (!tab || tab.hasAttribute('disabled')) return;
    this.selectedIndex = index;
    this.syncTabs();
    tab.focus();
  }

  private handleClick = (event: Event): void => {
    const tab = event.composedPath().find(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && node.tagName === 'BUTTON' && node.slot === 'tab'
    );
    if (tab) this.activate(this.tabs.indexOf(tab));
  };

  private handleKeydown = (event: KeyboardEvent): void => {
    const tabs = this.tabs;
    const current = event.composedPath().find(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && node.tagName === 'BUTTON' && node.slot === 'tab'
    );
    if (!current || !tabs.length) return;

    let nextIndex = tabs.indexOf(current);
    if (event.key === 'ArrowRight') nextIndex = (nextIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (nextIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    this.activate(nextIndex);
  };
}

export default NxTabs;
