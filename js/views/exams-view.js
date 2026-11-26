import { sharedSheet } from '../utils/sharedStyles.js';
import { validateExam } from '../utils/validators.js';
import { notify } from '../utils/notify.js';
import { confirmAction } from '../utils/dialogs.js';
import {
  getExams, getExamById, createExam, updateExam, deleteExam, findDuplicateCode
} from '../services/examService.js';

const FIELD_IDS = ['codigo', 'titulo', 'minutos', 'porcentajeAprobacion', 'descripcion'];

const COLUMNS = [
  { key: 'codigo', label: 'Código' },
  { key: 'titulo', label: 'Título' },
  { key: 'minutos', label: 'Minutos' },
  { key: 'porcentajeAprobacion', label: 'Aprobación (%)' },
  { key: 'numPreguntas', label: 'Preguntas' }
];

const field = (id, label, input, hint = '') => `
  <div class="field">
    <label for="${id}">${label}</label>
    ${input}
    ${hint}
    <p class="error" id="${id}-error"></p>
  </div>`;

class ExamsView extends HTMLElement {
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

      <h1>Gestión de exámenes</h1>
      <div class="layout">
        <section class="card" aria-labelledby="form-title">
          <h2 id="form-title">Nuevo examen</h2>
          <form id="form" novalidate>
            ${field('codigo', 'Código',
              '<input id="codigo" autocomplete="off" aria-describedby="codigo-error">')}
            ${field('titulo', 'Título',
              '<input id="titulo" autocomplete="off" aria-describedby="titulo-error">')}
            ${field('minutos', 'Tiempo (minutos)',
              '<input id="minutos" type="number" min="1" max="300" inputmode="numeric" aria-describedby="minutos-error">')}
            ${field('porcentajeAprobacion', 'Porcentaje de aprobación (%)',
              '<input id="porcentajeAprobacion" type="number" min="1" max="100" inputmode="numeric" aria-describedby="porcentajeAprobacion-error">')}
            ${field('descripcion', 'Descripción',
              '<textarea id="descripcion" rows="3" aria-describedby="descripcion-error"></textarea>')}

            <div class="actions">
              <button class="btn" type="submit" id="submit">Guardar</button>
              <button class="btn btn-secondary" type="button" id="cancel" hidden>Cancelar</button>
            </div>
          </form>
        </section>

        <section class="card" aria-labelledby="table-title">
          <h2 id="table-title">Exámenes registrados</h2>
          <data-table id="table"></data-table>
        </section>
      </div>`;

    this.form = this.$('form');
    this.table = this.$('table');
    this.table.columns = COLUMNS;
    this.table.labelKey = 'titulo';
    this.table.emptyMessage = 'Aún no hay exámenes. Crea el primero con el formulario.';

    this.form.addEventListener('submit', this.onSubmit);
    this.$('cancel').addEventListener('click', this.resetForm);
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

    this.table.rows = getExams().map(exam => ({
      ...exam,
      numPreguntas: exam.preguntas.length
    }));
  }

  readForm() {
    const text = id => this.$(id).value.trim();
    return {
      codigo: text('codigo').toUpperCase(),
      titulo: text('titulo'),
      minutos: text('minutos'),
      porcentajeAprobacion: text('porcentajeAprobacion'),
      descripcion: text('descripcion')
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
    this.$('form-title').textContent = editing ? 'Editar examen' : 'Nuevo examen';
    this.$('submit').textContent = editing ? 'Actualizar' : 'Guardar';
    this.$('cancel').hidden = !editing;
  }

  resetForm() {
    this.form.reset();
    this.editingId = null;
    this.showErrors({});
    this.setMode(false);
  }

  onSubmit(event) {
    event.preventDefault();
    const data = this.readForm();

    const errors = validateExam(data);
    const duplicates = findDuplicateCode(data.codigo, this.editingId);
    for (const key in duplicates) if (!errors[key]) errors[key] = duplicates[key];

    this.showErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      if (this.editingId) {
        updateExam(this.editingId, data);
        notify('Examen actualizado correctamente.');
      } else {
        createExam(data);
        notify('Examen creado correctamente.');
      }
      this.resetForm();
      this.refreshTable();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  onEdit(event) {
    const exam = getExamById(event.detail.id);
    if (!exam) return;

    this.editingId = exam.id;
    this.$('codigo').value = exam.codigo;
    this.$('titulo').value = exam.titulo;
    this.$('minutos').value = exam.minutos;
    this.$('porcentajeAprobacion').value = exam.porcentajeAprobacion;
    this.$('descripcion').value = exam.descripcion;

    this.showErrors({});
    this.setMode(true);
    this.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.$('codigo').focus();
  }

  async onDelete(event) {
    const exam = getExamById(event.detail.id);
    if (!exam) return;

    const confirmed = await confirmAction({
      title: 'Eliminar examen',
      message: `¿Seguro que deseas eliminar "${exam.titulo}" y sus ${exam.preguntas.length} preguntas? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar'
    });
    if (!confirmed) return;

    deleteExam(exam.id);
    if (this.editingId === exam.id) this.resetForm();
    this.refreshTable();
    notify('Examen eliminado.');
  }
}

customElements.define('exams-view', ExamsView);