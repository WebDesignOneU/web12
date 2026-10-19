// src/routes/elenco.ts
import express from 'express';
import * as integranteController from '../controllers/integrante.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validarIdRuta } from '../middlewares/param.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Elenco
 *     description: Integrantes del elenco del Ballet UCB
 */

/**
 * @swagger
 * /api/elenco:
 *   get:
 *     summary: Lista el elenco (público; por defecto solo activos)
 *     tags: [Elenco]
 *     parameters:
 *       - in: query
 *         name: rol
 *         schema: { type: string, enum: [solista, cuerpo_de_ballet, director, maestro] }
 *         description: Filtra por rol dentro del elenco
 *       - in: query
 *         name: activo
 *         schema: { type: string, enum: ['true', 'false'] }
 *         description: Filtra por estado de actividad
 *     responses:
 *       200:
 *         description: Lista del elenco ordenada por jerarquía
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Agrega un integrante al elenco (solo admin)
 *     tags: [Elenco]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_completo, rol]
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 description: Vincula al integrante con su cuenta de acceso (opcional)
 *                 example: 3
 *               nombre_completo: { type: string, example: Valeria Mamani }
 *               rol: { type: string, enum: [solista, cuerpo_de_ballet, director, maestro], example: solista }
 *               fotografia_url: { type: string, example: /images/elenco/valeria.jpg }
 *               biografia: { type: string, example: Primera bailarina del Ballet UCB... }
 *               activo: { type: boolean, example: true }
 *     responses:
 *       201:
 *         description: Integrante agregado
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       409:
 *         description: La cuenta indicada ya está vinculada a otro integrante
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', integranteController.getAll);
router.post('/', authenticateToken, authorizeRoles('admin'), integranteController.create);

/**
 * @swagger
 * /api/elenco/{id}:
 *   get:
 *     summary: Obtiene un integrante por ID (público)
 *     tags: [Elenco]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Integrante encontrado
 *       404:
 *         description: Integrante no encontrado
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualiza un integrante (solo admin)
 *     tags: [Elenco]
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
 *               id_usuario: { type: integer, example: 3 }
 *               nombre_completo: { type: string }
 *               rol: { type: string, enum: [solista, cuerpo_de_ballet, director, maestro] }
 *               fotografia_url: { type: string }
 *               biografia: { type: string }
 *               activo: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: Integrante actualizado
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Integrante no encontrado
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Elimina un integrante del elenco (solo admin)
 *     tags: [Elenco]
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
 *         description: Integrante eliminado
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Integrante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validarIdRuta, integranteController.getById);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validarIdRuta, integranteController.update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validarIdRuta, integranteController.remove);

export default router;
