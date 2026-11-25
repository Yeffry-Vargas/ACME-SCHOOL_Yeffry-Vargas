class ToastMessage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.show = this.show.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        #box {
          position: fixed; right: var(--space-2); bottom: var(--space-2); z-index: 1000;
          display: flex; flex-direction: column; gap: var(--space-1);
        }
        .toast {
          padding: 0.8rem 1.1rem; border-radius: var(--radius); color: #fff;
          box-shadow: var(--shadow); animation: slide-in 0.3s ease;
        }
        .success { background: var(--color-success); }
        .error { background: var(--color-danger); }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: none; }
        }
      </style>
      <div id="box"></div>`;
    window.addEventListener('show-toast', this.show);
  }

  disconnectedCallback() {
    window.removeEventListener('show-toast', this.show);
  }

  show(event) {
    const { message, type } = event.detail;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status'); // se anuncia en lectores de pantalla
    toast.textContent = message;
    this.shadowRoot.getElementById('box').append(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

customElements.define('toast-message', ToastMessage);