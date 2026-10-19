// src/routes/suscriptores.ts
import express from 'express';
import * as suscriptorController from '../controllers/suscriptor.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/suscriptores:
 *   get:
 *     summary: Lista los suscriptores (solo admin)
 *     tags: [Noticias]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [activo, desuscrito] }
 *         description: Filtra por estado de suscripción
 *     responses:
 *       200:
 *         description: Lista de suscriptores
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Rol sin permisos
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Suscribe un email al boletín de noticias (público)
 *     tags: [Noticias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.gomez@gmail.com
 *               nombre:
 *                 type: string
 *                 example: María Gómez
 *     responses:
 *       201:
 *         description: Suscripción registrada (o reactivada)
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Da de baja una suscripción por email (público)
 *     tags: [Noticias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.gomez@gmail.com
 *     responses:
 *       200:
 *         description: Suscripción dada de baja
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: El email no estaba suscrito
 *       409:
 *         description: La suscripción ya estaba dada de baja
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticateToken, authorizeRoles('admin'), suscriptorController.getAll);
router.post('/', suscriptorController.suscribir);
router.delete('/', suscriptorController.desuscribir);

export default router;
