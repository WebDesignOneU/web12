// src/controllers/integrante.controller.ts
import type { RequestHandler } from 'express';
import { IntegranteService } from '../services/integrante.service';
import { IntegranteDTO } from '../dto/integrante.dto';
import { manejarError, type ErrorCampo } from '../utils/response';
import * as val from '../utils/validators';

// GET /api/elenco
export const getAll: RequestHandler = async (req, res) => {
  try {
    const { rol, activo } = req.query;
    const errores: ErrorCampo[] = [];
    if (rol !== undefined && !val.esEnum(rol, val.ROLES_ELENCO)) {
      errores.push({ campo: 'rol', mensaje: `Rol inválido. Use: ${val.ROLES_ELENCO.join(', ')}` });
    }
    if (activo !== undefined && activo !== 'true' && activo !== 'false') {
      errores.push({ campo: 'activo', mensaje: 'activo debe ser "true" o "false"' });
    }
    if (errores.length) {
      res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
      return;
    }

    const integrantes = await IntegranteService.getAll({ rol, activo });
    res.json({ success: true, data: integrantes.map((integrante) => new IntegranteDTO(integrante)) });
  } catch (error) {
    manejarError(res, error);
  }
};

// GET /api/elenco/:id
export const getById: RequestHandler = async (req, res) => {
  try {
    const integrante = await IntegranteService.getById(req.params.id);
    if (!integrante) {
      res.status(404).json({ success: false, message: 'Integrante no encontrado' });
      return;
    }
    res.json({ success: true, data: new IntegranteDTO(integrante) });
  } catch (error) {
    manejarError(res, error);
  }
};

// POST /api/elenco (admin)
export const create: RequestHandler = async (req, res) => {
  const { id_usuario, nombre_completo, rol, fotografia_url, biografia, activo } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (id_usuario !== undefined && id_usuario !== null && !val.esEntero(id_usuario)) {
    errores.push({ campo: 'id_usuario', mensaje: 'id_usuario debe ser un número entero positivo' });
  }
  if (!val.esTexto(nombre_completo, 3, 150)) errores.push({ campo: 'nombre_completo', mensaje: 'El nombre completo debe tener entre 3 y 150 caracteres' });
  if (!val.esEnum(rol, val.ROLES_ELENCO)) {
    errores.push({ campo: 'rol', mensaje: `El rol debe ser uno de: ${val.ROLES_ELENCO.join(', ')}` });
  }
  if (fotografia_url !== undefined && fotografia_url !== null && !val.esUrlOPerfil(fotografia_url)) {
    errores.push({ campo: 'fotografia_url', mensaje: 'La fotografía debe ser una URL válida o una ruta local (/images/...)' });
  }
  if (biografia !== undefined && biografia !== null && typeof biografia !== 'string') {
    errores.push({ campo: 'biografia', mensaje: 'La biografía debe ser texto' });
  }
  if (activo !== undefined && !val.esBooleano(activo)) {
    errores.push({ campo: 'activo', mensaje: 'activo debe ser booleano' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const integrante = await IntegranteService.create({
      id_usuario: id_usuario || null,
      nombre_completo,
      rol,
      fotografia_url: fotografia_url || null,
      biografia: biografia || null,
      activo: activo !== undefined ? activo : true
    });
    res.status(201).json({ success: true, message: 'Integrante agregado al elenco', data: new IntegranteDTO(integrante!) });
  } catch (error) {
    manejarError(res, error, 'Error al crear el integrante');
  }
};

// PUT /api/elenco/:id (admin)
export const update: RequestHandler = async (req, res) => {
  const { id_usuario, nombre_completo, rol, fotografia_url, biografia, activo } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (id_usuario !== undefined && id_usuario !== null && !val.esEntero(id_usuario)) {
    errores.push({ campo: 'id_usuario', mensaje: 'id_usuario debe ser un número entero positivo' });
  }
  if (nombre_completo !== undefined && !val.esTexto(nombre_completo, 3, 150)) {
    errores.push({ campo: 'nombre_completo', mensaje: 'El nombre completo debe tener entre 3 y 150 caracteres' });
  }
  if (rol !== undefined && !val.esEnum(rol, val.ROLES_ELENCO)) {
    errores.push({ campo: 'rol', mensaje: `El rol debe ser uno de: ${val.ROLES_ELENCO.join(', ')}` });
  }
  if (fotografia_url !== undefined && fotografia_url !== null && !val.esUrlOPerfil(fotografia_url)) {
    errores.push({ campo: 'fotografia_url', mensaje: 'La fotografía debe ser una URL válida o una ruta local (/images/...)' });
  }
  if (biografia !== undefined && biografia !== null && typeof biografia !== 'string') {
    errores.push({ campo: 'biografia', mensaje: 'La biografía debe ser texto' });
  }
  if (activo !== undefined && !val.esBooleano(activo)) {
    errores.push({ campo: 'activo', mensaje: 'activo debe ser booleano' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const integrante = await IntegranteService.update(req.params.id, {
      id_usuario,
      nombre_completo,
      rol,
      fotografia_url,
      biografia,
      activo
    });
    if (!integrante) {
      res.status(404).json({ success: false, message: 'Integrante no encontrado' });
      return;
    }
    res.json({ success: true, message: 'Integrante actualizado correctamente', data: new IntegranteDTO(integrante) });
  } catch (error) {
    manejarError(res, error, 'Error al actualizar el integrante');
  }
};

// DELETE /api/elenco/:id (admin)
export const remove: RequestHandler = async (req, res) => {
  try {
    const eliminado = await IntegranteService.remove(req.params.id);
    if (!eliminado) {
      res.status(404).json({ success: false, message: 'Integrante no encontrado' });
      return;
    }
    res.json({ success: true, message: 'Integrante eliminado del elenco' });
  } catch (error) {
    manejarError(res, error, 'Error al eliminar el integrante');
  }
};
