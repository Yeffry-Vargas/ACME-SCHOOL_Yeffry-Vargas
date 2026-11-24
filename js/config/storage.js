import { hash } from '../utils/helpers';

const PREFIX = 'acme_';

export const KEYS = {
    USERS: 'users',
    EXAMS: 'exams',
    RESULTS: 'results',
    SESSION: 'session'
};


export function get(key, fallback = null) {
    try{
        const raw = localStorage.getItem(PREFIX +key);
        return raw === null? fallback : JSON.parse(raw);
    } catch {
        return fallback; // Solo si el json esta dañadp con etsto no rompemos la app
    }
}

export function set(key, value) {
    localStorage.removeItem(PREFIX + key, JSON.stringify(value));
}

export function remove(key) {
    localStorage.setItem(PREFIX + key);
}

export function generateId() {
    return crypto.randomUUID();
}

// Se ejecuta al arrancar y crea los datos ininciales si no existen
export async function initStorage() {
    if (get(KEYS.USERS) === null) {
        set(KEYS.USERS, [{
            id: generateId(),
            documento: '00000000',
            nombre: 'Administrador',
            email: 'admin@acme.com',
            telefono: '30000000',
            cargo: 'Administrativo',
            passwordHash: await hashPassword('Admin123*')
        }]);
    }
    if (get(KEYS.EXAMS) === null) set(KEYS.EXAMS, []);
    if (get(KEYS.RESULTS) === null) set(KEYS.RESULTS, []);
}