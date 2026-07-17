import { useState, useCallback } from 'react';
import { buildData, resetId, swapManyPairs } from '../../shared/data.js';
import { BUTTONS } from '../../shared/contract.js';

export function App() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);

  const run = useCallback(() => {
    resetId();
    setData(buildData(1000));
  }, []);
  const runLots = useCallback(() => {
    resetId();
    setData(buildData(10000));
  }, []);
  const add = useCallback(
    () => setData((d) => d.concat(buildData(1000))),
    []
  );
  const update = useCallback(
    () =>
      setData((d) =>
        d.map((row, i) =>
          i % 10 === 0 ? { id: row.id, label: row.label + ' !!!' } : row
        )
      ),
    []
  );
  const clear = useCallback(() => {
    setData([]);
    setSelected(null);
  }, []);
  const swapRows = useCallback(
    () =>
      setData((d) => {
        if (d.length < 999) return d;
        const next = d.slice();
        const tmp = next[1];
        next[1] = next[998];
        next[998] = tmp;
        return next;
      }),
    []
  );
  const swapMany = useCallback(
    () => setData((d) => swapManyPairs(d, 100)),
    []
  );
  const remove = useCallback(
    (id) => setData((d) => d.filter((row) => row.id !== id)),
    []
  );

  const handlers = {
    run,
    runlots: runLots,
    add,
    update,
    clear,
    swaprows: swapRows,
    swapmany: swapMany,
  };

  return (
    <div className="container">
      <div className="jumbotron">
        <div className="row">
          <div className="col-md-6">
            <h1>React</h1>
          </div>
          <div className="col-md-6">
            <div className="row">
              {BUTTONS.map((btn) => (
                <div className="col-sm-6 smallpad" key={btn.id}>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    id={btn.id}
                    onClick={() => handlers[btn.id]()}
                  >
                    {btn.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <table className="table table-hover table-striped test-data">
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className={selected === row.id ? 'danger' : ''}
              data-id={String(row.id)}
            >
              <td className="col-md-1">{row.id}</td>
              <td className="col-md-4">
                <a onClick={() => setSelected(row.id)}>{row.label}</a>
              </td>
              <td className="col-md-1">
                <a onClick={() => remove(row.id)}>
                  <span className="glyphicon glyphicon-remove" aria-hidden="true">
                    ×
                  </span>
                </a>
              </td>
              <td className="col-md-6" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
