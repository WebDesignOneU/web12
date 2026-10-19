// src/routes/funciones.ts
import express from 'express';
import * as funcionController from '../controllers/funcion.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validarIdRuta } from '../middlewares/param.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/funciones:
 *   get:
 *     summary: Lista las funciones programadas (público)
 *     tags: [Funciones]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [programada, agotada, cancelada, finalizada] }
 *         description: Filtra por estado de la función
 *       - in: query
 *         name: id_obra
 *         schema: { type: integer }
 *         description: Filtra por obra
 *     responses:
 *       200:
 *         description: Lista de funciones con datos de la obra y cupos
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crea una función para una obra (admin o director)
 *     tags: [Funciones]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_obra, fecha_hora, capacidad_total]
 *             properties:
 *               id_obra: { type: integer, example: 1 }
 *               fecha_hora: { type: string, example: '2026-11-15 19:30:00' }
 *               lugar: { type: string, example: Paraninfo Universitario UCB - La Paz }
 *               capacidad_total: { type: integer, example: 250 }
 *               estado: { type: string, enum: [programada, agotada, cancelada, finalizada], example: programada }
 *     responses:
 *       201:
 *         description: Función creada (los asientos disponibles parten de la capacidad)
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: La obra indicada no existe
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', funcionController.getAll);
router.post('/', authenticateToken, authorizeRoles('admin', 'director'), funcionController.create);

/**
 * @swagger
 * /api/funciones/reporte-ocupacion:
 *   get:
 *     summary: Reporte de ocupación de todas las funciones (admin o director)
 *     description: Generado por el procedimiento almacenado sp_reporte_ocupacion_funciones.
 *     tags: [Funciones]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte con capacidad, reservadas y porcentaje de ocupación
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reporte-ocupacion', authenticateToken, authorizeRoles('admin', 'director'), funcionController.reporteOcupacion);

/**
 * @swagger
 * /api/funciones/{id}:
 *   get:
 *     summary: Obtiene una función por ID (público)
 *     tags: [Funciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Función encontrada
 *       404:
 *         description: Función no encontrada
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualiza una función (admin o director)
 *     tags: [Funciones]
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
 *               fecha_hora: { type: string, example: '2026-11-15 20:00:00' }
 *               lugar: { type: string, example: Auditorio Campus San Pablo }
 *               capacidad_total: { type: integer, example: 300 }
 *               estado: { type: string, enum: [programada, agotada, cancelada, finalizada] }
 *     responses:
 *       200:
 *         description: Función actualizada
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Función no encontrada
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Elimina una función sin reservas activas (solo admin)
 *     tags: [Funciones]
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
 *         description: Función eliminada
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Función no encontrada
 *       409:
 *         description: La función tiene reservas asociadas
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validarIdRuta, funcionController.getById);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'director'), validarIdRuta, funcionController.update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validarIdRuta, funcionController.remove);

export default router;
