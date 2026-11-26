import { get, set, remove, generateId, KEYS } from '../config/storage.js';

export function getResults() {
  return get(KEYS.RESULTS, []);
}

export function saveResult(data) {
  const result = { id: generateId(), fecha: new Date().toISOString(), ...data };
  set(KEYS.RESULTS, [...getResults(), result]);
  return result;
}

export function startAttempt(exam, student) {
  const inicio = Date.now();
  const attempt = {
    examId: exam.id,
    documento: student.documento,
    nombre: student.nombre,
    inicio,
    fin: inicio + exam.minutos * 60000
  };
  set(KEYS.ATTEMPT, attempt);
  return attempt;
}

export function getAttempt() {
  return get(KEYS.ATTEMPT);
}

export function clearAttempt() {
  remove(KEYS.ATTEMPT);
}