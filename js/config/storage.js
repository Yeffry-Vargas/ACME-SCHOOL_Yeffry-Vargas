import { hashPassword } from '../utils/helpers.js';

const PREFIX = 'acme_';

export const KEYS = {
  USERS: 'users',
  EXAMS: 'exams',
  RESULTS: 'results',
  SESSION: 'session',
  ATTEMPT: 'attempt'
};

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function generateId() {
  return crypto.randomUUID();
}

export async function initStorage() {
  if (get(KEYS.USERS) === null) {
    set(KEYS.USERS, [{
      id: generateId(),
      documento: '0000000000',
      nombre: 'Administrador',
      email: 'admin@acme.com',
      telefono: '3000000000',
      cargo: 'Administrativo',
      passwordHash: await hashPassword('Admin123*')
    }]);
  }
  if (get(KEYS.EXAMS) === null) set(KEYS.EXAMS, []);
  if (get(KEYS.RESULTS) === null) set(KEYS.RESULTS, []);
}

