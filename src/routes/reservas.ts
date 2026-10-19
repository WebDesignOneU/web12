// src/routes/reservas.ts
import express from 'express';
import * as reservaController from '../controllers/reserva.controller';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middlewares/auth.middleware';
import { validarIdRuta } from '../middlewares/param.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Reservas
 *     description: Reserva de entradas para funciones
 */

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     summary: Lista las reservas con filtros (admin o director)
 *     tags: [Reservas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [confirmada, asistio, cancelada] }
 *       - in: query
 *         name: id_funcion
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista paginada de reservas
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Registra una reserva de entradas (público; invitado o con sesión)
 *     description: >
 *       Usa el procedimiento almacenado sp_registrar_reserva: valida cupos,
 *       registra o reutiliza al espectador por CI y genera un código de reserva
 *       (ej. BUCB-9A82). El trigger trg_descontar_cupos_reserva descuenta los asientos.
 *       Si la cuenta autenticada ya tiene un espectador vinculado, la reserva se
 *       registra sin vínculo para no duplicarlo.
 *     tags: [Reservas]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         description: Si hay token JWT, la reserva se vincula al usuario autenticado
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_funcion, cantidad_entradas, ci, nombre_completo, correo]
 *             properties:
 *               id_funcion: { type: integer, example: 1 }
 *               cantidad_entradas: { type: integer, minimum: 1, maximum: 10, example: 2 }
 *               ci: { type: string, example: '6849302 LP' }
 *               nombre_completo: { type: string, example: Camila Vargas Quiroga }
 *               correo: { type: string, format: email, example: camila.vargas@ucb.edu.bo }
 *               telefono: { type: string, example: '71542091' }
 *               es_estudiante_ucb: { type: boolean, example: true }
 *     responses:
 *       201:
 *         description: Reserva confirmada; devuelve el código de reserva
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: La función indicada no existe
 *       409:
 *         description: Sin cupos disponibles o la función no admite reservas
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'director'), reservaController.getAll);
router.post('/', optionalAuth, reservaController.create);

/**
 * @swagger
 * /api/reservas/codigo/{codigo}:
 *   get:
 *     summary: Consulta pública de una reserva por su código
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string }
 *         example: BUCB-9A82
 *     responses:
 *       200:
 *         description: Reserva encontrada con su función y espectador
 *       404:
 *         description: No existe una reserva con ese código
 *       500:
 *         description: Error interno del servidor
 */
router.get('/codigo/:codigo', reservaController.getByCodigo);

/**
 * @swagger
 * /api/reservas/{id}/cancelar:
 *   patch:
 *     summary: Cancela una reserva confirmada (admin o director)
 *     description: El trigger trg_restaurar_cupos_cancelacion devuelve los cupos a la función.
 *     tags: [Reservas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Reserva cancelada y cupos restaurados
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Reserva no encontrada
 *       409:
 *         description: La reserva no está en estado confirmada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/cancelar', authenticateToken, authorizeRoles('admin', 'director'), validarIdRuta, reservaController.cancelar);

/**
 * @swagger
 * /api/reservas/{id}/asistio:
 *   patch:
 *     summary: Marca la asistencia de una reserva a la función (admin o director)
 *     tags: [Reservas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Asistencia registrada
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Reserva no encontrada
 *       409:
 *         description: La reserva no está en estado confirmada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/asistio', authenticateToken, authorizeRoles('admin', 'director'), validarIdRuta, reservaController.marcarAsistencia);

export default router;
