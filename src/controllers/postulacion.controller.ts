// src/controllers/postulacion.controller.ts
import type { RequestHandler } from 'express';
import { PostulacionService } from '../services/postulacion.service';
import { PostulacionDTO } from '../dto/postulacion.dto';
import { manejarError, type ErrorCampo } from '../utils/response';
import * as val from '../utils/validators';

// POST /api/convocatorias/:id/postulaciones (público, con optionalAuth)
export const create: RequestHandler = async (req, res) => {
  const {
    nombre_completo,
    ci,
    email,
    telefono,
    carrera_ucb,
    experiencia_anios,
    estilo_danza,
    link_video_demo
  } = req.body || {};

  const errores: ErrorCampo[] = [];
  if (!val.esTexto(nombre_completo, 3, 150)) errores.push({ campo: 'nombre_completo', mensaje: 'El nombre completo debe tener entre 3 y 150 caracteres' });
  if (!val.esCI(ci)) errores.push({ campo: 'ci', mensaje: 'El carnét de identidad es inválido (ej: "8930219 LP")' });
  if (!val.esEmail(email)) errores.push({ campo: 'email', mensaje: 'El email es inválido' });
  if (!val.esTelefono(telefono)) errores.push({ campo: 'telefono', mensaje: 'El teléfono es inválido (ej: "77291039")' });
  if (carrera_ucb !== undefined && carrera_ucb !== null && !val.esTexto(carrera_ucb, 2, 100)) {
    errores.push({ campo: 'carrera_ucb', mensaje: 'La carrera debe tener entre 2 y 100 caracteres' });
  }
  if (experiencia_anios !== undefined && experiencia_anios !== null && !val.esEntero(experiencia_anios, 0, 60)) {
    errores.push({ campo: 'experiencia_anios', mensaje: 'experiencia_anios debe ser un entero entre 0 y 60' });
  }
  if (estilo_danza !== undefined && estilo_danza !== null && !val.esTexto(estilo_danza, 2, 100)) {
    errores.push({ campo: 'estilo_danza', mensaje: 'El estilo de danza debe tener entre 2 y 100 caracteres' });
  }
  if (link_video_demo !== undefined && link_video_demo !== null && !val.esUrl(link_video_demo)) {
    errores.push({ campo: 'link_video_demo', mensaje: 'El link del video debe ser una URL válida (con http:// o https://)' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const postulacion = await PostulacionService.create({
      id_convocatoria: Number(req.params.id),
      id_usuario: req.user ? req.user.id : null, // se vincula si hay sesión activa
      nombre_completo,
      ci,
      email,
      telefono,
      carrera_ucb: carrera_ucb || null,
      experiencia_anios: experiencia_anios !== undefined && experiencia_anios !== null ? Number(experiencia_anios) : 0,
      estilo_danza: estilo_danza || null,
      link_video_demo: link_video_demo || null
    });
    res.status(201).json({ success: true, message: 'Postulación registrada correctamente', data: new PostulacionDTO(postulacion!) });
  } catch (error) {
    manejarError(res, error, 'Error al registrar la postulación');
  }
};

// GET /api/postulaciones (admin/director)
export const getAll: RequestHandler = async (req, res) => {
  try {
    const { estado, id_convocatoria, page, limit } = req.query;
    const errores: ErrorCampo[] = [];
    if (estado !== undefined && !val.esEnum(estado, val.ESTADOS_POSTULACION)) {
      errores.push({ campo: 'estado', mensaje: `Estado inválido. Use: ${val.ESTADOS_POSTULACION.join(', ')}` });
    }
    if (id_convocatoria !== undefined && !val.esEntero(id_convocatoria)) {
      errores.push({ campo: 'id_convocatoria', mensaje: 'id_convocatoria debe ser un número entero positivo' });
    }
    if (errores.length) {
      res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
      return;
    }

    const resultado = await PostulacionService.getAll({ estado, id_convocatoria, page, limit });
    res.json({
      success: true,
      data: resultado.postulaciones.map((postulacion) => new PostulacionDTO(postulacion)),
      meta: { total: resultado.total, page: resultado.page, pages: resultado.pages }
    });
  } catch (error) {
    manejarError(res, error);
  }
};

// GET /api/postulaciones/:id (admin/director)
export const getById: RequestHandler = async (req, res) => {
  try {
    const postulacion = await PostulacionService.getById(req.params.id);
    if (!postulacion) {
      res.status(404).json({ success: false, message: 'Postulación no encontrada' });
      return;
    }
    res.json({ success: true, data: new PostulacionDTO(postulacion) });
  } catch (error) {
    manejarError(res, error);
  }
};

// PATCH /api/postulaciones/:id/estado (admin/director) -> sp_evaluar_postulacion
export const evaluar: RequestHandler = async (req, res) => {
  const { estado_evaluacion } = req.body || {};
  if (!val.esEnum(estado_evaluacion, val.ESTADOS_POSTULACION)) {
    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: [{ campo: 'estado_evaluacion', mensaje: `Estado inválido. Use: ${val.ESTADOS_POSTULACION.join(', ')}` }]
    });
    return;
  }

  try {
    const postulacion = await PostulacionService.evaluar(req.params.id, estado_evaluacion);
    if (!postulacion) {
      res.status(404).json({ success: false, message: 'Postulación no encontrada' });
      return;
    }
    res.json({
      success: true,
      message: `Postulación evaluada correctamente (${estado_evaluacion})`,
      data: new PostulacionDTO(postulacion)
    });
  } catch (error) {
    manejarError(res, error, 'Error al evaluar la postulación');
  }
};
