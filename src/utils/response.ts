// src/utils/response.ts
// Helpers de respuesta HTTP para mantener un formato uniforme en toda la API:
//   Éxito : { success: true,  data: ... }
//   Error : { success: false, message: '...', errors?: [{ campo, mensaje }] }
import type { Response } from 'express';
import { ApiError } from './ApiError';

export interface ErrorCampo {
  campo: string;
  mensaje: string;
}

// Si hay errores de validación responde 400 y devuelve true; si no, false.
export function validarEntrada(res: Response, errores?: ErrorCampo[]): boolean {
  if (!errores || errores.length === 0) return false;
  res.status(400).json({
    success: false,
    message: 'Datos de entrada inválidos',
    errors: errores
  });
  return true;
}

// Traduce ApiError a su código HTTP; cualquier otro error responde 500.
export function manejarError(
  res: Response,
  error: unknown,
  mensajeInterno = 'Error interno del servidor'
): Response {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error('[API] Error inesperado:', error);
  return res.status(500).json({ success: false, message: mensajeInterno });
}
