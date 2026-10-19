// src/middlewares/auth.middleware.ts
// Middlewares de autenticación (JWT) y autorización por rol.
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

interface UsuarioToken {
  id: number;
  email: string;
  rol: string;
}

const obtenerSecreto = (): string => process.env.JWT_SECRET as string;

// Exige token JWT válido en el header "Authorization: Bearer <token>"
export const authenticateToken: RequestHandler = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, message: 'Acceso denegado, token no proporcionado' });
    return;
  }
  try {
    // { id, email, rol }
    req.user = jwt.verify(token, obtenerSecreto()) as UsuarioToken;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

// Debe usarse después de authenticateToken: restringe por rol.
// Ej: authorizeRoles('admin', 'director')
export const authorizeRoles = (...rolesPermitidos: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Autenticación requerida' });
      return;
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta operación' });
      return;
    }
    next();
  };
};

// Adjunta req.user si hay token; si no lo hay (o es inválido) continúa como invitado.
// Útil para endpoints públicos que se enriquecen con datos del usuario logueado.
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, obtenerSecreto()) as UsuarioToken;
    } catch {
      req.user = null;
    }
  }
  next();
};
