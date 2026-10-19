// src/app.ts
// Configuración de la aplicación Express: middlewares globales y rutas.
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

// Rutas por módulo del portal
import authRoutes from './routes/auth';
import noticiasRoutes from './routes/noticias';
import suscriptoresRoutes from './routes/suscriptores';
import obrasRoutes from './routes/obras';
import funcionesRoutes from './routes/funciones';
import reservasRoutes from './routes/reservas';
import convocatoriasRoutes from './routes/convocatorias';
import postulacionesRoutes from './routes/postulaciones';
import elencoRoutes from './routes/elenco';

const app = express();

app.use(cors());
app.use(express.json()); // parseo de JSON en el cuerpo de las peticiones

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'API Ballet UCB operativa', fecha: new Date().toISOString() });
});

// Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/suscriptores', suscriptoresRoutes);
app.use('/api/obras', obrasRoutes);
app.use('/api/funciones', funcionesRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/convocatorias', convocatoriasRoutes);
app.use('/api/postulaciones', postulacionesRoutes);
app.use('/api/elenco', elencoRoutes);

// Documentación Swagger (solo fuera de producción). Se monta antes del 404.
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', ...swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 404: ruta no encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejador global de errores (ej: JSON mal formado)
app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, message: 'JSON inválido en el cuerpo de la petición' });
    return;
  }
  console.error('[API] Error no controlado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

export default app;
