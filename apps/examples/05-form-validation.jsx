import { createSignal, createMemo, render } from 'grain';

export function Form() {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [submitted, setSubmitted] = createSignal(false);

  // Validation functions
  const emailError = createMemo(() => {
    const value = email();
    if (!value) return 'Email is required';
    if (!value.includes('@')) return 'Email must contain @';
    if (!value.includes('.')) return 'Email must contain a domain';
    return '';
  });

  const passwordError = createMemo(() => {
    const value = password();
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return '';
  });

  const confirmPasswordError = createMemo(() => {
    const value = confirmPassword();
    if (!value) return 'Please confirm your password';
    if (value !== password()) return 'Passwords do not match';
    return '';
  });

  const isFormValid = createMemo(() => {
    return !emailError() && !passwordError() && !confirmPasswordError();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (isFormValid()) {
      console.log('Form submitted:', { email: email(), password: password() });
    }
  };

  return (
    <form onsubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          value={email()} 
          class={submitted() && emailError() ? 'error' : submitted() && !emailError() ? 'valid' : ''}
          oninput={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <div class="error-message">
          {submitted() && emailError() ? emailError() : ''}
        </div>
      </div>

      <div>
        <label>Password:</label>
        <input 
          type="password" 
          value={password()} 
          class={submitted() && passwordError() ? 'error' : submitted() && !passwordError() ? 'valid' : ''}
          oninput={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <div class="error-message">
          {submitted() && passwordError() ? passwordError() : ''}
        </div>
      </div>

      <div>
        <label>Confirm Password:</label>
        <input 
          type="password" 
          value={confirmPassword()} 
          class={submitted() && confirmPasswordError() ? 'error' : submitted() && !confirmPasswordError() ? 'valid' : ''}
          oninput={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
        />
        <div class="error-message">
          {submitted() && confirmPasswordError() ? confirmPasswordError() : ''}
        </div>
      </div>

      <button type="submit" disabled={!isFormValid() && submitted()}>
        Submit
      </button>

      {submitted() && isFormValid() && (
        <div class="success-message">
          Form is valid! Check console for submitted data.
        </div>
      )}
    </form>
  );
}

render(Form, document.getElementById('app'));
