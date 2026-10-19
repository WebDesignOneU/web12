// src/routes/noticias.ts
import express from 'express';
import * as noticiaController from '../controllers/noticia.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { validarIdRuta } from '../middlewares/param.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Noticias
 *     description: Noticias y suscripciones del Ballet UCB
 */

/**
 * @swagger
 * /api/noticias:
 *   get:
 *     summary: Lista las noticias del portal (público, paginado)
 *     tags: [Noticias]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *         description: Página a consultar
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *         description: Elementos por página (máx. 50)
 *       - in: query
 *         name: destacado
 *         schema: { type: string, enum: ['true', 'false'] }
 *         description: Filtra noticias destacadas
 *     responses:
 *       200:
 *         description: Lista paginada de noticias
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', noticiaController.getAll);

/**
 * @swagger
 * /api/noticias/{slug}:
 *   get:
 *     summary: Obtiene una noticia por su slug (público)
 *     tags: [Noticias]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: apertura-temporada-2026-lago-cisnes
 *     responses:
 *       200:
 *         description: Noticia encontrada
 *       404:
 *         description: Noticia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:slug', noticiaController.getBySlug);

/**
 * @swagger
 * /api/noticias:
 *   post:
 *     summary: Crea una noticia (admin o director; el autor es el usuario autenticado)
 *     tags: [Noticias]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, contenido]
 *             properties:
 *               titulo:
 *                 type: string
 *                 maxLength: 200
 *                 example: Apertura de Temporada 2026
 *               contenido:
 *                 type: string
 *                 example: El Ballet UCB presenta su nueva temporada artística...
 *               imagen_url:
 *                 type: string
 *                 example: /images/noticias/temporada-2026.jpg
 *               destacado:
 *                 type: boolean
 *                 example: false
 *               slug:
 *                 type: string
 *                 description: Opcional; se genera desde el título si no se envía
 *                 example: apertura-temporada-2026
 *     responses:
 *       201:
 *         description: Noticia creada
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticateToken, authorizeRoles('admin', 'director'), noticiaController.create);

/**
 * @swagger
 * /api/noticias/{id}:
 *   put:
 *     summary: Actualiza una noticia (admin o director)
 *     tags: [Noticias]
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
 *               titulo: { type: string, example: Título actualizado }
 *               contenido: { type: string, example: Contenido actualizado... }
 *               imagen_url: { type: string, example: /images/noticias/nueva.jpg }
 *               destacado: { type: boolean, example: true }
 *               slug: { type: string, example: titulo-actualizado }
 *     responses:
 *       200:
 *         description: Noticia actualizada
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Noticia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authenticateToken, authorizeRoles('admin', 'director'), validarIdRuta, noticiaController.update);

/**
 * @swagger
 * /api/noticias/{id}:
 *   delete:
 *     summary: Elimina una noticia (solo admin)
 *     tags: [Noticias]
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
 *         description: Noticia eliminada
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       404:
 *         description: Noticia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), validarIdRuta, noticiaController.remove);

export default router;
