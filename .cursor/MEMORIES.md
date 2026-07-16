# Bug scan memory

- **dom.js keyed `patchChildren`**: unkeyed sibling removal used fake `.#x` owner path so component unmount/cleanups never ran (effects/timers leaked). Fix on branch `fix/keyed-reconciler-unmount-leak`. Status: open (PR pending). Recorded: 2026-07-16.
