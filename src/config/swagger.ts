// src/config/swagger.ts
// Definición OpenAPI 3 generada a partir de los JSDoc @swagger de src/routes.
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

// glob (usado por swagger-jsdoc) interpreta "\" como carácter de escape en
// Windows; por eso se normaliza a "/" para que encuentre los archivos de rutas.
const glob = (patron: string): string => patron.replace(/\\/g, '/');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Ballet UCB',
      version: '1.0.0',
      description:
        'API REST del portal web del Ballet de la Universidad Católica Boliviana (UCB). Gestiona autenticación, noticias, funciones, reservas de entradas y postulaciones al elenco. Versión Express + TypeScript.',
      contact: {
        name: 'Ballet UCB',
        email: 'ballet@ucb.edu.bo'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido en POST /api/auth/login'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Mensaje de error' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y gestión de sesiones' },
      { name: 'Noticias', description: 'Noticias del Ballet UCB' },
      { name: 'Funciones', description: 'Obras y funciones programadas' },
      { name: 'Reservas', description: 'Reserva de entradas para funciones' },
      { name: 'Postulaciones', description: 'Postulaciones al elenco del Ballet UCB' },
      { name: 'Elenco', description: 'Integrantes del elenco del Ballet UCB' }
    ]
  },
  // En desarrollo se ejecuta con ts-node (rutas *.ts); tras `npm run build`
  // se ejecuta el código compilado en dist/ (rutas *.js). Se incluyen ambas.
  apis: [
    glob(path.resolve(__dirname, '../routes/*.ts')),
    glob(path.resolve(__dirname, '../routes/*.js'))
  ]
};

export default swaggerJsdoc(options);
