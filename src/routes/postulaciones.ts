// src/routes/postulaciones.ts
import express from 'express';
import * as postulacionController from '../controllers/postulacion.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validarIdRuta } from '../middlewares/param.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/postulaciones:
 *   get:
 *     summary: Lista las postulaciones con filtros (admin o director)
 *     tags: [Postulaciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [pendiente, preseleccionado, aceptado, rechazado] }
 *       - in: query
 *         name: id_convocatoria
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 20 }
 *     responses:
 *       200:
 *         description: Lista paginada de postulaciones
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'director'), postulacionController.getAll);

/**
 * @swagger
 * /api/postulaciones/{id}:
 *   get:
 *     summary: Obtiene una postulación por ID (admin o director)
 *     tags: [Postulaciones]
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
 *         description: Postulación encontrada
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Postulación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticateToken, authorizeRoles('admin', 'director'), validarIdRuta, postulacionController.getById);

/**
 * @swagger
 * /api/postulaciones/{id}/estado:
 *   patch:
 *     summary: Evalúa una postulación (admin o director)
 *     description: >
 *       Usa el procedimiento almacenado sp_evaluar_postulacion. Si el resultado
 *       es "aceptado" y la postulación tiene cuenta vinculada, el usuario asciende
 *       al rol "bailarin".
 *     tags: [Postulaciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado_evaluacion]
 *             properties:
 *               estado_evaluacion:
 *                 type: string
 *                 enum: [pendiente, preseleccionado, aceptado, rechazado]
 *                 example: aceptado
 *     responses:
 *       200:
 *         description: Postulación evaluada
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Postulación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/estado', authenticateToken, authorizeRoles('admin', 'director'), validarIdRuta, postulacionController.evaluar);

export default router;
