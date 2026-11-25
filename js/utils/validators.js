export const isEmail = value => /^\S+@\S+\.\S+$/.test(value);

export function validateUser(data, {requirePassword}) {
    const error = {};

    if (data.nombre.length < 3) {
        errors.nombre = 'Escribe el nombre completo (mínimo 3 caracteres).';
    }

    if (!isEmail(data.email)) {
        errors.email = 'El correo no tiene un formato válido.';
    }

    if (!/^\d{7,15}$/.test(data.telefono)) {
        errors.telefono = 'solo se aceptan numeros entre 7 y 15 digitos.'
    }

    if (!['Administrativo', 'Docente'].includes(data.cargo)){
        errors.cargo = 'Selecciona un cargo.';
    }

    if ((requierePassword || data.requirePassword) && data.password.length < 8) {
        errors.password = 'La contrasela debe tener minimo 8 caracteres';
    } 
    return errors;
}
