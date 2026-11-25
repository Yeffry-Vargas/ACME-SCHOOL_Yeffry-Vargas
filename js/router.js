import { isAuthenticated } from './services/authService.js';

const routes = {
  '/':      { tag: 'exam-list-view', title: 'Exámenes disponibles', public: true },
  '/login': { tag: 'login-view',     title: 'Iniciar sesión', public: true, guestOnly: true },
  '/users': { tag: 'users-view',     title: 'Gestión de usuarios' },
  '/exams': { tag: 'exams-view',     title: 'Gestión de exámenes' }
};

export function navigate(path) {
  location.hash = path;
}

function currentPath() {
  return location.hash.slice(1) || '/';
}

function render() {
  const path = currentPath();
  const route = routes[path];

  //  Si la ruta no existe va al inici
  if (!route) return navigate('/');

  // GUARD: ruta privada sin sesion va al login
  if (!route.public && !isAuthenticated()) return navigate('/login');

  // Si ya inicio sesion el usuario el login no tiene sentido
  if (route.guestOnly && isAuthenticated()) return navigate('/users');

  const app = document.getElementById('app');
  app.replaceChildren();

  let view;
  if (customElements.get(route.tag)) {
    view = document.createElement(route.tag);
  } else {
    // Mientras se construten las vistas se uestra un marcdor
    view = document.createElement('section');
    view.innerHTML = `<h1>${route.title}</h1>
      <p>Esta vista se construirá en un próximo paso.</p>`;
  }
  view.classList.add('view');
  app.append(view);

  document.title = `${route.title} – Acme School`;
  app.focus(); 
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  window.addEventListener('auth-changed', render);
  render();
}