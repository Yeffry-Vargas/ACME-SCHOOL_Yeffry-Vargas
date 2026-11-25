import { sharedSheet } from '../utils/sharedStyles.js';

class AppModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sharedSheet];
  }

  ask({ title, message, confirmText = 'Confirmar' }) {
    return new Promise(resolve => {
      this.shadowRoot.innerHTML = `
        <style>
          dialog {
            border: 0; border-radius: var(--radius); padding: var(--space-3);
            max-width: 420px; width: calc(100% - 2rem);
            box-shadow: var(--shadow); animation: pop 0.2s ease;
          }
          dialog::backdrop { background: rgba(17, 24, 39, 0.55); }
          p { margin: 0 0 var(--space-3); }
          @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        </style>
        <dialog aria-labelledby="title" aria-describedby="message">
          <h2 id="title"></h2>
          <p id="message"></p>
          <div class="actions">
            <button class="btn btn-secondary" type="button" data-value="cancel">Cancelar</button>
            <button class="btn btn-danger" type="button" data-value="ok" id="ok"></button>
          </div>
        </dialog>`;

      const dialog = this.shadowRoot.querySelector('dialog');
      this.shadowRoot.getElementById('title').textContent = title;
      this.shadowRoot.getElementById('message').textContent = message;
      this.shadowRoot.getElementById('ok').textContent = confirmText;

      dialog.addEventListener('click', event => {
        const button = event.target.closest('button[data-value]');
        if (button) dialog.close(button.dataset.value);
      });

      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'));

      dialog.showModal();
    });
  }
}

customElements.define('app-modal', AppModal);