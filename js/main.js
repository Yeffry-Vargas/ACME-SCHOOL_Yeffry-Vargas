import { initStorage, get, KEYS } from './config/storage.js';

await initStorage();
console.log('Usuarios guardados:', get(KEYS.USERS));