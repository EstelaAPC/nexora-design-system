export type IconName =
  | 'check'
  | 'close'
  | 'plus'
  | 'minus'
  | 'chevron-down'
  | 'chevron-up'
  | 'arrow-left'
  | 'arrow-right'
  | 'info'
  | 'warning'
  | 'search';

export interface IconDefinition {
  viewBox: string;
  paths: readonly string[];
}

export { check } from './icons/check';
export { close } from './icons/close';
export { plus } from './icons/plus';
export { minus } from './icons/minus';
export { chevronDown } from './icons/chevron-down';
export { chevronUp } from './icons/chevron-up';
export { arrowLeft } from './icons/arrow-left';
export { arrowRight } from './icons/arrow-right';
export { info } from './icons/info';
export { warning } from './icons/warning';
export { search } from './icons/search';
