import { initStorage } from './config/storage.js';
import './components/app-navbar.js';
import './components/toast-message.js';
import './components/app-modal.js';
import './components/data-table.js';
import './views/login-view.js';
import './views/users-view.js';
import { startRouter } from './router.js';
import './views/exams-view.js';
import './views/questions-editor.js';

await initStorage();
startRouter();