export type IconName = 'check' | 'info' | 'warning' | 'spark' | 'moon';

export const iconMap: Record<IconName, string> = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 9.2 16.7 19 6.9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10v6M12 7h.01" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg>',
  warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5 4 18.5h16L12 4.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v4M12 16h.01" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 14.7 8.3 21 11l-6.3 2.7L12 20l-2.7-6.3L3 11l6.3-2.7L12 2Z" fill="currentColor"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.4A8.5 8.5 0 0 1 9.6 4a8.5 8.5 0 1 0 10.4 10.4Z" fill="currentColor"/></svg>'
};

export function getIcon(name: IconName): string {
  return iconMap[name];
}
