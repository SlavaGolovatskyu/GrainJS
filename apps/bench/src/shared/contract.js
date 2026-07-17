/**
 * Shared markup contract (js-framework-benchmark style):
 * - Buttons: #run #runlots #add #update #clear #swaprows #swapmany
 * - Table.table > tbody > tr[data-id] with .danger when selected
 * - Select: td.col-md-4 a  |  Remove: td.col-md-1 a
 */

export const BUTTONS = [
  { id: 'run', label: 'Create 1,000 rows' },
  { id: 'runlots', label: 'Create 10,000 rows' },
  { id: 'add', label: 'Append 1,000 rows' },
  { id: 'update', label: 'Update every 10th row' },
  { id: 'clear', label: 'Clear' },
  { id: 'swaprows', label: 'Swap Rows' },
  { id: 'swapmany', label: 'Swap 100 pairs' },
];
