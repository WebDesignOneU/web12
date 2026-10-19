// src/middlewares/param.middleware.ts
// Valida que los parámetros numéricos de ruta (:id) sean enteros positivos,
// evitando que valores como "undefined" o "abc" lleguen a las consultas SQL.
import type { RequestHandler } from 'express';

export const validarIdRuta: RequestHandler = (req, res, next) => {
  const id = req.params.id;
  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: [{ campo: 'id', mensaje: 'El id debe ser un número entero positivo' }]
    });
    return;
  }
  next();
};
