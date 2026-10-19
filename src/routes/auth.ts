// src/routes/auth.ts
import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticación y gestión de sesiones
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Auto-registro de usuario (roles espectador o postulante)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: camila.vargas@ucb.edu.bo
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "Password.123"
 *               rol:
 *                 type: string
 *                 enum: [espectador, postulante]
 *                 example: espectador
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: El email ya está registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin.ballet@ucb.edu.bo
 *               password:
 *                 type: string
 *                 example: "Password.123"
 *     responses:
 *       200:
 *         description: Devuelve el token JWT y los datos del usuario
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Credenciales incorrectas
 *       403:
 *         description: La cuenta está inactiva o bloqueada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/perfil', authenticateToken, authController.getPerfil);

export default router;
