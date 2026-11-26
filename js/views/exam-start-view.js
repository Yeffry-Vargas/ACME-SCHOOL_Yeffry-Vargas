import { sharedSheet } from '../utils/sharedStyles.js';
import { validateStudent } from '../utils/validators.js';
import { notify } from '../utils/notify.js';
import { navigate } from '../router.js';
import { getExamById } from '../services/examService.js';
import { startAttempt } from '../services/resultService.js';

const FIELD_IDS = ['documento', 'nombre'];

class ExamStartView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sharedSheet];
    this.onSubmit = this.onSubmit.bind(this);
  }

  connectedCallback() {
    const params = new URLSearchParams(location.hash.split('?')[1] ?? '');
    this.exam = getExamById(params.get('id'));

    if (!this.exam || this.exam.preguntas.length === 0) {
      notify('Ese examen no está disponible.', 'error');
      navigate('/');
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        .wrapper { max-width: 480px; margin: var(--space-3) auto; }
        .meta { color: var(--color-muted); margin: 0 0 var(--space-2); }
        .notice { background: #fff8e1; border-radius: var(--radius); padding: 0.7rem 1rem;
                  margin-bottom: var(--space-2); font-size: 0.9rem; }
        .back { display: inline-block; margin-top: var(--space-2); color: var(--color-primary); }
      </style>
      <div class="wrapper">
        <div class="card">
          <h1 id="exam-title"></h1>
          <p class="meta" id="exam-meta"></p>
          <p class="notice">El tiempo empieza a correr cuando pulses <strong>Comenzar</strong>.</p>

          <form id="form" novalidate>
            <div class="field">
              <label for="documento">Número de identificación</label>
              <input id="documento" inputmode="numeric" autocomplete="off" aria-describedby="documento-error">
              <p class="error" id="documento-error"></p>
            </div>
            <div class="field">
              <label for="nombre">Nombre completo</label>
              <input id="nombre" autocomplete="name" aria-describedby="nombre-error">
              <p class="error" id="nombre-error"></p>
            </div>
            <button class="btn btn-block" type="submit">Comenzar examen</button>
          </form>
        </div>
        <a class="back" href="#/">← Volver a la lista</a>
      </div>`;

    const { titulo, minutos, porcentajeAprobacion, preguntas } = this.exam;
    this.$('exam-title').textContent = titulo;
    this.$('exam-meta').textContent =
      `${preguntas.length} preguntas · ${minutos} min · aprobación ${porcentajeAprobacion}%`;

    this.form = this.$('form');
    this.form.addEventListener('submit', this.onSubmit);
    this.$('documento').focus();
  }

  disconnectedCallback() {
    this.form?.removeEventListener('submit', this.onSubmit);
  }

  $(id) { return this.shadowRoot.getElementById(id); }

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

  onSubmit(event) {
    event.preventDefault();
    const data = {
      documento: this.$('documento').value.trim(),
      nombre: this.$('nombre').value.trim()
    };

    const errors = validateStudent(data);
    this.showErrors(errors);
    if (Object.keys(errors).length) return;

    startAttempt(this.exam, data);
    navigate('/resolver/examen');
  }
}

customElements.define('exam-start-view', ExamStartView);