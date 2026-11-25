import { initStorage, get, KEYS } from './config/storage.js';

await initStorage();
console.log('Usuarios guardados:', get(KEYS.USERS));

import { initStorage } from './config/storage.js';
import './components/app-navbar.js';
import { startRouter } from './router.js';

await initStorage();
startRouter();