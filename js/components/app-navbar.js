import { isAuthenticated, getSession, logout } from '../services/authService.js';

class AppNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render = this.render.bind(this);
  }

  connectedCallback() {
    window.addEventListener('hashchange', this.render);
    window.addEventListener('auth-changed', this.render);
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.render);
    window.removeEventListener('auth-changed', this.render);
  }

  link(path, label) {
    const active = (location.hash.slice(1) || '/') === path;
    return `<a href="#${path}" ${active ? 'aria-current="page"' : ''}>${label}</a>`;
  }

  render() {
    const logged = isAuthenticated();

    this.shadowRoot.innerHTML = `
      <style>
        nav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-primary);
          color: #fff;
          box-shadow: var(--shadow);
        }
        .brand { font-weight: 700; font-size: 1.2rem; margin-right: auto; }
        .links { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1); }
        a, button {
          color: #fff;
          text-decoration: none;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius);
          border: 0;
          background: transparent;
          font: inherit;
          cursor: pointer;
          transition: background var(--transition);
        }
        a:hover, button:hover { background: var(--color-primary-dark); }
        a[aria-current="page"] { background: var(--color-primary-dark); font-weight: 600; }
        a:focus-visible, button:focus-visible { outline: 3px solid var(--color-accent); }
        .user { font-size: 0.9rem; opacity: 0.9; }
      </style>
      <nav aria-label="Navegación principal">
        <span class="brand">Acme School</span>
        <div class="links">
          ${this.link('/', 'Presentar examen')}
          ${logged ? `
            ${this.link('/users', 'Usuarios')}
            ${this.link('/exams', 'Exámenes')}
            <span class="user"></span>
            <button type="button" id="logout">Salir</button>
          ` : this.link('/login', 'Ingresar')}
        </div>
      </nav>
    `;

    if (logged) {
      this.shadowRoot.querySelector('.user').textContent = getSession().nombre;
      this.shadowRoot.getElementById('logout').addEventListener('click', () => {
        logout();
        location.hash = '/login';
      });
    }
  }
}

customElements.define('app-navbar', AppNavbar);