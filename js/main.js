import { initStorage, KEYS } from "./config/storage";

await initStorage();
console.log('Usuarios guardados:', get(KEYS.USERS));