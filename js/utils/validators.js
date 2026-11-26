export const isEmail = value => /^\S+@\S+\.\S+$/.test(value);

export function validateUser(data, { requirePassword }) {
  const errors = {};

  if (!/^\d{5,15}$/.test(data.documento)) {
    errors.documento = 'Solo números, entre 5 y 15 dígitos.';
  }
  if (data.nombre.length < 3) {
    errors.nombre = 'Escribe el nombre completo (mínimo 3 caracteres).';
  }
  if (!isEmail(data.email)) {
    errors.email = 'El correo no tiene un formato válido.';
  }
  if (!/^\d{7,15}$/.test(data.telefono)) {
    errors.telefono = 'Solo números, entre 7 y 15 dígitos.';
  }
  if (!['Administrativo', 'Docente'].includes(data.cargo)) {
    errors.cargo = 'Selecciona un cargo.';
  }
  if ((requirePassword || data.password) && data.password.length < 8) {
    errors.password = 'La contraseña debe tener mínimo 8 caracteres.';
  }
  return errors;
}

export function validateExam(data) {
  const errors = {};
  const minutos = Number(data.minutos);
  const porcentaje = Number(data.porcentajeAprobacion);

  if (!/^[A-Za-z0-9-]{3,15}$/.test(data.codigo)) {
    errors.codigo = 'Entre 3 y 15 caracteres: letras, números o guion.';
  }
  if (data.titulo.length < 3) {
    errors.titulo = 'El título debe tener mínimo 3 caracteres.';
  }
  if (!Number.isInteger(minutos) || minutos < 1 || minutos > 300) {
    errors.minutos = 'Escribe un número entero entre 1 y 300.';
  }
  if (!Number.isInteger(porcentaje) || porcentaje < 1 || porcentaje > 100) {
    errors.porcentajeAprobacion = 'Escribe un número entero entre 1 y 100.';
  }
  if (data.descripcion.length < 5) {
    errors.descripcion = 'Describe el examen (mínimo 5 caracteres).';
  }
  return errors;
}

export function validateQuestion(data) {
  const errors = {};
  const answers = data.respuestas;

  if (data.enunciado.length < 5) {
    errors.enunciado = 'Escribe la pregunta (mínimo 5 caracteres).';
  }
  if (answers.length < 2) {
    errors.respuestas = 'Cada pregunta necesita mínimo 2 respuestas.';
  } else if (answers.some(a => a.texto.trim() === '')) {
    errors.respuestas = 'Todas las respuestas deben tener texto.';
  } else if (answers.filter(a => a.correcta).length !== 1) {
    errors.respuestas = 'Marca exactamente una respuesta como correcta.';
  }
  return errors;
}

export function validateStudent(data) {
  const errors = {};
  if (!/^\d{5,15}$/.test(data.documento)) {
    errors.documento = 'Solo números, entre 5 y 15 dígitos.';
  }
  if (data.nombre.length < 3) {
    errors.nombre = 'Escribe tu nombre completo (mínimo 3 caracteres).';
  }
  return errors;
}