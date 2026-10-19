// src/controllers/suscriptor.controller.ts
import type { RequestHandler } from 'express';
import { SuscriptorService } from '../services/suscriptor.service';
import { SuscriptorDTO } from '../dto/suscriptor.dto';
import { manejarError, type ErrorCampo } from '../utils/response';
import * as val from '../utils/validators';

// POST /api/suscriptores
export const suscribir: RequestHandler = async (req, res) => {
  const { email, nombre } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (!val.esEmail(email)) errores.push({ campo: 'email', mensaje: 'El email es inválido' });
  if (nombre !== undefined && nombre !== null && !val.esTexto(nombre, 2, 100)) {
    errores.push({ campo: 'nombre', mensaje: 'El nombre debe tener entre 2 y 100 caracteres' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const suscriptor = await SuscriptorService.suscribir({ email, nombre });
    res.status(201).json({
      success: true,
      message: 'Suscripción registrada correctamente',
      data: new SuscriptorDTO(suscriptor)
    });
  } catch (error) {
    manejarError(res, error, 'Error al registrar la suscripción');
  }
};

// DELETE /api/suscriptores
export const desuscribir: RequestHandler = async (req, res) => {
  const { email } = req.body || {};
  if (!val.esEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: [{ campo: 'email', mensaje: 'El email es inválido' }]
    });
    return;
  }

  try {
    const suscriptor = await SuscriptorService.desuscribir(email);
    res.json({ success: true, message: 'Suscripción dada de baja', data: new SuscriptorDTO(suscriptor) });
  } catch (error) {
    manejarError(res, error, 'Error al dar de baja la suscripción');
  }
};

// GET /api/suscriptores (admin)
export const getAll: RequestHandler = async (req, res) => {
  try {
    const suscriptores = await SuscriptorService.getAll({ estado: req.query.estado });
    res.json({ success: true, data: suscriptores.map((s) => new SuscriptorDTO(s)) });
  } catch (error) {
    manejarError(res, error);
  }
};
