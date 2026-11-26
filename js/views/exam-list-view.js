import { sharedSheet } from '../utils/sharedStyles.js';
import { escapeHTML } from '../utils/helpers.js';
import { getExams } from '../services/examService.js';

class ExamListView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sharedSheet];
  }

  connectedCallback() {
    const exams = getExams().filter(exam => exam.preguntas.length > 0);

    const cards = exams.map(exam => `
      <li class="card exam">
        <h2>${escapeHTML(exam.titulo)}</h2>
        <p class="desc">${escapeHTML(exam.descripcion)}</p>
        <dl>
          <div><dt>Tiempo</dt><dd>${exam.minutos} min</dd></div>
          <div><dt>Aprobación</dt><dd>${exam.porcentajeAprobacion}%</dd></div>
          <div><dt>Preguntas</dt><dd>${exam.preguntas.length}</dd></div>
        </dl>
        <a class="btn" href="#/resolver/datos?id=${encodeURIComponent(exam.id)}"
           aria-label="Presentar el examen ${escapeHTML(exam.titulo)}">Presentar examen</a>
      </li>`).join('');

    this.shadowRoot.innerHTML = `
      <style>
        .intro { color: var(--color-muted); margin: 0 0 var(--space-3); }
        .grid {
          list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3);
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }
        .exam { display: flex; flex-direction: column; gap: var(--space-1);
                transition: transform var(--transition), box-shadow var(--transition); }
        .exam:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
        .exam h2 { color: var(--color-primary); margin: 0; }
        .desc { margin: 0; color: var(--color-muted); flex: 1; }
        dl { display: flex; gap: var(--space-2); margin: var(--space-1) 0; }
        dt { font-size: 0.75rem; text-transform: uppercase; color: var(--color-muted); }
        dd { margin: 0; font-weight: 700; }
        a.btn { text-decoration: none; text-align: center; display: block; }
        .empty { text-align: center; color: var(--color-muted); }
      </style>

      <h1>Exámenes disponibles</h1>
      <p class="intro">Elige un examen para empezar. No necesitas cuenta.</p>
      ${exams.length
        ? `<ul class="grid">${cards}</ul>`
        : `<div class="card empty"><p>Todavía no hay exámenes disponibles. Vuelve más tarde.</p></div>`}
    `;
  }
}

customElements.define('exam-list-view', ExamListView);