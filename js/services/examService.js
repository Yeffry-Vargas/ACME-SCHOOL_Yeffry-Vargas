import { get, set, generateId, KEYS } from '../config/storage.js';

export function getExams() {
  return get(KEYS.EXAMS, []);
}

export function getExamById(id) {
  return getExams().find(exam => exam.id === id) ?? null;
}

export function findDuplicateCode(codigo, ignoreId = null) {
  const duplicated = getExams().some(
    exam => exam.id !== ignoreId && exam.codigo.toLowerCase() === codigo.toLowerCase()
  );
  return duplicated ? { codigo: 'Ya existe un examen con este código.' } : {};
}

export function createExam(data) {
  const exam = {
    id: generateId(),
    codigo: data.codigo,
    titulo: data.titulo,
    minutos: Number(data.minutos),
    porcentajeAprobacion: Number(data.porcentajeAprobacion),
    descripcion: data.descripcion,
    preguntas: []
  };
  set(KEYS.EXAMS, [...getExams(), exam]);
  return exam;
}

export function updateExam(id, data) {
  const exams = getExams();
  const index = exams.findIndex(exam => exam.id === id);
  if (index === -1) throw new Error('El examen ya no existe.');

  exams[index] = {
    ...exams[index],
    codigo: data.codigo,
    titulo: data.titulo,
    minutos: Number(data.minutos),
    porcentajeAprobacion: Number(data.porcentajeAprobacion),
    descripcion: data.descripcion
  };
  set(KEYS.EXAMS, exams);
  return exams[index];
}

export function deleteExam(id) {
  set(KEYS.EXAMS, getExams().filter(exam => exam.id !== id));
}