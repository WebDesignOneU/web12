// src/controllers/funcion.controller.ts
import type { RequestHandler } from 'express';
import { FuncionService } from '../services/funcion.service';
import { FuncionDTO } from '../dto/funcion.dto';
import { manejarError, type ErrorCampo } from '../utils/response';
import * as val from '../utils/validators';

// GET /api/funciones
export const getAll: RequestHandler = async (req, res) => {
  try {
    const { estado, id_obra } = req.query;
    const errores: ErrorCampo[] = [];
    if (estado !== undefined && !val.esEnum(estado, val.ESTADOS_FUNCION)) {
      errores.push({ campo: 'estado', mensaje: `Estado inválido. Use: ${val.ESTADOS_FUNCION.join(', ')}` });
    }
    if (id_obra !== undefined && !val.esEntero(id_obra)) {
      errores.push({ campo: 'id_obra', mensaje: 'id_obra debe ser un número entero positivo' });
    }
    if (errores.length) {
      res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
      return;
    }

    const funciones = await FuncionService.getAll({ estado, id_obra });
    res.json({ success: true, data: funciones.map((funcion) => new FuncionDTO(funcion)) });
  } catch (error) {
    manejarError(res, error);
  }
};

// GET /api/funciones/reporte-ocupacion (admin/director)
export const reporteOcupacion: RequestHandler = async (_req, res) => {
  try {
    const reporte = await FuncionService.reporteOcupacion();
    res.json({ success: true, data: reporte });
  } catch (error) {
    manejarError(res, error, 'Error al generar el reporte de ocupación');
  }
};

// GET /api/funciones/:id
export const getById: RequestHandler = async (req, res) => {
  try {
    const funcion = await FuncionService.getById(req.params.id);
    if (!funcion) {
      res.status(404).json({ success: false, message: 'Función no encontrada' });
      return;
    }
    res.json({ success: true, data: new FuncionDTO(funcion) });
  } catch (error) {
    manejarError(res, error);
  }
};

// POST /api/funciones (admin/director)
export const create: RequestHandler = async (req, res) => {
  const { id_obra, fecha_hora, lugar, capacidad_total, estado } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (!val.esEntero(id_obra)) errores.push({ campo: 'id_obra', mensaje: 'id_obra debe ser un número entero positivo' });
  if (!val.esFechaHora(fecha_hora)) errores.push({ campo: 'fecha_hora', mensaje: 'fecha_hora debe ser una fecha válida (YYYY-MM-DD HH:mm:ss)' });
  if (lugar !== undefined && lugar !== null && !val.esTexto(lugar, 2, 150)) {
    errores.push({ campo: 'lugar', mensaje: 'El lugar debe tener entre 2 y 150 caracteres' });
  }
  if (!val.esEntero(capacidad_total, 1, 10000)) {
    errores.push({ campo: 'capacidad_total', mensaje: 'capacidad_total debe ser un entero entre 1 y 10000' });
  }
  if (estado !== undefined && !val.esEnum(estado, val.ESTADOS_FUNCION)) {
    errores.push({ campo: 'estado', mensaje: `Estado inválido. Use: ${val.ESTADOS_FUNCION.join(', ')}` });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const funcion = await FuncionService.create({
      id_obra: Number(id_obra),
      fecha_hora,
      lugar: lugar || 'Auditorio UCB',
      capacidad_total: Number(capacidad_total),
      estado: estado || 'programada'
    });
    res.status(201).json({ success: true, message: 'Función creada correctamente', data: new FuncionDTO(funcion!) });
  } catch (error) {
    manejarError(res, error, 'Error al crear la función');
  }
};

// PUT /api/funciones/:id (admin/director)
export const update: RequestHandler = async (req, res) => {
  const { fecha_hora, lugar, capacidad_total, estado } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (fecha_hora !== undefined && !val.esFechaHora(fecha_hora)) {
    errores.push({ campo: 'fecha_hora', mensaje: 'fecha_hora debe ser una fecha válida (YYYY-MM-DD HH:mm:ss)' });
  }
  if (lugar !== undefined && lugar !== null && !val.esTexto(lugar, 2, 150)) {
    errores.push({ campo: 'lugar', mensaje: 'El lugar debe tener entre 2 y 150 caracteres' });
  }
  if (capacidad_total !== undefined && !val.esEntero(capacidad_total, 1, 10000)) {
    errores.push({ campo: 'capacidad_total', mensaje: 'capacidad_total debe ser un entero entre 1 y 10000' });
  }
  if (estado !== undefined && !val.esEnum(estado, val.ESTADOS_FUNCION)) {
    errores.push({ campo: 'estado', mensaje: `Estado inválido. Use: ${val.ESTADOS_FUNCION.join(', ')}` });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const funcion = await FuncionService.update(req.params.id, { fecha_hora, lugar, capacidad_total, estado });
    if (!funcion) {
      res.status(404).json({ success: false, message: 'Función no encontrada' });
      return;
    }
    res.json({ success: true, message: 'Función actualizada correctamente', data: new FuncionDTO(funcion) });
  } catch (error) {
    manejarError(res, error, 'Error al actualizar la función');
  }
};

// DELETE /api/funciones/:id (admin)
export const remove: RequestHandler = async (req, res) => {
  try {
    const eliminada = await FuncionService.remove(req.params.id);
    if (!eliminada) {
      res.status(404).json({ success: false, message: 'Función no encontrada' });
      return;
    }
    res.json({ success: true, message: 'Función eliminada correctamente' });
  } catch (error) {
    manejarError(res, error, 'Error al eliminar la función');
  }
};
