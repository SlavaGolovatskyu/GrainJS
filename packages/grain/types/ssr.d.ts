import type { Component, ComponentInstance } from './component.js';

export interface SSRContext {
  url?: string;
  [key: string]: unknown;
}

export declare function renderToString(
  Component: Component,
  props?: Record<string, unknown>,
  options?: { url?: string }
): string;

export declare function wrapHtmlDocument(
  body: string,
  options?: { title?: string; head?: string }
): string;

export declare function hydrate(
  Component: Component,
  container: Element,
  props?: Record<string, unknown>
): ComponentInstance;

export declare function runWithSSR<T>(ctx: SSRContext, fn: () => T): T;

export declare function getSSRContext(): SSRContext | null;
