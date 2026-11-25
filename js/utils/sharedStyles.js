const css = `
  :host { display: block; }

  h1 { margin: 0 0 var(--space-2); color: var(--color-primary); }

  .card {
    background: var(--color-surface);
    padding: var(--space-4);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }

  .field { margin-bottom: var(--space-2); }

  label { display: block; font-weight: 600; margin-bottom: 0.3rem; }

  input, select, textarea {
    width: 100%;
    padding: 0.65rem 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    font: inherit;
    background: #fff;
    transition: border-color var(--transition), box-shadow var(--transition);
  }

  input:focus-visible, select:focus-visible, textarea:focus-visible {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 76, 202, 0.25);
  }

  input[aria-invalid="true"] { border-color: var(--color-danger); }

  .error {
    color: var(--color-danger);
    font-size: 0.85rem;
    margin: 0.3rem 0 0;
    min-height: 1.1rem;
  }

  .alert {
    padding: 0.7rem 1rem;
    border-radius: var(--radius);
    background: #fdecee;
    color: var(--color-danger);
    margin-bottom: var(--space-2);
  }
  .alert[hidden] { display: none; }

  .btn {
    padding: 0.7rem 1.4rem;
    border: 0;
    border-radius: var(--radius);
    background: var(--color-primary);
    color: #fff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition), transform var(--transition);
  }
  .btn:hover { background: var(--color-primary-dark); }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
  .btn-block { width: 100%; }
`;

export const sharedSheet = new CSSStyleSheet();
sharedSheet.replaceSync(css);