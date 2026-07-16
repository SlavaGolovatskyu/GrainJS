import type { Accessor } from './signals.js';
import type { Component } from './component.js';
import type { JSX } from '../jsx-runtime.js';

type Child = JSX.Element;
type WhenValue = unknown;

export interface ShowProps<T = WhenValue> {
  when: T | Accessor<T>;
  keyed?: boolean;
  fallback?: Child;
  children?: Child | ((item: NonNullable<T>) => Child);
}

export declare function Show<T = WhenValue>(props: ShowProps<T>): Child;

export interface ForProps<T> {
  each: T[] | Accessor<T[] | undefined | null | false>;
  fallback?: Child;
  children: (item: T, index: Accessor<number>) => Child;
}

export declare function For<T>(props: ForProps<T>): Child;

export interface SwitchProps {
  fallback?: Child;
  children?: Child;
}

export declare function Switch(props: SwitchProps): Child;

export interface MatchProps<T = WhenValue> {
  when: T | Accessor<T>;
  children?: Child | ((item: NonNullable<T>) => Child);
}

export declare function Match<T = WhenValue>(props: MatchProps<T>): Child;

export interface SuspenseProps {
  fallback?: Child;
  children?: Child;
}

export declare function Suspense(props: SuspenseProps): Child;

export interface ErrorBoundaryProps {
  fallback?: Child | ((error: Error, reset: () => void) => Child);
  children?: Child;
}

export declare function ErrorBoundary(props: ErrorBoundaryProps): Child;

export interface PortalProps {
  mount?: Node | Accessor<Node | null | undefined>;
  isSVG?: boolean | Accessor<boolean>;
  children?: Child;
}

export declare function Portal(props: PortalProps): Child;

export interface Context<T> {
  id: symbol;
  defaultValue: T;
  Provider: Component<{ value: T; children?: Child }>;
}

export declare function createContext<T>(): Context<T | undefined>;
export declare function createContext<T>(defaultValue: T): Context<T>;

export declare function useContext<T>(context: Context<T>): T;

export type ResourceState = 'pending' | 'ready' | 'refreshing' | 'errored';

export interface Resource<T> extends Accessor<T | undefined> {
  state: Accessor<ResourceState>;
  error: Accessor<unknown>;
  loading: Accessor<boolean>;
  latest: Accessor<T | undefined>;
  refetch: () => void;
}

export declare function createResource<T, S = true>(
  fetcher: (
    source: S,
    info: { value: T | undefined; refetching: boolean }
  ) => T | Promise<T>
): [Resource<T>];

export declare function createResource<T, S>(
  source: S | Accessor<S | false | null | undefined>,
  fetcher: (
    source: S,
    info: { value: T | undefined; refetching: boolean }
  ) => T | Promise<T>
): [Resource<T>];
