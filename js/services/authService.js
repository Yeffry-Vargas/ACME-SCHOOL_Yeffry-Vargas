import { get, set, remove, KEYS } from '../config/storage.js';
import { hashPassword } from '../utils/helpers.js';

export async function login(email, password) {
  const users = get(KEYS.USERS, []);
  const hash = await hashPassword(password);

  const user = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
      && u.passwordHash === hash
  );
  if (!user) return null;

  set(KEYS.SESSION, { userId: user.id, email: user.email, nombre: user.nombre });
  window.dispatchEvent(new CustomEvent('auth-changed'));
  return user;
}

export function logout() {
  remove(KEYS.SESSION);
  window.dispatchEvent(new CustomEvent('auth-changed'));
}

export function getSession() {
  return get(KEYS.SESSION);
}

export function isAuthenticated() {
  return getSession() !== null;
}

export function updateSession(user) {
  set(KEYS.SESSION, { userId: user.id, email: user.email, nombre: user.nombre });
  window.dispatchEvent(new CustomEvent('auth-changed'));
}