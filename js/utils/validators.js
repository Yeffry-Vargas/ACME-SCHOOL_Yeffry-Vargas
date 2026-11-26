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