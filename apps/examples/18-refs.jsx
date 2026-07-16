import { createSignal, render, Show } from 'grainlet';

function FocusableInput(props) {
  return (
    <input
      type="text"
      class="field"
      placeholder="Forwarded ref"
      ref={props.ref}
    />
  );
}

function Demo() {
  let box;
  const [paraEl, setParaEl] = createSignal(null);
  const [inputEl, setInputEl] = createSignal(null);
  const [show, setShow] = createSignal(true);
  const [status, setStatus] = createSignal('Ready');

  return (
    <div class="demo">
      <h1>Refs</h1>
      <p class="lead">
        Solid-compatible <code>ref</code>: variable assignment (via grainJsx),
        signal setters, callbacks, and <code>props.ref</code> forwarding.
      </p>

      <section class="panel">
        <h2>Variable ref + focus</h2>
        <div class="box" tabIndex={0} ref={box}>
          Click “Focus box” to focus this div
        </div>
        <button
          type="button"
          onClick={() => {
            box?.focus();
            setStatus('Focused the box via let ref');
          }}
        >
          Focus box
        </button>
      </section>

      <section class="panel">
        <h2>Signal setter + Show</h2>
        <button type="button" onClick={() => setShow((v) => !v)}>
          Toggle paragraph
        </button>
        <Show when={show()}>
          <p class="ref-p" ref={setParaEl}>
            Mounted — signal ref holds this node
          </p>
        </Show>
        <p class="meta">
          Signal ref:{' '}
          {paraEl() ? paraEl().textContent : '(null — unmounted)'}
        </p>
      </section>

      <section class="panel">
        <h2>Forwarded ref</h2>
        <FocusableInput ref={setInputEl} />
        <button
          type="button"
          onClick={() => {
            inputEl()?.focus();
            setStatus('Focused forwarded input');
          }}
        >
          Focus forwarded input
        </button>
      </section>

      <p class="status">{status()}</p>
    </div>
  );
}

render(Demo, document.getElementById('app'));
