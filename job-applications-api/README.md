
# API de Gestión de Solicitudes de Empleo

API REST para la administración de candidatos, vacantes y postulaciones laborales.

La API implementa reglas de negocio deterministas para calcular automáticamente la puntuación (*score*) y la prioridad de revisión (*review priority*) al registrar una nueva postulación.

## Tecnologías Utilizadas

- Node.js 20+
- Express 5
- PostgreSQL
- `pg` con consultas SQL parametrizadas
- dotenv
- Jest
- Supertest
- Módulos ES (*ES Modules*)

La aplicación opera de manera completamente autónoma, sin el uso de ORMs ni modelos de Inteligencia Artificial.

## Estructura del Proyecto

```text
job-applications-api/
├── database.sql
├── .env.example
├── package.json
├── package-lock.json
├── README.md
├── RESPUESTAS.md
├── CHAT.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── errors/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
└── tests/

```

## Requisitos del Sistema

Software necesario para la ejecución:

* Node.js 20 o superior
* PostgreSQL 14 o superior
* npm

## Instalación

```bash
npm install

```

## Configuración de la Base de Datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE job_applications;

```

A continuación, ejecutar el script de inicialización:

```sql
psql -U postgres -d job_applications -f database.sql

```

El script genera automáticamente las tres tablas requeridas y los datos iniciales (*seed data*).

Los datos de prueba incluyen al menos tres candidatos y dos vacantes, contemplando una vacante en estado `CLOSED`.

## Configuración del Entorno

Generar el archivo `.env` a partir de `.env.example`.

Ejemplo de configuración:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/job_applications
DATABASE_SSL=false

```

Nota de seguridad: Nunca incluya el archivo `.env` en el control de versiones (Git).

## Ejecución

Modo desarrollo:

```bash
npm run dev

```

Inicio en entorno de producción:

```bash
npm start

```

Verificación del estado del servidor (*Health check*):

```text
GET http://localhost:3000/health

```

## Endpoints Disponibles

### POST /applications

Permite registrar una nueva postulación laboral.

Request:

```json
{
  "candidateId": 3,
  "vacancyId": 1,
  "source": "REFERRAL",
  "coverLetter": "I have four years of experience building REST APIs with Node.js and SQL databases"
}

```

El cliente no debe enviar los siguientes campos (son gestionados por el sistema):

* `score`
* `priority`
* `status`
* `created_at`
* `updated_status_at`

El backend calcula el puntaje y la prioridad, asignando por defecto el estado `RECEIVED`.

### GET /applications

Devuelve el listado de postulaciones ordenadas bajo los siguientes criterios:

1. Puntuación de forma descendente (`score descending`)
2. Fecha de creación de forma ascendente (`creation date ascending`)

Ejemplos de consulta:

```text
GET /applications
GET /applications?status=IN_REVIEW
GET /applications?vacancyId=1
GET /applications?status=RECEIVED&vacancyId=1

```

Cada registro incluye información detallada del candidato (nombre y correo electrónico) y el título de la vacante.

### PUT /applications/:id/status

Actualiza el estado de una postulación específica.

Request:

```json
{
  "status": "IN_REVIEW"
}

```

Los estados `REJECTED` y `HIRED` se consideran estados finales, por lo que no admiten modificaciones posteriores.

## Cálculo de Puntuación (*Score*)

El sistema computa la puntuación aplicando las siguientes directrices:

| Condición | Puntos |
| --- | --- |
| La experiencia del candidato satisface los requerimientos de la vacante | +4 |
| La procedencia (`source`) es `REFERRAL` | +3 |
| La procedencia (`source`) es `INTERNAL` | +2 |
| La carta de presentación incluye las palabras clave `node`, `sql` o `api` | +2 |
| La carta de presentación excede los 500 caracteres | +1 |
| Cuenta con al menos 3 postulaciones activas en otras vacantes | -2 |

La evaluación de palabras clave técnicas no distingue entre mayúsculas y minúsculas y se computa una única vez, independientemente de las coincidencias múltiples.

La puntuación final obtenida nunca será inferior a cero.

## Niveles de Prioridad

| Score | Priority |
| --- | --- |
| 0–2 | LOW |
| 3–4 | MEDIUM |
| 5–6 | HIGH |
| 7+ | TOP |

## Regla de Postulaciones Duplicadas

Se restringe la postulación de un candidato a una misma vacante si posee una solicitud activa en los siguientes estados:

* `RECEIVED`
* `IN_REVIEW`
* `HIRED`

Si el registro previo más reciente se encuentra en estado `REJECTED`, se autorizará una nueva postulación únicamente si han transcurrido al menos 30 días desde la fecha de rechazo.

## Respuestas de Error

Las incidencias de negocio devuelven una estructura estandarizada:

```json
{
  "error": {
    "code": "VACANCY_CLOSED",
    "message": "The vacancy is closed and does not accept applications."
  }
}

```

Códigos de error frecuentes:

* `INVALID_REQUEST`
* `INVALID_SOURCE`
* `INVALID_STATUS`
* `CANDIDATE_NOT_FOUND`
* `VACANCY_NOT_FOUND`
* `VACANCY_CLOSED`
* `DUPLICATE_APPLICATION`
* `APPLICATION_NOT_FOUND`
* `FINAL_APPLICATION_STATUS`
* `ROUTE_NOT_FOUND`
* `INTERNAL_SERVER_ERROR`

## Pruebas Automatizadas

Ejecución de tests:

```bash
npm test

```

La suite valida integralmente el cálculo de puntuaciones, rangos de prioridad, palabras clave técnicas, límites numéricos, extensión de cartas de presentación y validaciones de la API.

## Decisiones de Seguridad y Calidad

* Uso estricto de consultas SQL parametrizadas para prevenir inyecciones SQL.
* Gestión de credenciales mediante variables de entorno segregadas.
* Exclusión explícita del archivo `.env` en el control de versiones.
* Ocultamiento de trazas de error de base de datos en respuestas públicas al cliente.
* Desacoplamiento de responsabilidades (controladores libres de lógica SQL, repositorios exentos de lógica HTTP, servicios centrados en reglas de negocio).
* Integridad referencial respaldada por restricciones nativas en PostgreSQL.
* Transacciones seguras en bases de datos para operaciones críticas de creación y actualización.
* Bloqueo de filas en concurrencia (*row-level locking*) durante la validación de duplicados por candidato.
* Supresión de la cabecera `X-Powered-By` en Express por motivos de seguridad.
* Restricción del tamaño de carga útil JSON a un máximo de 100 KB.

## Alcance del Proyecto

El alcance del ejercicio no contempla endpoints para la creación directa de candidatos o vacantes, por lo que estas funcionalidades se omiten intencionalmente.

La aplicación opera de forma independiente, sin integrar ni consumir modelos de Inteligencia Artificial.

```
---------------------------------

Créditos y Autoria

Desarrollado como proyecto integral para la gestión de procesos de selección y desarrollo de APIs REST bajo estándares institucionales.

    Desarrollador / Stefani Sanchez

    Entorno Tecnológico: Node.js / PostgreSQL / Linux Institucional

    Año: 2026