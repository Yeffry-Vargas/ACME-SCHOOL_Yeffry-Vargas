# Acme School – Plataforma de exámenes

Aplicación web para que los estudiantes de la escuela Acme presenten exámenes en línea, y para que el personal (administrativos y docentes) gestione usuarios, exámenes y preguntas.

Desarrollada con **JavaScript**

## Funcionalidades

**Módulos privados (requieren iniciar sesión)**
- Login con correo y contraseña.
- Gestión de usuarios: crear, editar y eliminar.
- Gestión de exámenes: crear, editar y eliminar.
- Editor de preguntas: varias respuestas por pregunta y exactamente una correcta.

**Módulo público (sin autenticación)**
- Lista de exámenes disponibles (título, tiempo y porcentaje de aprobación).
- Identificación del estudiante (número de identificación y nombre completo).
- Examen con reloj en tiempo real, preguntas numeradas, selección única y botón Terminar.
- Finalización automática cuando el tiempo llega a 0.
- Resultado con porcentaje de aciertos y mensaje de aprobado o no aprobado.

## Tecnologías

- HTML5, CSS3 (variables CSS) y JavaScript (ES Modules)
- Web Components: Custom Elements y Shadow DOM
- `localStorage` con estructura JSON
- Web Crypto API (SHA-256) para el hash de contraseñas
- Router propio basado en el hash de la URL (SPA)

## Usuarios de prueba 

La app ya tiene por defecto a un usuario que es el admin:

| Campo | Valor |
|---|---|
| Correo | `admin@acme.com` |
| Contraseña | `Admin123*` |

## Rutas

| Ruta | Vista | Acceso |
|---|---|---|
| `#/` | Lista de exámenes | Público |
| `#/resolver/datos?id=...` | Identificación del estudiante | Público |
| `#/resolver/examen` | Resolución del examen | Público |
| `#/resolver/resultado?id=...` | Resultado | Público |
| `#/login` | Inicio de sesión | Público |
| `#/users` | Gestión de usuarios | Privado |
| `#/exams` | Gestión de exámenes | Privado |
| `#/exams/questions?id=...` | Editor de preguntas | Privado |

El guard de autenticación está en `router.js`: toda ruta es privada salvo que se marque como pública.

## Estructura del proyecto

```
ProyectoAcmeschool_JavaScript_ApellidoNombre/
├── index.html
├── README.md
├── css/
│   ├── variables.css
│   └── base.css
└── js/
    ├── main.js
    ├── router.js
    ├── config/
    │   └── storage.js
    ├── services/
    │   ├── authService.js
    │   ├── userService.js
    │   ├── examService.js
    │   └── resultService.js
    ├── components/
    │   ├── app-navbar.js
    │   ├── app-modal.js
    │   ├── data-table.js
    │   ├── toast-message.js
    │   └── exam-timer.js
    ├── views/
    │   ├── login-view.js
    │   ├── users-view.js
    │   ├── exams-view.js
    │   ├── questions-editor.js
    │   ├── exam-list-view.js
    │   ├── exam-start-view.js
    │   ├── exam-take-view.js
    │   └── result-view.js
    └── utils/
        ├── helpers.js
        ├── validators.js
        ├── sharedStyles.js
        ├── notify.js
        └── dialogs.js
```

## Persistencia de datos

Todo se guarda en `localStorage` como JSON, con el prefijo `acme_`.

| Clave | Contenido |
|---|---|
| `acme_users` | Usuarios (contraseña con hash SHA-256) |
| `acme_exams` | Exámenes con sus preguntas y respuestas anidadas |
| `acme_results` | Historial de resultados de los estudiantes |
| `acme_session` | Sesión activa del personal |
| `acme_attempt` | Intento de examen en curso |

## Decisiones de diseño

- **SPA con un solo `index.html`:** el navbar y el guard de autenticación existen una sola vez.
- **Capas separadas:** las vistas no tocan `localStorage`; usan los servicios.
- **Componentes desacoplados:** se comunican con eventos (`row-edit`, `time-up`, `auth-changed`).
- **Reloj preciso:** calcula `hora de fin - Date.now()` en cada tick, por lo que no se desfasa ni se reinicia al recargar.
- **Calificación exacta:** la aprobación se decide con enteros, sin depender de porcentajes redondeados.
- **Una respuesta correcta por pregunta:** garantizada con botones `radio` y validada también en el servicio.
- **Historial estable:** cada resultado guarda una copia del título y del porcentaje de aprobación del examen.

## Seguridad

- Contraseñas con hash SHA-256, nunca en texto plano.
- Todo texto ingresado se escapa antes de insertarse en HTML.
- El login muestra el mismo mensaje si falla el correo o la contraseña.
- No se puede eliminar al último usuario ni la cuenta con la sesión abierta.

## Accesibilidad y UX

- Diseño responsive.
- Etiquetas `<label>` en los campos y errores enlazados con `aria-describedby` y `aria-invalid`.
- Reloj con `role="timer"` y avisos con `aria-live`.
- Modal con `<dialog>` nativo.
- Navegación por teclado con foco visible.
- Animaciones desactivadas si el usuario prefiere menos movimiento.