import type { Accessor } from './types/signals.js';

export type { Accessor };

/** Ref callback or signal setter; cleared with `null` on unmount. */
export type Ref<T = Element> = (element: T | null) => void;

type MaybeAccessor<T> = T | Accessor<T>;

type DOMEventHandler<E extends Event = Event> = (event: E) => void;

interface GrainDOMAttributes {
  children?: JSX.Element;
  class?: MaybeAccessor<string | undefined>;
  className?: MaybeAccessor<string | undefined>;
  id?: MaybeAccessor<string | undefined>;
  style?: MaybeAccessor<string | Record<string, string | number> | undefined>;
  title?: MaybeAccessor<string | undefined>;
  hidden?: MaybeAccessor<boolean | undefined>;
  tabIndex?: MaybeAccessor<number | undefined>;
  role?: MaybeAccessor<string | undefined>;
  // Common events (DOM + React-style casing)
  onClick?: DOMEventHandler<MouseEvent>;
  onclick?: DOMEventHandler<MouseEvent>;
  onInput?: DOMEventHandler<InputEvent>;
  oninput?: DOMEventHandler<InputEvent>;
  onChange?: DOMEventHandler<Event>;
  onchange?: DOMEventHandler<Event>;
  onSubmit?: DOMEventHandler<SubmitEvent>;
  onsubmit?: DOMEventHandler<SubmitEvent>;
  onKeyDown?: DOMEventHandler<KeyboardEvent>;
  onkeydown?: DOMEventHandler<KeyboardEvent>;
  onFocus?: DOMEventHandler<FocusEvent>;
  onfocus?: DOMEventHandler<FocusEvent>;
  onBlur?: DOMEventHandler<FocusEvent>;
  onblur?: DOMEventHandler<FocusEvent>;
  // Allow arbitrary attrs / data-* / aria-* / more events
  [key: string]: unknown;
}

type IntrinsicHTML<K extends keyof HTMLElementTagNameMap> = GrainDOMAttributes & {
  ref?: Ref<HTMLElementTagNameMap[K]>;
};

type IntrinsicSVG<K extends keyof SVGElementTagNameMap> = GrainDOMAttributes & {
  ref?: Ref<SVGElementTagNameMap[K]>;
};

export namespace JSX {
  // Separate array interface avoids circular `Element` alias.
  interface ElementArray extends Array<Element> {}

  type Element =
    | string
    | number
    | boolean
    | null
    | undefined
    | Node
    | ElementArray
    | Accessor<unknown>
    | { type: unknown; props?: unknown; children?: unknown; key?: unknown };

  interface ElementChildrenAttribute {
    children: {};
  }

  type IntrinsicElements = {
    [K in keyof HTMLElementTagNameMap]: IntrinsicHTML<K>;
  } & {
    [K in keyof SVGElementTagNameMap]: IntrinsicSVG<K>;
  };
}

export declare function jsx(
  type: unknown,
  props?: Record<string, unknown> | null,
  key?: string | number | null
): JSX.Element;

export declare function jsxs(
  type: unknown,
  props?: Record<string, unknown> | null,
  key?: string | number | null
): JSX.Element;

export declare function Fragment(props: {
  children?: JSX.Element;
}): JSX.Element;
