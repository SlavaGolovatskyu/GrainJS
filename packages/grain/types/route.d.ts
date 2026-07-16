import type { Accessor } from './signals.js';
import type { Component } from './component.js';
import type { JSX } from '../jsx-runtime.js';

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
  basename?: string;
}

export declare function navigate(to: string, options?: NavigateOptions): void;

export declare function setNavigateBasename(basename?: string): void;

export declare function getNavigateBasename(): string;

export interface RouteProps {
  path?: string;
  component?: Component<Record<string, unknown>>;
  children?: JSX.Element;
}

export declare function Route(props: RouteProps): JSX.Element;

export interface RouterProps {
  basename?: string;
  routes?: RouteDescriptor[];
  children?: JSX.Element;
  pageProps?: Record<string, unknown>;
}

export interface RouteDescriptor {
  path?: string;
  component?: Component<Record<string, unknown>>;
  children?: RouteDescriptor[];
}

export declare function Router(props: RouterProps): JSX.Element;

export interface LinkProps {
  href?: string;
  to?: string;
  class?: string;
  className?: string;
  activeClass?: string;
  replace?: boolean;
  state?: unknown;
  target?: string;
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  onclick?: (e: MouseEvent) => void;
  [key: string]: unknown;
}

export declare function Link(props: LinkProps): JSX.Element;

export declare function useLocation(): Accessor<Location>;

export declare function useParams<
  T extends Record<string, string> = Record<string, string>,
>(): Accessor<T>;

export interface PathMatch {
  path: string;
  pathname: string;
  params: Record<string, string>;
}

export declare function matchPath(
  pattern: string,
  pathname: string
): PathMatch | null;

export declare function matchRoutes(
  routes: RouteDescriptor[],
  pathname: string
): (PathMatch & { component?: Component }) | null;
