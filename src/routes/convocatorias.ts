// src/routes/convocatorias.ts
import express from 'express';
import * as convocatoriaController from '../controllers/convocatoria.controller';
import * as postulacionController from '../controllers/postulacion.controller';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middlewares/auth.middleware';
import { validarIdRuta } from '../middlewares/param.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Postulaciones
 *     description: Convocatorias y postulaciones al elenco del Ballet UCB
 */

/**
 * @swagger
 * /api/convocatorias:
 *   get:
 *     summary: Lista las convocatorias con su total de postulaciones (público)
 *     tags: [Postulaciones]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [abierta, cerrada] }
 *         description: Filtra por estado de la convocatoria
 *     responses:
 *       200:
 *         description: Lista de convocatorias
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crea una convocatoria (admin o director)
 *     tags: [Postulaciones]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, fecha_inicio, fecha_fin]
 *             properties:
 *               titulo: { type: string, example: Audiciones Elenco General I/2026 }
 *               fecha_inicio: { type: string, format: date, example: '2026-10-01' }
 *               fecha_fin: { type: string, format: date, example: '2026-11-30' }
 *               requisitos: { type: string, example: Mínimo 2 años de formación en danza... }
 *               estado: { type: string, enum: [abierta, cerrada], example: abierta }
 *     responses:
 *       201:
 *         description: Convocatoria creada
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', convocatoriaController.getAll);
router.post('/', authenticateToken, authorizeRoles('admin', 'director'), convocatoriaController.create);

/**
 * @swagger
 * /api/convocatorias/{id}:
 *   get:
 *     summary: Obtiene una convocatoria por ID (público)
 *     tags: [Postulaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Convocatoria encontrada
 *       404:
 *         description: Convocatoria no encontrada
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualiza una convocatoria (admin o director)
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
 *             properties:
 *               titulo: { type: string }
 *               fecha_inicio: { type: string, format: date }
 *               fecha_fin: { type: string, format: date }
 *               requisitos: { type: string }
 *               estado: { type: string, enum: [abierta, cerrada] }
 *     responses:
 *       200:
 *         description: Convocatoria actualizada
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Convocatoria no encontrada
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Elimina una convocatoria (solo admin)
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
 *         description: Convocatoria eliminada
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Convocatoria no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validarIdRuta, convocatoriaController.getById);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'director'), validarIdRuta, convocatoriaController.update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validarIdRuta, convocatoriaController.remove);

/**
 * @swagger
 * /api/convocatorias/{id}/postulaciones:
 *   post:
 *     summary: Registra una postulación a una convocatoria (público)
 *     description: >
 *       Solo se aceptan postulaciones a convocatorias abiertas y dentro de su
 *       período. Si el solicitante tiene sesión activa, la postulación se vincula
 *       a su cuenta de usuario.
 *     tags: [Postulaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *       - in: header
 *         name: Authorization
 *         required: false
 *         description: Token JWT opcional para vincular la postulación a una cuenta
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_completo, ci, email, telefono]
 *             properties:
 *               nombre_completo: { type: string, example: Mateo Morales Siles }
 *               ci: { type: string, example: '8930219 LP' }
 *               email: { type: string, format: email, example: mateo.morales@ucb.edu.bo }
 *               telefono: { type: string, example: '77291039' }
 *               carrera_ucb: { type: string, example: Comunicación Social }
 *               experiencia_anios: { type: integer, example: 3 }
 *               estilo_danza: { type: string, example: Danza Contemporánea }
 *               link_video_demo: { type: string, example: 'https://youtube.com/watch?v=demo' }
 *     responses:
 *       201:
 *         description: Postulación registrada
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Convocatoria no encontrada
 *       409:
 *         description: Convocatoria cerrada/vencida o postulación duplicada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/postulaciones', validarIdRuta, optionalAuth, postulacionController.create);

export default router;
