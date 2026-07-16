import type { Accessor } from './signals.js';
import type { JSX } from '../jsx-runtime.js';

export type Component<P = Record<string, unknown>> = (
  props: P
) => JSX.Element;

export type ComponentFactory<P = Record<string, unknown>> = ((
  props?: P
) => ComponentInstance) & {
  $$component?: boolean;
};

export interface ComponentInstance {
  mount(parent: Element, options?: { hydrate?: boolean }): void;
  unmount(): void;
}

export declare function createComponent<P = Record<string, unknown>>(
  fn: Component<P>
): ComponentFactory<P>;

export declare function render(
  Component: Component | ComponentFactory,
  container: Element,
  props?: Record<string, unknown>
): ComponentInstance;

export declare function hydrate(
  Component: Component | ComponentFactory,
  container: Element,
  props?: Record<string, unknown>
): ComponentInstance;

/** Tagged-template HTML helper (legacy). */
export declare function html(
  strings: TemplateStringsArray,
  ...values: unknown[]
): JSX.Element;

/** Classic / low-level JSX factory. */
export declare function jsx(
  type: string | Component,
  props?: Record<string, unknown> | null,
  ...children: unknown[]
): JSX.Element;

export declare function jsxCompiler(source: string): unknown;

export type { Accessor, JSX };
