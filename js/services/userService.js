import { get, set, generateId, KEYS } from '../config/storage.js';
import { hashPassword } from '../utils/helpers.js';
import { getSession, updateSession } from './authService.js';

export function getUsers() {
    return get(KEYS.USERS, []);
}

export function getUsersById(id) {
    return getUsers().find(user => user.id === id) ?? null;
}

export function findDuplicates({ documento, email }, ignoreId = null) {
  const errors = {};
  const others = getUsers().filter(user => user.id !== ignoreId);

  if (others.some(user => user.documento === documento)) {
    errors.documento = 'Ya existe un usuario con este nuemrod e identificacion. Intenta de nuevo.';
  }
  if(others.some(user => user.email.toLowerCase() === email.toLowerCase())) {
    errors.email ='Ya existe un usuario con este correo. ';
  }
  return errors;
}

export async function createUser(data) {
  const user = {
    id: generateId(),
    documento: data.documento,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    cargo: data.cargo,
    passwordHash: await hashPassword(data.password)
  };
  set(KEYS.USERS, [...getUsers(), user]);
  return user;
}

export async function updateUser(id, data) {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  if (index === -1) throw new Error('El usuario ya no existe.');

  const current = users[index];
  const updated = {
    ...current,
    documento: data.documento,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    cargo: data.cargo,
    
    //Si la contraseña llegase a estar vacia se usa la que ya se tenia antes crack
    passwordHash: data.password ? await hashPassword(data.password) : current.passwordHash
  };

  users[index] = updated;
  set(KEYS.USERS, users);

  if (getSession()?.userId === id) updateSession(updated);
  return updated;
}

export function deleteUser(id) {
  const users = getUsers();
  if (users.length <= 1) {
    throw new Error('No puedes eliminar al único usuario del sistema.');
  }
  if (getSession()?.userId === id) {
    throw new Error('No puedes eliminar tu propia cuenta con la sesión abierta.');
  }
  set(KEYS.USERS, users.filter(user => user.id !== id));
}