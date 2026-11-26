import { sharedSheet } from '../utils/sharedStyles.js';
import { validateQuestion } from '../utils/validators.js';
import { escapeHTML } from '../utils/helpers.js';
import { notify } from '../utils/notify.js';
import { confirmAction } from '../utils/dialogs.js';
import { navigate } from '../router.js';
import {
  getExamById, addQuestion, updateQuestion, deleteQuestion
} from '../services/examService.js';

const MIN_ANSWERS = 2;
const MAX_ANSWERS = 6;

const emptyAnswers = () =>
  Array.from({ length: 4 }, () => ({ texto: '', correcta: false }));

const answerRow = (index, answer) => `
  <div class="answer-row">
    <input type="radio" name="correct" value="${index}" ${answer.correcta ? 'checked' : ''}
           aria-label="Marcar la respuesta ${index + 1} como correcta">
    <input type="text" class="answer-text" value="${escapeHTML(answer.texto)}"
           autocomplete="off" aria-label="Texto de la respuesta ${index + 1}">
    <button type="button" class="btn btn-secondary btn-sm" data-remove="${index}"
            aria-label="Quitar la respuesta ${index + 1}">✕</button>
  </div>`;

class QuestionsEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sharedSheet];
    this.examId = null;
    this.editingId = null;
    this.onSubmit = this.onSubmit.bind(this);
    this.onAnswersClick = this.onAnswersClick.bind(this);
    this.onAddAnswer = this.onAddAnswer.bind(this);
    this.onListClick = this.onListClick.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  connectedCallback() {

    const params = new URLSearchParams(location.hash.split('?')[1] ?? '');
    this.examId = params.get('id');

    if (!getExamById(this.examId)) {
      notify('El examen no existe.', 'error');
      navigate('/exams');
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        .back { display: inline-block; margin-bottom: var(--space-2); color: var(--color-primary); }
        .layout { display: grid; gap: var(--space-3); grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 900px) {
          .layout { grid-template-columns: 420px minmax(0, 1fr); align-items: start; }
        }
        fieldset { border: 0; padding: 0; margin: 0 0 var(--space-2); }
        legend { font-weight: 600; margin-bottom: 0.3rem; padding: 0; }
        .answer-row { display: flex; align-items: center; gap: var(--space-1); margin-bottom: var(--space-1); }
        .answer-row input[type="radio"] { width: auto; flex: none; transform: scale(1.3); accent-color: var(--color-primary); }
        .answer-row .btn { flex: none; }
        .q-list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-2); }
        .q { border: 1px solid var(--color-border); border-radius: var(--radius); padding: var(--space-2); }
        .q h3 { margin: 0 0 var(--space-1); font-size: 1rem; }
        .q ul { margin: 0 0 var(--space-2); padding-left: 1.2rem; }
        .correct { color: var(--color-success); font-weight: 600; }
        .empty { text-align: center; color: var(--color-muted); padding: var(--space-3); }
      </style>

      <a class="back" href="#/exams">← Volver a exámenes</a>
      <h1 id="exam-title"></h1>
      <p class="hint" id="exam-meta"></p>

      <div class="layout">
        <section class="card" aria-labelledby="form-title">
          <h2 id="form-title">Nueva pregunta</h2>
          <form id="form" novalidate>
            <div class="field">
              <label for="enunciado">Enunciado</label>
              <textarea id="enunciado" rows="3" aria-describedby="enunciado-error"></textarea>
              <p class="error" id="enunciado-error"></p>
            </div>

            <fieldset aria-describedby="respuestas-error">
              <legend>Respuestas (marca la correcta)</legend>
              <div id="answers"></div>
              <p class="error" id="respuestas-error" role="alert"></p>
              <button type="button" class="btn btn-secondary btn-sm" id="add-answer">+ Agregar respuesta</button>
            </fieldset>

            <div class="actions">
              <button class="btn" type="submit" id="submit">Guardar pregunta</button>
              <button class="btn btn-secondary" type="button" id="cancel" hidden>Cancelar</button>
            </div>
          </form>
        </section>

        <section class="card" aria-labelledby="list-title">
          <h2 id="list-title">Preguntas del examen</h2>
          <ol class="q-list" id="list"></ol>
        </section>
      </div>`;

    this.form = this.$('form');
    this.form.addEventListener('submit', this.onSubmit);
    this.$('answers').addEventListener('click', this.onAnswersClick);
    this.$('add-answer').addEventListener('click', this.onAddAnswer);
    this.$('list').addEventListener('click', this.onListClick);
    this.$('cancel').addEventListener('click', this.resetForm);

    this.renderAnswers(emptyAnswers());
    this.renderList();
  }

  disconnectedCallback() {
    this.form?.removeEventListener('submit', this.onSubmit);
  }

  $(id) { return this.shadowRoot.getElementById(id); }

  // ---------- Respuestas del formulario ----------
  renderAnswers(answers) {
    this.$('answers').innerHTML = answers.map((a, i) => answerRow(i, a)).join('');
  }

  // Lee lo que hay escrito ahi mismo en las filas de respuestas
  readAnswers() {
    const rows = [...this.shadowRoot.querySelectorAll('.answer-row')];
    return rows.map(row => ({
      texto: row.querySelector('.answer-text').value.trim(),
      correcta: row.querySelector('input[type="radio"]').checked
    }));
  }

  onAddAnswer() {
    const answers = this.readAnswers();
    if (answers.length >= MAX_ANSWERS) {
      this.showErrors({ respuestas: `Máximo ${MAX_ANSWERS} respuestas por pregunta.` });
      return;
    }
    answers.push({ texto: '', correcta: false });
    this.renderAnswers(answers);
    this.showErrors({});
    this.shadowRoot.querySelectorAll('.answer-text')[answers.length - 1].focus();
  }

  onAnswersClick(event) {
    const button = event.target.closest('button[data-remove]');
    if (!button) return;

    const answers = this.readAnswers();
    if (answers.length <= MIN_ANSWERS) {
      this.showErrors({ respuestas: `Mínimo ${MIN_ANSWERS} respuestas por pregunta.` });
      return;
    }
    answers.splice(Number(button.dataset.remove), 1);
    this.renderAnswers(answers);
    this.showErrors({});
  }

  // ---------- Errores y modo del formulario ----------
  showErrors(errors) {
    this.$('enunciado-error').textContent = errors.enunciado ?? '';
    this.$('respuestas-error').textContent = errors.respuestas ?? '';
    const enunciado = this.$('enunciado');
    if (errors.enunciado) enunciado.setAttribute('aria-invalid', 'true');
    else enunciado.removeAttribute('aria-invalid');

    if (errors.enunciado) enunciado.focus();
    else if (errors.respuestas) this.shadowRoot.querySelector('.answer-text')?.focus();
  }

  setMode(editing) {
    this.$('form-title').textContent = editing ? 'Editar pregunta' : 'Nueva pregunta';
    this.$('submit').textContent = editing ? 'Actualizar pregunta' : 'Guardar pregunta';
    this.$('cancel').hidden = !editing;
  }

  resetForm() {
    this.$('enunciado').value = '';
    this.editingId = null;
    this.renderAnswers(emptyAnswers());
    this.showErrors({});
    this.setMode(false);
  }

  // ---------- Guardar ----------
  onSubmit(event) {
    event.preventDefault();
    const data = {
      enunciado: this.$('enunciado').value.trim(),
      respuestas: this.readAnswers()
    };

    const errors = validateQuestion(data);
    this.showErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      if (this.editingId) {
        updateQuestion(this.examId, this.editingId, data);
        notify('Pregunta actualizada correctamente.');
      } else {
        addQuestion(this.examId, data);
        notify('Pregunta agregada correctamente.');
      }
      this.resetForm();
      this.renderList();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  // ---------- Lista de preguntas ----------
  renderList() {
    const exam = getExamById(this.examId);
    this.$('exam-title').textContent = exam.titulo;
    this.$('exam-meta').textContent =
      `${exam.codigo} · ${exam.minutos} min · aprobación ${exam.porcentajeAprobacion}% · ${exam.preguntas.length} pregunta(s)`;

    this.$('list').innerHTML = exam.preguntas.length
      ? exam.preguntas.map((q, i) => `
          <li class="q">
            <h3>${i + 1}. ${escapeHTML(q.enunciado)}</h3>
            <ul>
              ${q.respuestas.map(r => `
                <li ${r.correcta ? 'class="correct"' : ''}>
                  ${escapeHTML(r.texto)}${r.correcta ? ' ✓ (correcta)' : ''}
                </li>`).join('')}
            </ul>
            <div class="actions">
              <button class="btn btn-secondary btn-sm" type="button" data-action="edit"
                      data-id="${escapeHTML(q.id)}" aria-label="Editar la pregunta ${i + 1}">Editar</button>
              <button class="btn btn-danger btn-sm" type="button" data-action="delete"
                      data-id="${escapeHTML(q.id)}" aria-label="Eliminar la pregunta ${i + 1}">Eliminar</button>
            </div>
          </li>`).join('')
      : `<li class="empty">Este examen aún no tiene preguntas. Agrega la primera con el formulario.</li>`;
  }

  async onListClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const exam = getExamById(this.examId);
    const question = exam.preguntas.find(q => q.id === button.dataset.id);
    if (!question) return;

    if (button.dataset.action === 'edit') {
      this.editingId = question.id;
      this.$('enunciado').value = question.enunciado;
      this.renderAnswers(question.respuestas.map(r => ({ texto: r.texto, correcta: r.correcta })));
      this.showErrors({});
      this.setMode(true);
      this.$('form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.$('enunciado').focus();
      return;
    }

    const confirmed = await confirmAction({
      title: 'Eliminar pregunta',
      message: '¿Seguro que deseas eliminar esta pregunta? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar'
    });
    if (!confirmed) return;

    try {
      deleteQuestion(this.examId, question.id);
      if (this.editingId === question.id) this.resetForm();
      this.renderList();
      notify('Pregunta eliminada.');
    } catch (error) {
      notify(error.message, 'error');
    }
  }
}

customElements.define('questions-editor', QuestionsEditor);