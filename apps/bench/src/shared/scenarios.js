/**
 * Scenarios mirror js-framework-benchmark keyed list ops.
 * Each step is a button id or a row interaction.
 */
export const SCENARIOS = [
  {
    id: 'create1000',
    name: 'Create 1,000 rows',
    setup: ['clear'],
    actions: ['run'],
  },
  {
    id: 'create10000',
    name: 'Create 10,000 rows',
    setup: ['clear'],
    actions: ['runlots'],
  },
  {
    id: 'append1000',
    name: 'Append 1,000 rows',
    setup: ['clear', 'run'],
    actions: ['add'],
  },
  {
    id: 'update',
    name: 'Update every 10th row',
    setup: ['clear', 'run'],
    actions: ['update'],
  },
  {
    id: 'select',
    name: 'Select row',
    setup: ['clear', 'run'],
    actions: [{ type: 'select', index: 0 }],
  },
  {
    id: 'swap',
    name: 'Swap rows',
    setup: ['clear', 'run'],
    actions: ['swaprows'],
  },
  {
    id: 'swapmany',
    name: 'Swap 100 pairs',
    setup: ['clear', 'run'],
    actions: ['swapmany'],
  },
  {
    id: 'remove',
    name: 'Remove row',
    setup: ['clear', 'run'],
    actions: [{ type: 'remove', index: 0 }],
  },
  {
    id: 'clear',
    name: 'Clear rows',
    setup: ['clear', 'run'],
    actions: ['clear'],
  },
];

export const DEFAULT_RUNS = 10;
