import { createSignal, render, Portal, Show } from 'grainlet';

function Popup(props) {
  return (
    <div class="popup" style={{ top: '40px', left: '20px' }}>
      {props.label}
    </div>
  );
}

function Demo() {
  const [openClipped, setOpenClipped] = createSignal(false);
  const [openPortal, setOpenPortal] = createSignal(false);
  const [openCustom, setOpenCustom] = createSignal(false);

  return (
    <div class="demo">
      <h1>Portal</h1>
      <p class="lead">
        Popups inside an overflow-hidden parent get clipped. The same markup
        inside <code>&lt;Portal&gt;</code> mounts on <code>document.body</code>{' '}
        (or a custom node) and stays visible.
      </p>

      <section class="panel">
        <h2>Without Portal (clipped)</h2>
        <div class="clip-box">
          <button type="button" onClick={() => setOpenClipped((v) => !v)}>
            Toggle clipped popup
          </button>
          <Show when={openClipped}>
            <Popup label="I am clipped by overflow: hidden" />
          </Show>
        </div>
      </section>

      <section class="panel">
        <h2>With Portal (escapes)</h2>
        <div class="clip-box">
          <button type="button" onClick={() => setOpenPortal((v) => !v)}>
            Toggle portaled popup
          </button>
          <Show when={openPortal}>
            <Portal>
              <Popup label="I escape via Portal → document.body" />
            </Portal>
          </Show>
        </div>
      </section>

      <section class="panel">
        <h2>
          Custom mount <code>#portal-root</code>
        </h2>
        <button type="button" onClick={() => setOpenCustom((v) => !v)}>
          Toggle custom-mount content
        </button>
        <Show when={openCustom}>
          <Portal mount={document.querySelector('#portal-root')}>
            <p class="custom-mount">Rendered into #portal-root</p>
          </Portal>
        </Show>
      </section>
    </div>
  );
}

render(Demo, document.getElementById('app'));
