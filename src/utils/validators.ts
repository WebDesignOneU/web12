// src/utils/validators.ts
// Validaciones manuales de entrada con la librería "validator" (declarada en
// package.json), sin agregados externos. Cada función devuelve true/false y los
// controladores acumulan los mensajes para responder 400.
import validator from 'validator';

// ---------------------------------------------------------------
// Catálogos ENUM espejo del esquema sql/ballet_ucb_db_schema.sql
// ---------------------------------------------------------------
export const ROLES_USUARIO: string[] = ['admin', 'director', 'bailarin', 'postulante', 'espectador'];
export const ROLES_AUTOREGISTRO: string[] = ['espectador', 'postulante']; // auto-registro público
export const ESTADOS_USUARIO: string[] = ['activo', 'inactivo', 'bloqueado'];
export const ESTADOS_FUNCION: string[] = ['programada', 'agotada', 'cancelada', 'finalizada'];
export const ESTADOS_RESERVA: string[] = ['confirmada', 'asistio', 'cancelada'];
export const ESTADOS_CONVOCATORIA: string[] = ['abierta', 'cerrada'];
export const ESTADOS_POSTULACION: string[] = ['pendiente', 'preseleccionado', 'aceptado', 'rechazado'];
export const ROLES_ELENCO: string[] = ['solista', 'cuerpo_de_ballet', 'director', 'maestro'];

// ---------------------------------------------------------------
// Validadores genéricos
// ---------------------------------------------------------------
export const esTexto = (valor: unknown, min = 1, max = Infinity): boolean =>
  typeof valor === 'string' && valor.trim().length >= min && valor.trim().length <= max;

export const esEntero = (valor: unknown, min = 1, max = Infinity): boolean => {
  if (valor === null || valor === undefined || String(valor).trim() === '') return false;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= min && numero <= max;
};

export const esDecimalPositivo = (valor: unknown): boolean => {
  const numero = Number(valor);
  return !Number.isNaN(numero) && numero > 0;
};

export const esBooleano = (valor: unknown): boolean => typeof valor === 'boolean';

export const esEmail = (valor: unknown): boolean =>
  typeof valor === 'string' && validator.isEmail(valor.trim(), { allow_utf8_local_part: false });

// Acepta 'YYYY-MM-DD HH:mm:ss' o ISO completo
export const esFechaHora = (valor: unknown): boolean =>
  typeof valor === 'string' && validator.isISO8601(valor.trim().replace(' ', 'T'));

// Acepta 'YYYY-MM-DD'
export const esFecha = (valor: unknown): boolean =>
  typeof valor === 'string' && validator.isISO8601(valor.trim(), { strict: true });

export const esTelefono = (valor: unknown): boolean =>
  typeof valor === 'string' && /^\+?[\d\s-]{5,20}$/.test(valor.trim());

// Carnet de identidad boliviano: dígitos + código del departamento (ej. "6849302 LP")
export const esCI = (valor: unknown): boolean =>
  typeof valor === 'string' && /^[\d]{5,12}(\s?[A-Za-z]{1,3})?$/.test(valor.trim());

// URL con protocolo (http/https) válida
export const esUrl = (valor: unknown): boolean =>
  typeof valor === 'string' && validator.isURL(valor.trim(), { require_protocol: true });

// URL con protocolo o ruta local tipo "/images/obras/banner.jpg"
export const esUrlOPerfil = (valor: unknown): boolean =>
  typeof valor === 'string' && (valor.trim().startsWith('/') || esUrl(valor));

export const esSlug = (valor: unknown): boolean =>
  typeof valor === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(valor);

export const esEnum = (valor: unknown, permitidos: string[]): boolean =>
  typeof valor === 'string' && permitidos.includes(valor);

export const esPassword = (valor: unknown): boolean => typeof valor === 'string' && valor.length >= 6;
