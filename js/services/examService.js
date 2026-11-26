import { get, set, generateId, KEYS } from '../config/storage.js';
import { validateQuestion } from '../utils/validators.js';

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

function saveQuestions(examId, change) {
  const exams = getExams();
  const index = exams.findIndex(exam => exam.id === examId);
  if (index === -1) throw new Error('El examen ya no existe.');

  exams[index] = { ...exams[index], preguntas: change(exams[index].preguntas) };
  set(KEYS.EXAMS, exams);
}

function buildQuestion(id, data) {
  const errors = validateQuestion(data);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);

  return {
    id,
    enunciado: data.enunciado,
    respuestas: data.respuestas.map(r => ({
      id: generateId(),
      texto: r.texto.trim(),
      correcta: r.correcta
    }))
  };
}

export function addQuestion(examId, data) {
  const question = buildQuestion(generateId(), data);
  saveQuestions(examId, questions => [...questions, question]);
  return question;
}

export function updateQuestion(examId, questionId, data) {
  const question = buildQuestion(questionId, data);
  saveQuestions(examId, questions => {
    if (!questions.some(q => q.id === questionId)) throw new Error('La pregunta ya no existe.');
    return questions.map(q => (q.id === questionId ? question : q));
  });
}

export function deleteQuestion(examId, questionId) {
  saveQuestions(examId, questions => questions.filter(q => q.id !== questionId));
}