import type { Component, ComponentInstance } from './component.js';

export interface SSRContext {
  url?: string | null;
  pending?: Set<Promise<unknown>>;
  resourceCache?: Map<string, { status: string; value?: unknown; error?: unknown }>;
  [key: string]: unknown;
}

export declare function renderToString(
  Component: Component,
  props?: Record<string, unknown>,
  options?: { url?: string }
): string;

/**
 * Await Suspense-tracked promises (`lazy`, `createResource`), then return HTML
 * with resolved content (not the fallback).
 */
export declare function renderToStringAsync(
  Component: Component,
  props?: Record<string, unknown>,
  options?: { url?: string; maxPasses?: number }
): Promise<string>;

export declare function wrapHtmlDocument(
  body: string,
  options?: { title?: string; head?: string; scripts?: string[] }
): string;

export declare function hydrate(
  Component: Component,
  container: Element,
  props?: Record<string, unknown>
): ComponentInstance;

export declare function runWithSSR<T>(
  fn: () => T | Promise<T>,
  context?: SSRContext
): T | Promise<T>;

export declare function getSSRContext(): SSRContext | null;

export declare function isServer(): boolean;

export declare function escapeHtml(value: unknown): string;

export declare function serializeVnode(
  vdom: unknown,
  renderComponent: (type: Component, props: Record<string, unknown>) => unknown
): string;
