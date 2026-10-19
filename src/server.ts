// src/server.ts
// Punto de entrada de la API (npm start / npm run dev)
import 'dotenv/config';
import app from './app'; // importa src/config/db.ts, que valida la conexión a MySQL
import './config/db';

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 3000;

// La documentación Swagger (/api-docs) se monta en app.ts y solo se activa
// fuera de producción: expone el detalle de los endpoints y no debería quedar
// pública en un entorno real.
app.listen(PORT, () => {
  console.log(`[Server] API Ballet UCB (TypeScript) corriendo en http://localhost:${PORT} (${NODE_ENV})`);
  if (NODE_ENV !== 'production') {
    console.log(`[Server] Documentación disponible en http://localhost:${PORT}/api-docs`);
  }
});
