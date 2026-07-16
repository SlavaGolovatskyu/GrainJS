/** Grainlet reactive primitives */

export type Accessor<T> = () => T;

export type Setter<T> = {
  (value: T): void;
  (updater: (prev: T) => T): void;
};

export type Signal<T> = [get: Accessor<T>, set: Setter<T>];

export declare function createSignal<T>(): Signal<T | undefined>;
export declare function createSignal<T>(initialValue: T): Signal<T>;

export declare function createEffect(fn: () => void): void;

export declare function createMemo<T>(fn: () => T): Accessor<T>;

export declare function onCleanup(fn: () => void): void;

export declare function untrack<T>(fn: () => T): T;

export declare function isServer(): boolean;
