// src/controllers/obra.controller.ts
import type { RequestHandler } from 'express';
import { ObraService } from '../services/obra.service';
import { ObraDTO } from '../dto/obra.dto';
import { FuncionDTO } from '../dto/funcion.dto';
import { manejarError, type ErrorCampo } from '../utils/response';
import * as val from '../utils/validators';

// GET /api/obras
export const getAll: RequestHandler = async (_req, res) => {
  try {
    const obras = await ObraService.getAll();
    res.json({ success: true, data: obras.map((obra) => new ObraDTO(obra)) });
  } catch (error) {
    manejarError(res, error);
  }
};

// GET /api/obras/:id
export const getById: RequestHandler = async (req, res) => {
  try {
    const obra = await ObraService.getById(req.params.id);
    if (!obra) {
      res.status(404).json({ success: false, message: 'Obra no encontrada' });
      return;
    }
    res.json({
      success: true,
      data: new ObraDTO({ ...obra, funciones: (obra.funciones ?? []).map((f) => new FuncionDTO(f)) })
    });
  } catch (error) {
    manejarError(res, error);
  }
};

// POST /api/obras (admin/director)
export const create: RequestHandler = async (req, res) => {
  const { titulo, descripcion, director, imagen_banner } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (!val.esTexto(titulo, 2, 150)) errores.push({ campo: 'titulo', mensaje: 'El título debe tener entre 2 y 150 caracteres' });
  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
    errores.push({ campo: 'descripcion', mensaje: 'La descripción debe ser texto' });
  }
  if (director !== undefined && director !== null && !val.esTexto(director, 2, 100)) {
    errores.push({ campo: 'director', mensaje: 'El director debe tener entre 2 y 100 caracteres' });
  }
  if (imagen_banner !== undefined && imagen_banner !== null && !val.esUrlOPerfil(imagen_banner)) {
    errores.push({ campo: 'imagen_banner', mensaje: 'El banner debe ser una URL válida o una ruta local (/images/...)' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const obra = await ObraService.create({ titulo, descripcion: descripcion || null, director: director || null, imagen_banner: imagen_banner || null });
    res.status(201).json({ success: true, message: 'Obra creada correctamente', data: new ObraDTO(obra!) });
  } catch (error) {
    manejarError(res, error, 'Error al crear la obra');
  }
};

// PUT /api/obras/:id (admin/director)
export const update: RequestHandler = async (req, res) => {
  const { titulo, descripcion, director, imagen_banner } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (titulo !== undefined && !val.esTexto(titulo, 2, 150)) errores.push({ campo: 'titulo', mensaje: 'El título debe tener entre 2 y 150 caracteres' });
  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
    errores.push({ campo: 'descripcion', mensaje: 'La descripción debe ser texto' });
  }
  if (director !== undefined && director !== null && !val.esTexto(director, 2, 100)) {
    errores.push({ campo: 'director', mensaje: 'El director debe tener entre 2 y 100 caracteres' });
  }
  if (imagen_banner !== undefined && imagen_banner !== null && !val.esUrlOPerfil(imagen_banner)) {
    errores.push({ campo: 'imagen_banner', mensaje: 'El banner debe ser una URL válida o una ruta local (/images/...)' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const obra = await ObraService.update(req.params.id, { titulo, descripcion, director, imagen_banner });
    if (!obra) {
      res.status(404).json({ success: false, message: 'Obra no encontrada' });
      return;
    }
    res.json({ success: true, message: 'Obra actualizada correctamente', data: new ObraDTO(obra) });
  } catch (error) {
    manejarError(res, error, 'Error al actualizar la obra');
  }
};

// DELETE /api/obras/:id (admin)
export const remove: RequestHandler = async (req, res) => {
  try {
    const eliminada = await ObraService.remove(req.params.id);
    if (!eliminada) {
      res.status(404).json({ success: false, message: 'Obra no encontrada' });
      return;
    }
    res.json({ success: true, message: 'Obra eliminada correctamente (sus funciones se eliminaron en cascada)' });
  } catch (error) {
    manejarError(res, error, 'Error al eliminar la obra');
  }
};
