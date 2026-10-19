# API REST Ballet UCB — versión TypeScript (`ballet-ucb-api-ts`)

API REST que da soporte al portal web del **Ballet de la Universidad Católica Boliviana "San Pablo"**. Gestiona autenticación, noticias y suscriptores, obras y funciones, reservas de entradas, convocatorias/postulaciones al elenco y el listado del elenco.

Esta versión es el **uso de TypeScript** de la API original (`web11`), manteniendo su arquitectura por capas y su comportamiento exacto.

Construida con **Express + TypeScript + MySQL (mysql2)**, autenticación **JWT + bcrypt**, validaciones con la librería `validator` y documentación **OpenAPI 3 (Swagger)**.

---

## Arquitectura (por capas)

```
web12/
├── package.json
├── tsconfig.json             # target ES2022, CommonJS, strict, outDir dist
├── .env                      # variables de entorno (no versionadas)
├── sql/
│   ├── ballet_ucb_db_schema.sql   # esquema: tablas, triggers, funciones y procedimientos
│   └── ballet_ucb_db_data.sql     # datos de prueba (usuarios, obras, reservas, etc.)
├── src/
│   ├── server.ts             # punto de entrada: levanta el servidor y publica Swagger
│   ├── app.ts                # Express: middlewares, rutas y manejadores de error
│   ├── types/
│   │   └── express.d.ts      # ampliación global de Request (req.user)
│   ├── config/
│   │   ├── db.ts             # pool de conexión MySQL (mysql2/promise)
│   │   └── swagger.ts        # definición OpenAPI (scanea src/routes/*.ts|*.js)
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # authenticateToken, authorizeRoles, optionalAuth
│   │   └── param.middleware.ts    # validación de parámetros de ruta (:id)
│   ├── models/               # entidades (*.entity.ts) + interfaces RowDataPacket
│   ├── dto/                  # transformación/enmascaramiento de respuestas
│   ├── services/             # lógica de negocio y acceso a BD (incl. SPs y triggers)
│   ├── controllers/          # validación de entrada + orquestación service → DTO
│   ├── routes/               # endpoints + documentación Swagger JSDoc
│   └── utils/                # ApiError, validadores, slugify, helpers de respuesta
└── dist/                     # salida compilada (npm run build)
```

Flujo de una petición: `ruta (Swagger) → controller (valida) → service (BD) → entity → DTO → JSON`.

## Configuración del proyecto

```bash
mkdir web12 # Crea la carpeta para el proyecto
cd web12 # Entra a la carpeta
npm init -y # Inicializa el proyecto
npm install express dotenv mysql2 bcryptjs jsonwebtoken swagger-jsdoc cors swagger-ui-express validator # Instala las dependencias
npm install -D typescript ts-node @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/swagger-jsdoc @types/swagger-ui-express @types/validator @types/cors nodemon # Instala las dependencias de desarrollo
npx tsc --init # Inicializa TypeScript
```

---

## Puesta en marcha

1. **Base de datos** (requiere MySQL 8+):

   ```bash
   mysql -u root -p < sql/ballet_ucb_db_schema.sql
   mysql -u root -p < sql/ballet_ucb_db_data.sql
   ```

2. **Variables de entorno** (`.env`):

   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=mysql
   DB_NAME=ballet_ucb_db
   JWT_SECRET=cambiar_esta_clave_secreta_en_produccion_ballet_ucb_2026
   JWT_EXPIRES_IN=24h
   ```

   > El puerto por defecto de esta versión es **3001**, para poder convivir con la versión JavaScript (3000).

3. **Dependencias y arranque**:

   ```bash
   npm install
   npm run dev        # desarrollo con nodemon + ts-node
   npm run build      # compila TypeScript a dist/
   npm start          # producción (node dist/server.js)
   npm run typecheck  # verifica tipos sin emitir
   ```

4. **Documentación**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs) (solo fuera de `NODE_ENV=production`).

> Usuarios de prueba (contraseña `Password.123`): `admin.ballet@ucb.edu.bo` (admin), `directora.ballet@ucb.edu.bo` (director), `camila.vargas@ucb.edu.bo` (espectador).

---

## Autenticación y roles

| Rol          | Permisos                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `admin`      | CRUD completo (noticias, obras, funciones, convocatorias, elenco), evaluar postulaciones, reportes |
| `director`   | Gestión de noticias, obras, funciones, convocatorias, reservas y evaluación de postulaciones       |
| `bailarin`   | Acceso de miembro del elenco                                                                       |
| `postulante` | Puede postular y consultar convocatorias                                                           |
| `espectador` | Puede reservar entradas y consultar el portal                                                      |

Los endpoints públicos no requieren token. `POST /api/auth/login` devuelve un JWT a usar en `Authorization: Bearer <token>`.

---

## Endpoints principales

| Método              | Ruta                                           | Acceso                              | Descripción                                                   |
| ------------------- | ---------------------------------------------- | ----------------------------------- | ------------------------------------------------------------- |
| GET                 | `/api/health`                                  | Público                             | Health check de la API                                        |
| POST                | `/api/auth/register`                           | Público                             | Auto-registro (roles espectador/postulante)                   |
| POST                | `/api/auth/login`                              | Público                             | Devuelve JWT                                                  |
| GET                 | `/api/auth/perfil`                             | Cualquier rol                       | Perfil del usuario autenticado                                |
| GET                 | `/api/noticias`                                | Público                             | Lista paginada (`?page`, `?limit`, `?destacado`)              |
| GET                 | `/api/noticias/:slug`                          | Público                             | Detalle por slug                                              |
| POST/PUT/DELETE     | `/api/noticias[/:id]`                          | admin/director (delete: admin)      | CRUD de noticias                                              |
| GET/POST/DELETE     | `/api/suscriptores`                            | GET: admin; POST/DELETE: público    | Suscripción al boletín                                        |
| GET/POST            | `/api/obras[/:id]`                             | Público / admin-director            | Repertorio de obras                                           |
| GET/POST            | `/api/funciones[/:id]`                         | Público / admin-director            | Funciones con cupos y obra                                    |
| GET                 | `/api/funciones/reporte-ocupacion`             | admin/director                      | Reporte vía `sp_reporte_ocupacion_funciones`                  |
| POST                | `/api/reservas`                                | Público (+JWT opcional)             | Reserva vía `sp_registrar_reserva` (genera código BUCB-XXXXX) |
| GET                 | `/api/reservas/codigo/:codigo`                 | Público                             | Consulta de reserva por código                                |
| GET/PATCH           | `/api/reservas[/:id/cancelar \| /:id/asistio]` | admin/director                      | Gestión de reservas (cupos vía triggers)                      |
| GET/POST            | `/api/convocatorias[/:id]`                     | Público / admin-director            | Convocatorias con total de postulaciones                      |
| POST                | `/api/convocatorias/:id/postulaciones`         | Público (+JWT opcional)             | Postulación a convocatoria abierta                            |
| GET                 | `/api/postulaciones[/:id]`                     | admin/director                      | Listado y detalle de postulaciones                            |
| PATCH               | `/api/postulaciones/:id/estado`                | admin/director                      | Evalúa vía `sp_evaluar_postulacion` (asciende a bailarín)     |
| GET/POST/PUT/DELETE | `/api/elenco[/:id]`                            | GET público; POST/PUT/DELETE: admin | Elenco de bailarines                                          |

Formato uniforme de respuesta:

```json
{ "success": true, "data": [...], "meta": { "total": 3, "page": 1, "pages": 1 } }
{ "success": false, "message": "Datos de entrada inválidos", "errors": [{ "campo": "email", "mensaje": "..." }] }
```

---

## Lógica delegada a la base de datos

El esquema aprovecha MySQL para mantener la integridad de los datos:

- **Triggers**: `trg_descontar_cupos_reserva` (descuenta asientos al reservar y marca `agotada`) y `trg_restaurar_cupos_cancelacion` (devuelve cupos al cancelar).
- **Procedimientos**: `sp_registrar_reserva` (transacción de reserva + generación de código), `sp_evaluar_postulacion` (evaluación + ascenso de rol), `sp_reporte_ocupacion_funciones` (reporte de ocupación).
- **Funciones**: `fn_verificar_disponibilidad` y `fn_generar_codigo_reserva`.

Los servicios invocan estos objetos con conexiones dedicadas del pool para leer los parámetros `OUT` (`@codigo_reserva`, `@resultado`).

---

## Notas de la versión TypeScript

- **Salida CommonJS**: `tsc` compila a `dist/` manteniendo la estructura de `src/`. Los comentarios JSDoc se conservan para que `swagger-jsdoc` siga generando el spec en producción.
- **Tipado de `req.user`**: se declara en `src/types/express.d.ts` mediante `declare global`. En `tsconfig.json` se activa `"ts-node": { "files": true }` para que `ts-node` cargue esa definición global en desarrollo.
- **Swagger**: `src/config/swagger.ts` escanea tanto `../routes/*.ts` (desarrollo/ts-node) como `../routes/*.js` (build/producción), por lo que la documentación funciona en ambos modos.
- **Controladores**: tipados como `RequestHandler` usando el patrón `res...; return;`.
