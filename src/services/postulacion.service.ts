// src/services/postulacion.service.ts
// Postulaciones al elenco (tabla "postulaciones"). La evaluación usa el
// procedimiento sp_evaluar_postulacion (asciende a 'bailarin' al ser aceptado).
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db from '../config/db';
import Postulacion, { type PostulacionRow } from '../models/postulacion.entity';
import { ApiError } from '../utils/ApiError';

interface TotalRow extends RowDataPacket {
  total: number;
}

interface ConvocatoriaEstadoRow extends RowDataPacket {
  estado: string;
  vigente: number;
}

const SELECT_POSTULACION = `
    SELECT p.*, c.titulo AS convocatoria_titulo
    FROM postulaciones p
    INNER JOIN convocatorias c ON c.id_convocatoria = p.id_convocatoria`;

export interface PostulacionCreateInput {
  id_convocatoria: number;
  id_usuario?: number | null;
  nombre_completo: string;
  ci: string;
  email: string;
  telefono: string;
  carrera_ucb?: string | null;
  experiencia_anios?: number;
  estilo_danza?: string | null;
  link_video_demo?: string | null;
}

export interface PostulacionFiltros {
  estado?: unknown;
  id_convocatoria?: unknown;
  page?: unknown;
  limit?: unknown;
}

export interface PostulacionListado {
  postulaciones: Postulacion[];
  total: number;
  page: number;
  pages: number;
}

export class PostulacionService {
  // Nueva postulación pública; valida que la convocatoria esté abierta y vigente
  static async create({
    id_convocatoria,
    id_usuario = null,
    nombre_completo,
    ci,
    email,
    telefono,
    carrera_ucb = null,
    experiencia_anios = 0,
    estilo_danza = null,
    link_video_demo = null
  }: PostulacionCreateInput): Promise<Postulacion | null> {
    // Verificar convocatoria abierta y dentro de su rango de fechas (en BD)
    const [convocatorias] = await db.query<ConvocatoriaEstadoRow[]>(
      `SELECT estado, (CURDATE() BETWEEN fecha_inicio AND fecha_fin) AS vigente
             FROM convocatorias WHERE id_convocatoria = ? LIMIT 1`,
      [id_convocatoria]
    );
    if (convocatorias.length === 0) throw new ApiError(404, 'La convocatoria indicada no existe');
    if (convocatorias[0].estado !== 'abierta' || !Number(convocatorias[0].vigente)) {
      throw new ApiError(409, 'La convocatoria no está abierta o ya finalizó su período de recepción');
    }

    // Evitar postulaciones duplicadas del mismo CI a la misma convocatoria
    const [duplicada] = await db.query<RowDataPacket[]>(
      'SELECT id_postulacion FROM postulaciones WHERE id_convocatoria = ? AND ci = ? LIMIT 1',
      [id_convocatoria, ci.trim()]
    );
    if (duplicada.length > 0) {
      throw new ApiError(409, 'Ya existe una postulación con este carnét para esta convocatoria');
    }

    const [resultado] = await db.query<ResultSetHeader>(
      `INSERT INTO postulaciones
                (id_convocatoria, id_usuario, nombre_completo, ci, email, telefono, carrera_ucb, experiencia_anios, estilo_danza, link_video_demo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_convocatoria,
        id_usuario,
        nombre_completo.trim(),
        ci.trim(),
        email.trim().toLowerCase(),
        telefono.trim(),
        carrera_ucb,
        experiencia_anios,
        estilo_danza,
        link_video_demo
      ]
    );
    return await this.getById(resultado.insertId);
  }

  static async getAll({ estado, id_convocatoria, page = 1, limit = 20 }: PostulacionFiltros = {}): Promise<PostulacionListado> {
    const pagina = Math.max(1, parseInt(String(page), 10) || 1);
    const porPagina = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));

    const condiciones: string[] = [];
    const parametros: any[] = [];
    if (estado) {
      condiciones.push('p.estado_evaluacion = ?');
      parametros.push(estado);
    }
    if (id_convocatoria) {
      condiciones.push('p.id_convocatoria = ?');
      parametros.push(id_convocatoria);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const [[{ total }]] = await db.query<TotalRow[]>(
      `SELECT COUNT(*) AS total FROM postulaciones p ${where}`,
      parametros
    );
    const [filas] = await db.query<PostulacionRow[]>(
      `${SELECT_POSTULACION} ${where} ORDER BY p.fecha_postulacion DESC LIMIT ? OFFSET ?`,
      [...parametros, porPagina, (pagina - 1) * porPagina]
    );

    return {
      postulaciones: filas.map((fila) => new Postulacion(fila)),
      total,
      page: pagina,
      pages: Math.ceil(total / porPagina)
    };
  }

  static async getById(id: number | string): Promise<Postulacion | null> {
    const [filas] = await db.query<PostulacionRow[]>(`${SELECT_POSTULACION} WHERE p.id_postulacion = ? LIMIT 1`, [id]);
    if (filas.length === 0) return null;
    return new Postulacion(filas[0]);
  }

  // Evaluar postulación mediante sp_evaluar_postulacion (transacción en BD).
  // Si se acepta y la postulación tiene usuario vinculado, asciende a 'bailarin'.
  static async evaluar(id: number | string, nuevoEstado: string): Promise<Postulacion | null> {
    const postulacion = await this.getById(id);
    if (!postulacion) return null;

    const conexion: PoolConnection = await db.getConnection();
    try {
      await conexion.query('CALL sp_evaluar_postulacion(?, ?)', [id, nuevoEstado]);
    } finally {
      conexion.release();
    }
    return await this.getById(id);
  }
}

export default PostulacionService;
