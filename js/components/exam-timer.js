const pad = n => String(n).padStart(2, '0');

// Avisos para lectores de pantalla: segundos restantes -> mensaje
const MARKS = { 300: 'Quedan 5 minutos.', 60: 'Queda 1 minuto.', 10: 'Quedan 10 segundos.' };

class ExamTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.tick = this.tick.bind(this);
    this._end = 0;
    this._initial = 0;
    this._done = false;
    this._announced = new Set();
    this._id = null;
  }

  // La vista asigna la hora de fin: timer.endTime = attempt.fin
  set endTime(value) {
    this._end = value;
    if (this.isConnected) this.start();
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        .clock {
          font-size: 1.6rem; font-weight: 700; font-variant-numeric: tabular-nums;
          padding: 0.3rem 1rem; border-radius: var(--radius);
          background: var(--color-bg); color: var(--color-primary);
          transition: background var(--transition), color var(--transition);
        }
        .clock.warn { background: #fdecee; color: var(--color-danger); animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 50% { opacity: 0.6; } }
        @media (prefers-reduced-motion: reduce) { .clock.warn { animation: none; } }
        .sr-only {
          position: absolute; width: 1px; height: 1px; overflow: hidden;
          clip: rect(0 0 0 0); white-space: nowrap;
        }
      </style>
      <div class="clock" id="clock" role="timer" aria-label="Tiempo restante">--:--</div>
      <p class="sr-only" id="live" aria-live="polite"></p>`;
    if (this._end) this.start();
  }

  disconnectedCallback() {
    clearInterval(this._id); // sin esto el reloj seguiría corriendo "fantasma"
  }

  start() {
    clearInterval(this._id);
    this._done = false;
    this._announced.clear();
    this._initial = Math.ceil((this._end - Date.now()) / 1000);
    this.tick();
    this._id = setInterval(this.tick, 250);
  }

  tick() {
    const ms = Math.max(0, this._end - Date.now());
    const secs = Math.ceil(ms / 1000); // se muestra 00:00 solo cuando de verdad terminó
    const clock = this.shadowRoot.getElementById('clock');

    clock.textContent = `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
    clock.classList.toggle('warn', secs <= 60);
    this.announce(secs);

    if (ms === 0 && !this._done) {
      this._done = true;
      clearInterval(this._id);
      this.dispatchEvent(new CustomEvent('time-up'));
    }
  }

  announce(secs) {
    for (const [mark, text] of Object.entries(MARKS)) {
      const limit = Number(mark);
      // Solo avisa umbrales menores que la duración total del examen
      if (secs <= limit && limit < this._initial && !this._announced.has(limit)) {
        this._announced.add(limit);
        this.shadowRoot.getElementById('live').textContent = text;
      }
    }
  }
}

customElements.define('exam-timer', ExamTimer);