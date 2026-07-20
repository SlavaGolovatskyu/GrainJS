import { createSignal, For } from 'grainlet';
import { buildData, resetId, swapManyPairs } from '../../shared/data.js';

export function App() {
  const [data, setData] = createSignal([]);
  const [selected, setSelected] = createSignal(null);

  const run = () => {
    resetId();
    setData(buildData(1000));
  };
  const runLots = () => {
    resetId();
    setData(buildData(10000));
  };
  const add = () => setData((d) => d.concat(buildData(1000)));
  const update = () =>
    setData((d) =>
      d.map((row, i) =>
        i % 10 === 0 ? { id: row.id, label: row.label + ' !!!' } : row
      )
    );
  const clear = () => {
    setData([]);
    setSelected(null);
  };
  const swapRows = () =>
    setData((d) => {
      if (d.length < 999) return d;
      const next = d.slice();
      const tmp = next[1];
      next[1] = next[998];
      next[998] = tmp;
      return next;
    });
  const swapMany = () => setData((d) => swapManyPairs(d, 100));
  const remove = (id) => setData((d) => d.filter((row) => row.id !== id));

  return (
    <div class="container">
      <div class="jumbotron">
        <div class="row">
          <div class="col-md-6">
            <h1>Grainlet</h1>
          </div>
          <div class="col-md-6">
            <div class="row">
              <div class="col-sm-6 smallpad">
                <button type="button" class="btn btn-primary btn-block" id="run" onclick={run}>
                  Create 1,000 rows
                </button>
              </div>
              <div class="col-sm-6 smallpad">
                <button
                  type="button"
                  class="btn btn-primary btn-block"
                  id="runlots"
                  onclick={runLots}
                >
                  Create 10,000 rows
                </button>
              </div>
              <div class="col-sm-6 smallpad">
                <button type="button" class="btn btn-primary btn-block" id="add" onclick={add}>
                  Append 1,000 rows
                </button>
              </div>
              <div class="col-sm-6 smallpad">
                <button
                  type="button"
                  class="btn btn-primary btn-block"
                  id="update"
                  onclick={update}
                >
                  Update every 10th row
                </button>
              </div>
              <div class="col-sm-6 smallpad">
                <button
                  type="button"
                  class="btn btn-primary btn-block"
                  id="clear"
                  onclick={clear}
                >
                  Clear
                </button>
              </div>
              <div class="col-sm-6 smallpad">
                <button
                  type="button"
                  class="btn btn-primary btn-block"
                  id="swaprows"
                  onclick={swapRows}
                >
                  Swap Rows
                </button>
              </div>
              <div class="col-sm-6 smallpad">
                <button
                  type="button"
                  class="btn btn-primary btn-block"
                  id="swapmany"
                  onclick={swapMany}
                >
                  Swap 100 pairs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <table class="table table-hover table-striped test-data">
        <tbody>
          <For each={data}>
            {(row) => (
              <tr
                class={selected() === row.id ? 'danger' : ''}
                data-id={String(row.id)}
              >
                <td class="col-md-1">{row.id}</td>
                <td class="col-md-4">
                  <a onclick={() => setSelected(row.id)}>{row.label}</a>
                </td>
                <td class="col-md-1">
                  <a onclick={() => remove(row.id)}>
                    <span class="glyphicon glyphicon-remove" aria-hidden="true">
                      ×
                    </span>
                  </a>
                </td>
                <td class="col-md-6" />
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
