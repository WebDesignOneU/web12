// src/controllers/reserva.controller.ts
import type { RequestHandler, Response } from 'express';
import { ReservaService } from '../services/reserva.service';
import { ReservaDTO } from '../dto/reserva.dto';
import type { Reserva } from '../models/reserva.entity';
import { manejarError, type ErrorCampo } from '../utils/response';
import * as val from '../utils/validators';

// Arma la respuesta de una reserva con su espectador (si existe)
async function responderConEspectador(
  res: Response,
  mensaje: string,
  reserva: Reserva,
  status = 200
): Promise<void> {
  const espectador = await ReservaService.getEspectador(reserva.id_reserva);
  const espectadorDTO = espectador
    ? {
        id: espectador.id_espectador,
        ci: espectador.ci,
        nombreCompleto: espectador.nombre_completo,
        correo: espectador.correo,
        telefono: espectador.telefono,
        esEstudianteUcb: Boolean(espectador.es_estudiante_ucb)
      }
    : null;
  res.status(status).json({
    success: true,
    message: mensaje,
    data: { ...new ReservaDTO(reserva), espectador: espectadorDTO }
  });
}

// POST /api/reservas (público: invitado o usuario logueado)
export const create: RequestHandler = async (req, res) => {
  const { id_funcion, cantidad_entradas, ci, nombre_completo, correo, telefono, es_estudiante_ucb } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (!val.esEntero(id_funcion)) errores.push({ campo: 'id_funcion', mensaje: 'id_funcion debe ser un número entero positivo' });
  if (!val.esEntero(cantidad_entradas, 1, 10)) {
    errores.push({ campo: 'cantidad_entradas', mensaje: 'cantidad_entradas debe ser un entero entre 1 y 10' });
  }
  if (!val.esCI(ci)) errores.push({ campo: 'ci', mensaje: 'El carnét de identidad es inválido (ej: "6849302 LP")' });
  if (!val.esTexto(nombre_completo, 3, 150)) errores.push({ campo: 'nombre_completo', mensaje: 'El nombre completo debe tener entre 3 y 150 caracteres' });
  if (!val.esEmail(correo)) errores.push({ campo: 'correo', mensaje: 'El correo es inválido' });
  if (telefono !== undefined && telefono !== null && telefono !== '' && !val.esTelefono(telefono)) {
    errores.push({ campo: 'telefono', mensaje: 'El teléfono es inválido (ej: "71542091")' });
  }
  if (es_estudiante_ucb !== undefined && !val.esBooleano(es_estudiante_ucb)) {
    errores.push({ campo: 'es_estudiante_ucb', mensaje: 'es_estudiante_ucb debe ser booleano' });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const resultado = await ReservaService.create({
      id_funcion: Number(id_funcion),
      cantidad_entradas: Number(cantidad_entradas),
      ci,
      nombre_completo,
      correo,
      telefono: telefono || null,
      es_estudiante_ucb: Boolean(es_estudiante_ucb),
      id_usuario: req.user ? req.user.id : null // se vincula si hay sesión activa
    });
    res.status(201).json({
      success: true,
      message: 'Reserva registrada correctamente. Presenta el código en la taquilla.',
      data: resultado
    });
  } catch (error) {
    manejarError(res, error, 'Error al registrar la reserva');
  }
};

// GET /api/reservas/codigo/:codigo (consulta pública por código)
export const getByCodigo: RequestHandler = async (req, res) => {
  try {
    const reserva = await ReservaService.getByCodigo(req.params.codigo);
    if (!reserva) {
      res.status(404).json({ success: false, message: 'No existe una reserva con ese código' });
      return;
    }
    await responderConEspectador(res, 'Reserva encontrada', reserva);
  } catch (error) {
    manejarError(res, error);
  }
};

// GET /api/reservas (admin/director)
export const getAll: RequestHandler = async (req, res) => {
  try {
    const { page, limit, estado, id_funcion } = req.query;
    const errores: ErrorCampo[] = [];
    if (estado !== undefined && !val.esEnum(estado, val.ESTADOS_RESERVA)) {
      errores.push({ campo: 'estado', mensaje: `Estado inválido. Use: ${val.ESTADOS_RESERVA.join(', ')}` });
    }
    if (id_funcion !== undefined && !val.esEntero(id_funcion)) {
      errores.push({ campo: 'id_funcion', mensaje: 'id_funcion debe ser un número entero positivo' });
    }
    if (errores.length) {
      res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
      return;
    }

    const resultado = await ReservaService.getAll({ page, limit, estado, id_funcion });
    res.json({
      success: true,
      data: resultado.reservas.map((reserva) => new ReservaDTO(reserva)),
      meta: { total: resultado.total, page: resultado.page, pages: resultado.pages }
    });
  } catch (error) {
    manejarError(res, error);
  }
};

// PATCH /api/reservas/:id/cancelar (admin/director)
export const cancelar: RequestHandler = async (req, res) => {
  try {
    const reserva = await ReservaService.cancelar(req.params.id);
    await responderConEspectador(res, 'Reserva cancelada. Los cupos fueron restaurados.', reserva!);
  } catch (error) {
    manejarError(res, error, 'Error al cancelar la reserva');
  }
};

// PATCH /api/reservas/:id/asistio (admin/director)
export const marcarAsistencia: RequestHandler = async (req, res) => {
  try {
    const reserva = await ReservaService.marcarAsistencia(req.params.id);
    await responderConEspectador(res, 'Asistencia registrada', reserva!);
  } catch (error) {
    manejarError(res, error, 'Error al registrar la asistencia');
  }
};
