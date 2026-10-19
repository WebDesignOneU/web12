// src/types/express.d.ts
// Aumenta el tipo Request de Express para incluir el usuario autenticado (JWT).
// Se declara como módulo (export {}) para poder usar `declare global`.
export {};

declare global {
  namespace Express {
    interface Request {
      // Lo adjuntan los middlewares authenticateToken / optionalAuth.
      user?: { id: number; email: string; rol: string } | null;
    }
  }
}
