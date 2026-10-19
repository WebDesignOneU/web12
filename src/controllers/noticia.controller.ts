// src/controllers/noticia.controller.ts
import type { RequestHandler } from 'express';
import { NoticiaService } from '../services/noticia.service';
import { NoticiaDTO } from '../dto/noticia.dto';
import { manejarError, type ErrorCampo } from '../utils/response';
import * as val from '../utils/validators';

// GET /api/noticias
export const getAll: RequestHandler = async (req, res) => {
  try {
    const { page, limit, destacado } = req.query;
    const resultado = await NoticiaService.getAll({ page, limit, destacado });
    res.json({
      success: true,
      data: resultado.noticias.map((noticia) => new NoticiaDTO(noticia)),
      meta: { total: resultado.total, page: resultado.page, pages: resultado.pages }
    });
  } catch (error) {
    manejarError(res, error);
  }
};

// GET /api/noticias/:slug
export const getBySlug: RequestHandler = async (req, res) => {
  try {
    const noticia = await NoticiaService.getBySlug(req.params.slug);
    if (!noticia) {
      res.status(404).json({ success: false, message: 'Noticia no encontrada' });
      return;
    }
    res.json({ success: true, data: new NoticiaDTO(noticia) });
  } catch (error) {
    manejarError(res, error);
  }
};

// POST /api/noticias (admin/director)
export const create: RequestHandler = async (req, res) => {
  const { titulo, contenido, imagen_url, destacado, slug } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (!val.esTexto(titulo, 5, 200)) errores.push({ campo: 'titulo', mensaje: 'El título debe tener entre 5 y 200 caracteres' });
  if (!val.esTexto(contenido, 20)) errores.push({ campo: 'contenido', mensaje: 'El contenido debe tener al menos 20 caracteres' });
  if (imagen_url !== undefined && imagen_url !== null && !val.esUrlOPerfil(imagen_url)) {
    errores.push({ campo: 'imagen_url', mensaje: 'La imagen debe ser una URL válida o una ruta local (/images/...)' });
  }
  if (destacado !== undefined && !val.esBooleano(destacado)) {
    errores.push({ campo: 'destacado', mensaje: 'destacado debe ser booleano' });
  }
  if (slug !== undefined && slug !== null && !val.esSlug(slug)) {
    errores.push({ campo: 'slug', mensaje: 'El slug solo puede contener minúsculas, números y guiones' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const noticia = await NoticiaService.create({
      id_autor: req.user!.id, // autor = usuario autenticado
      titulo,
      contenido,
      imagen_url: imagen_url || null,
      destacado: Boolean(destacado),
      slug: slug || null
    });
    res.status(201).json({ success: true, message: 'Noticia creada correctamente', data: new NoticiaDTO(noticia!) });
  } catch (error) {
    manejarError(res, error, 'Error al crear la noticia');
  }
};

// PUT /api/noticias/:id (admin/director)
export const update: RequestHandler = async (req, res) => {
  const { titulo, contenido, imagen_url, destacado, slug } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (titulo !== undefined && !val.esTexto(titulo, 5, 200)) errores.push({ campo: 'titulo', mensaje: 'El título debe tener entre 5 y 200 caracteres' });
  if (contenido !== undefined && !val.esTexto(contenido, 20)) errores.push({ campo: 'contenido', mensaje: 'El contenido debe tener al menos 20 caracteres' });
  if (imagen_url !== undefined && imagen_url !== null && !val.esUrlOPerfil(imagen_url)) {
    errores.push({ campo: 'imagen_url', mensaje: 'La imagen debe ser una URL válida o una ruta local (/images/...)' });
  }
  if (destacado !== undefined && !val.esBooleano(destacado)) {
    errores.push({ campo: 'destacado', mensaje: 'destacado debe ser booleano' });
  }
  if (slug !== undefined && slug !== null && !val.esSlug(slug)) {
    errores.push({ campo: 'slug', mensaje: 'El slug solo puede contener minúsculas, números y guiones' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const noticia = await NoticiaService.update(req.params.id, { titulo, contenido, imagen_url, destacado, slug });
    if (!noticia) {
      res.status(404).json({ success: false, message: 'Noticia no encontrada' });
      return;
    }
    res.json({ success: true, message: 'Noticia actualizada correctamente', data: new NoticiaDTO(noticia) });
  } catch (error) {
    manejarError(res, error, 'Error al actualizar la noticia');
  }
};

// DELETE /api/noticias/:id (admin)
export const remove: RequestHandler = async (req, res) => {
  try {
    const eliminada = await NoticiaService.remove(req.params.id);
    if (!eliminada) {
      res.status(404).json({ success: false, message: 'Noticia no encontrada' });
      return;
    }
    res.json({ success: true, message: 'Noticia eliminada correctamente' });
  } catch (error) {
    manejarError(res, error, 'Error al eliminar la noticia');
  }
};
