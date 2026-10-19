// src/services/suscriptor.service.ts
// Suscripciones al boletín de noticias (tabla "suscriptores").
import type { ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';
import Suscriptor, { type SuscriptorRow } from '../models/suscriptor.entity';
import { ApiError } from '../utils/ApiError';

export interface SuscriptorCreateInput {
  email: string;
  nombre?: string | null;
}

export interface SuscriptorFiltros {
  estado?: unknown;
}

export class SuscriptorService {
  // Alta de suscripción. Si el email ya existe se reactiva (estado 'activo').
  static async suscribir({ email, nombre = null }: SuscriptorCreateInput): Promise<Suscriptor> {
    try {
      await db.query(
        `INSERT INTO suscriptores (email, nombre)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE
                    nombre = COALESCE(VALUES(nombre), nombre),
                    estado = 'activo'`,
        [email.trim().toLowerCase(), nombre ? nombre.trim() : null]
      );
    } catch (error) {
      if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new ApiError(409, 'El email ya está suscrito');
      throw error;
    }

    const [filas] = await db.query<SuscriptorRow[]>('SELECT * FROM suscriptores WHERE email = ? LIMIT 1', [
      email.trim().toLowerCase()
    ]);
    return new Suscriptor(filas[0]);
  }

  // Baja de suscripción (estado 'desuscrito')
  static async desuscribir(email: string): Promise<Suscriptor> {
    const correo = email.trim().toLowerCase();
    const [resultado] = await db.query<ResultSetHeader>(
      "UPDATE suscriptores SET estado = 'desuscrito' WHERE email = ? AND estado = 'activo'",
      [correo]
    );
    if (resultado.affectedRows === 0) {
      const [existe] = await db.query<SuscriptorRow[]>('SELECT * FROM suscriptores WHERE email = ? LIMIT 1', [correo]);
      if (existe.length === 0) throw new ApiError(404, 'El email no está suscrito');
      throw new ApiError(409, 'La suscripción ya estaba dada de baja');
    }
    const [filas] = await db.query<SuscriptorRow[]>('SELECT * FROM suscriptores WHERE email = ? LIMIT 1', [correo]);
    return new Suscriptor(filas[0]);
  }

  // Listado general (solo administración)
  static async getAll({ estado }: SuscriptorFiltros = {}): Promise<Suscriptor[]> {
    const condiciones: string[] = [];
    const parametros: any[] = [];
    if (estado) {
      condiciones.push('estado = ?');
      parametros.push(estado);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const [filas] = await db.query<SuscriptorRow[]>(
      `SELECT * FROM suscriptores ${where} ORDER BY fecha_suscripcion DESC`,
      parametros
    );
    return filas.map((fila) => new Suscriptor(fila));
  }
}

export default SuscriptorService;
