// src/routes/obras.ts
import express from 'express';
import * as obraController from '../controllers/obra.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validarIdRuta } from '../middlewares/param.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/obras:
 *   get:
 *     summary: Lista las obras del repertorio (público)
 *     tags: [Funciones]
 *     responses:
 *       200:
 *         description: Lista de obras
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obraController.getAll);

/**
 * @swagger
 * /api/obras/{id}:
 *   get:
 *     summary: Obtiene una obra con sus funciones programadas (público)
 *     tags: [Funciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Obra encontrada
 *       404:
 *         description: Obra no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validarIdRuta, obraController.getById);

/**
 * @swagger
 * /api/obras:
 *   post:
 *     summary: Crea una obra (admin o director)
 *     tags: [Funciones]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo]
 *             properties:
 *               titulo: { type: string, maxLength: 150, example: El Lago de los Cisnes }
 *               descripcion: { type: string, example: Obra maestra del ballet clásico... }
 *               director: { type: string, example: Lic. Ana Maria Zeballos }
 *               imagen_banner: { type: string, example: /images/obras/banner-lago.jpg }
 *     responses:
 *       201:
 *         description: Obra creada
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticateToken, authorizeRoles('admin', 'director'), obraController.create);

/**
 * @swagger
 * /api/obras/{id}:
 *   put:
 *     summary: Actualiza una obra (admin o director)
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
 *               titulo: { type: string, example: El Lago de los Cisnes (edición 2026) }
 *               descripcion: { type: string }
 *               director: { type: string }
 *               imagen_banner: { type: string }
 *     responses:
 *       200:
 *         description: Obra actualizada
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Obra no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authenticateToken, authorizeRoles('admin', 'director'), validarIdRuta, obraController.update);

/**
 * @swagger
 * /api/obras/{id}:
 *   delete:
 *     summary: Elimina una obra y sus funciones en cascada (solo admin)
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
 *         description: Obra eliminada
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Obra no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validarIdRuta, obraController.remove);

export default router;
