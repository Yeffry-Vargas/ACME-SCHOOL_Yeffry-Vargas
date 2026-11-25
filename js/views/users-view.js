import { sharedSheet } from '../utils/sharedStyles.js';
import { validateUser } from '../utils/validators.js';
import { notify } from '../utils/notify.js';
import { confirmAction } from '../utils/dialogs.js';
import {
  getUsers, getUserById, createUser, updateUser, deleteUser, findDuplicates
} from '../services/userService.js';

const FIELD_IDS = ['documento', 'nombre', 'email', 'telefono', 'cargo', 'password'];

const COLUMNS = [
  { key: 'documento', label: 'Identificación' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'cargo', label: 'Cargo' }
];

const field = (id, label, input, hint = '') => `
  <div class="field">
    <label for="${id}">${label}</label>
    ${input}
    ${hint}
    <p class="error" id="${id}-error"></p>
  </div>`;

class UsersView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sharedSheet];
    this.editingId = null;
    this.onSubmit = this.onSubmit.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .layout { display: grid; gap: var(--space-3); grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 900px) {
          .layout { grid-template-columns: 340px minmax(0, 1fr); align-items: start; }
        }
      </style>

      <h1>Gestión de usuarios</h1>
      <div class="layout">
        <section class="card" aria-labelledby="form-title">
          <h2 id="form-title">Nuevo usuario</h2>
          <form id="form" novalidate>
            ${field('documento', 'Número de identificación',
              '<input id="documento" inputmode="numeric" autocomplete="off" aria-describedby="documento-error">')}
            ${field('nombre', 'Nombre completo',
              '<input id="nombre" autocomplete="off" aria-describedby="nombre-error">')}
            ${field('email', 'Correo electrónico',
              '<input id="email" type="email" autocomplete="off" aria-describedby="email-error">')}
            ${field('telefono', 'Teléfono',
              '<input id="telefono" type="tel" inputmode="numeric" autocomplete="off" aria-describedby="telefono-error">')}
            ${field('cargo', 'Cargo', `
              <select id="cargo" aria-describedby="cargo-error">
                <option value="">Selecciona...</option>
                <option>Administrativo</option>
                <option>Docente</option>
              </select>`)}
            ${field('password', 'Contraseña',
              '<input id="password" type="password" autocomplete="new-password" aria-describedby="password-hint password-error">',
              '<p class="hint" id="password-hint">Mínimo 8 caracteres.</p>')}

            <div class="actions">
              <button class="btn" type="submit" id="submit">Guardar</button>
              <button class="btn btn-secondary" type="button" id="cancel" hidden>Cancelar</button>
            </div>
          </form>
        </section>

        <section class="card" aria-labelledby="table-title">
          <h2 id="table-title">Usuarios registrados</h2>
          <data-table id="table"></data-table>
        </section>
      </div>`;

    this.form = this.shadowRoot.getElementById('form');
    this.table = this.shadowRoot.getElementById('table');
    this.table.columns = COLUMNS;
    this.table.labelKey = 'nombre';

    this.form.addEventListener('submit', this.onSubmit);
    this.shadowRoot.getElementById('cancel').addEventListener('click', this.resetForm);
    this.table.addEventListener('row-edit', this.onEdit);
    this.table.addEventListener('row-delete', this.onDelete);

    this.refreshTable();
  }

  disconnectedCallback() {
    this.form?.removeEventListener('submit', this.onSubmit);
    this.table?.removeEventListener('row-edit', this.onEdit);
    this.table?.removeEventListener('row-delete', this.onDelete);
  }

  $(id) { return this.shadowRoot.getElementById(id); }

  refreshTable() {
    this.table.rows = getUsers();
  }

  readForm() {
    const text = id => this.$(id).value.trim();
    return {
      documento: text('documento'),
      nombre: text('nombre'),
      email: text('email'),
      telefono: text('telefono'),
      cargo: this.$('cargo').value,
      password: this.$('password').value
    };
  }

  showErrors(errors) {
    FIELD_IDS.forEach(id => {
      const message = errors[id] ?? '';
      this.$(`${id}-error`).textContent = message;
      if (message) this.$(id).setAttribute('aria-invalid', 'true');
      else this.$(id).removeAttribute('aria-invalid');
    });
    const firstInvalid = FIELD_IDS.find(id => errors[id]);
    if (firstInvalid) this.$(firstInvalid).focus();
  }

  setMode(editing) {
    this.$('form-title').textContent = editing ? 'Editar usuario' : 'Nuevo usuario';
    this.$('submit').textContent = editing ? 'Actualizar' : 'Guardar';
    this.$('cancel').hidden = !editing;
    this.$('password-hint').textContent = editing
      ? 'Déjala en blanco para conservar la actual.'
      : 'Mínimo 8 caracteres.';
  }

  resetForm() {
    this.form.reset();
    this.editingId = null;
    this.showErrors({});
    this.setMode(false);
  }

  async onSubmit(event) {
    event.preventDefault();
    const data = this.readForm();

    const errors = validateUser(data, { requirePassword: !this.editingId });
    const duplicates = findDuplicates(data, this.editingId);
    for (const key in duplicates) if (!errors[key]) errors[key] = duplicates[key];

    this.showErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      if (this.editingId) {
        await updateUser(this.editingId, data);
        notify('Usuario actualizado correctamente.');
      } else {
        await createUser(data);
        notify('Usuario creado correctamente.');
      }
      this.resetForm();
      this.refreshTable();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  onEdit(event) {
    const user = getUserById(event.detail.id);
    if (!user) return;

    this.editingId = user.id;
    this.$('documento').value = user.documento;
    this.$('nombre').value = user.nombre;
    this.$('email').value = user.email;
    this.$('telefono').value = user.telefono;
    this.$('cargo').value = user.cargo;
    this.$('password').value = '';

    this.showErrors({});
    this.setMode(true);
    this.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.$('documento').focus();
  }

  async onDelete(event) {
    const user = getUserById(event.detail.id);
    if (!user) return;

    const confirmed = await confirmAction({
      title: 'Eliminar usuario',
      message: `¿Seguro que deseas eliminar a ${user.nombre}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar'
    });
    if (!confirmed) return;

    try {
      deleteUser(user.id);
      if (this.editingId === user.id) this.resetForm();
      this.refreshTable();
      notify('Usuario eliminado.');
    } catch (error) {
      notify(error.message, 'error');
    }
  }
}

customElements.define('users-view', UsersView);