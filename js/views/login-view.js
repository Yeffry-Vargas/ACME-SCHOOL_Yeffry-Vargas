import { login } from '../services/authService.js';
import { navigate } from '../router.js';
import { sharedSheet } from '../utils/sharedStyles.js';

class LoginView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sharedSheet];
    this.onSubmit = this.onSubmit.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .wrapper { max-width: 420px; margin: var(--space-4) auto; }
        .hint { color: var(--color-muted); font-size: 0.85rem; text-align: center; margin-top: var(--space-2); }
      </style>
      <div class="wrapper">
        <div class="card">
          <h1>Iniciar sesión</h1>
          <div class="alert" id="alert" role="alert" hidden></div>

          <form id="form" novalidate>
            <div class="field">
              <label for="email">Correo electrónico</label>
              <input id="email" type="email" autocomplete="username"
                     aria-describedby="email-error" required>
              <p class="error" id="email-error"></p>
            </div>

            <div class="field">
              <label for="password">Contraseña</label>
              <input id="password" type="password" autocomplete="current-password"
                     aria-describedby="password-error" required>
              <p class="error" id="password-error"></p>
            </div>

            <button class="btn btn-block" type="submit" id="submit">Ingresar</button>
          </form>
        </div>
        <p class="hint">¿Eres estudiante? Ve a <a href="#/">Presentar examen</a>, no necesitas cuenta.</p>
      </div>
    `;

    this.form = this.shadowRoot.getElementById('form');
    this.form.addEventListener('submit', this.onSubmit);
    this.shadowRoot.getElementById('email').focus();
  }

  disconnectedCallback() {
    this.form?.removeEventListener('submit', this.onSubmit);
  }

  setError(fieldId, message) {
    const input = this.shadowRoot.getElementById(fieldId);
    const error = this.shadowRoot.getElementById(`${fieldId}-error`);
    error.textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  validate(email, password) {
    let valid = true;

    if (!email) {
      this.setError('email', 'Escribe tu correo.'); valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.setError('email', 'El correo no tiene un formato válido.'); valid = false;
    } else {
      this.setError('email', '');
    }

    if (!password) {
      this.setError('password', 'Escribe tu contraseña.'); valid = false;
    } else {
      this.setError('password', '');
    }

    return valid;
  }

  async onSubmit(event) {
    event.preventDefault();
    const alert = this.shadowRoot.getElementById('alert');
    const button = this.shadowRoot.getElementById('submit');
    alert.hidden = true;

    const email = this.shadowRoot.getElementById('email').value.trim();
    const password = this.shadowRoot.getElementById('password').value;

    if (!this.validate(email, password)) return;

    button.disabled = true;
    button.textContent = 'Ingresando...';

    const user = await login(email, password);

    if (user) {
      navigate('/users');
    } else {
      alert.textContent = 'Correo o contraseña incorrectos.';
      alert.hidden = false;
      button.disabled = false;
      button.textContent = 'Ingresar';
    }
  }
}

customElements.define('login-view', LoginView);