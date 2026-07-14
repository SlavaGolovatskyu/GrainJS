import { createSignal, createEffect, render } from 'grain';

export function Button(props) {
  const handleClick = props.onClick || props.onclick || (() => {});
  return (
    <button 
      style={`background: ${props.color || '#007bff'};`}
      onclick={handleClick}
    >
      {props.label || 'Click me'}
    </button>
  );
}

export function Card(props) {
  return (
    <div class="card" style={`border-color: ${props.borderColor || '#007bff'};`}>
      <h3>{props.title || 'Card'}</h3>
      <div>{props.children || 'No content'}</div>
    </div>
  );
}

export function Counter(props) {
  const [count, setCount] = createSignal(props.initialValue || 0);
  
  return (
    <div>
      <p style="font-size: 32px; font-weight: bold; color: #007bff;">
        {count()}
      </p>
      <Button label="Increment" color="#28a745" onClick={() => setCount(c => c + 1)} />
      <Button label="Decrement" color="#dc3545" onClick={() => setCount(c => c - 1)} />
      <Button label="Reset" color="#6c757d" onClick={() => setCount(props.initialValue || 0)} />
    </div>
  );
}

export function Timer() {
  const [seconds, setSeconds] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(false);

  createEffect(() => {
    if (!isRunning()) return;

    const intervalId = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  });

  return (
    <div>
      <p style="font-size: 32px; font-weight: bold; color: #28a745;">
        {seconds()}s
      </p>
      <Button 
        label={isRunning() ? 'Pause' : 'Start'} 
        color={isRunning() ? '#ffc107' : '#28a745'}
        onClick={() => setIsRunning(!isRunning())}
      />
    </div>
  );
}

export function Dashboard() {
  const [showCounter, setShowCounter] = createSignal(true);
  const [showTimer, setShowTimer] = createSignal(true);

  return (
    <div>
      <div class="dashboard">
        <Card title="Counter Widget" borderColor="#007bff">
          {showCounter() ? (
            <Counter initialValue={5} />
          ) : (
            <p style="color: #999;">Counter hidden</p>
          )}
          <Button 
            label={showCounter() ? 'Hide Counter' : 'Show Counter'} 
            color="#6c757d"
            onClick={() => setShowCounter(!showCounter())}
          />
        </Card>

        <Card title="Timer Widget" borderColor="#28a745">
          {showTimer() ? (
            <Timer />
          ) : (
            <p style="color: #999;">Timer hidden</p>
          )}
          <Button 
            label={showTimer() ? 'Hide Timer' : 'Show Timer'} 
            color="#6c757d"
            onClick={() => setShowTimer(!showTimer())}
          />
        </Card>

        <Card title="Info" borderColor="#ffc107">
          <p>This dashboard demonstrates:</p>
          <ul>
            <li>Component composition</li>
            <li>Props passing</li>
            <li>Nested components</li>
            <li>Conditional rendering</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

render(Dashboard, document.getElementById('app'));
