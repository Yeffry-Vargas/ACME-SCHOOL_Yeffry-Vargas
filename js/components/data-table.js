import { sharedSheet } from '../utils/sharedStyles.js';
import { escapeHTML } from '../utils/helpers.js';

class DataTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sharedSheet];
    this._columns = [];
    this._rows = [];
    this.labelKey = 'nombre';
    this.emptyMessage = 'No hay registros todavía.';

    this.shadowRoot.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      this.dispatchEvent(new CustomEvent(`row-${button.dataset.action}`, {
        detail: { id: button.dataset.id }
      }));
    });
  }

  set columns(value) { this._columns = value; this.render(); }
  set rows(value) { this._rows = value; this.render(); }

  render() {
    const head = this._columns
      .map(col => `<th scope="col">${escapeHTML(col.label)}</th>`).join('');

    const body = this._rows.length
      ? this._rows.map(row => {
          const label = escapeHTML(row[this.labelKey]);
          const cells = this._columns
            .map(col => `<td>${escapeHTML(row[col.key])}</td>`).join('');
          return `
            <tr>
              ${cells}
              <td class="row-actions">
                <button class="btn btn-secondary btn-sm" type="button"
                        data-action="edit" data-id="${escapeHTML(row.id)}"
                        aria-label="Editar ${label}">Editar</button>
                <button class="btn btn-danger btn-sm" type="button"
                        data-action="delete" data-id="${escapeHTML(row.id)}"
                        aria-label="Eliminar ${label}">Eliminar</button>
              </td>
            </tr>`;
        }).join('')
      : `<tr><td class="empty" colspan="${this._columns.length + 1}">
           ${escapeHTML(this.emptyMessage)}</td></tr>`;

    this.shadowRoot.innerHTML = `
      <style>
        .wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.7rem 0.8rem; text-align: left; border-bottom: 1px solid var(--color-border); }
        th { font-size: 0.8rem; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.03em; }
        tbody tr { transition: background var(--transition); }
        tbody tr:hover { background: var(--color-bg); }
        .row-actions { white-space: nowrap; }
        .row-actions .btn + .btn { margin-left: 0.4rem; }
        .empty { text-align: center; color: var(--color-muted); padding: var(--space-4); }
      </style>
      <div class="wrap">
        <table>
          <thead><tr>${head}<th scope="col">Acciones</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
  }
}

customElements.define('data-table', DataTable);