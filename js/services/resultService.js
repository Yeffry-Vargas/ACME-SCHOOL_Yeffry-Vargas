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

export function getResultById(id) {
  return getResults().find(result => result.id === id) ?? null;
}

export function saveAnswer(questionId, answerId) {
  const attempt = getAttempt();
  if (!attempt) return;
  set(KEYS.ATTEMPT, {
    ...attempt,
    respuestas: { ...attempt.respuestas, [questionId]: answerId }
  });
}

export function gradeExam(exam, selections) {
  const total = exam.preguntas.length;
  const correctas = exam.preguntas.filter(question =>
    question.respuestas.some(a => a.id === selections[question.id] && a.correcta)
  ).length;

  return {
    correctas,
    total,
    porcentaje: total ? Math.round((correctas / total) * 100) : 0,
    aprobado: correctas * 100 >= exam.porcentajeAprobacion * total
  };
}