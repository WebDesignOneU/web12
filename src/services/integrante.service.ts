// src/services/integrante.service.ts
// Elenco del Ballet UCB (tabla "integrantes").
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db from '../config/db';
import Integrante, { type IntegranteRow } from '../models/integrante.entity';
import { ApiError } from '../utils/ApiError';

export interface IntegranteFiltros {
  rol?: unknown;
  activo?: unknown;
}

export interface IntegranteCreateInput {
  id_usuario?: number | null;
  nombre_completo: string;
  rol: string;
  fotografia_url?: string | null;
  biografia?: string | null;
  activo?: boolean;
}

export interface IntegranteUpdateInput {
  id_usuario?: number | null;
  nombre_completo?: string;
  rol?: string;
  fotografia_url?: string | null;
  biografia?: string | null;
  activo?: boolean;
}

export class IntegranteService {
  // Listado público; por defecto solo integrantes activos
  static async getAll({ rol, activo }: IntegranteFiltros = {}): Promise<Integrante[]> {
    const condiciones: string[] = [];
    const parametros: any[] = [];
    if (activo !== undefined && activo !== '') {
      condiciones.push('activo = ?');
      parametros.push(activo === true || activo === 'true' ? 1 : 0);
    }
    if (rol) {
      condiciones.push('rol = ?');
      parametros.push(rol);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const [filas] = await db.query<IntegranteRow[]>(
      `SELECT id_integrante, nombre_completo, rol, fotografia_url, biografia, activo
             FROM integrantes ${where}
             ORDER BY FIELD(rol, 'director', 'maestro', 'solista', 'cuerpo_de_ballet'), nombre_completo ASC`,
      parametros
    );
    return filas.map((fila) => new Integrante(fila));
  }

  static async getById(id: number | string): Promise<Integrante | null> {
    const [filas] = await db.query<IntegranteRow[]>('SELECT * FROM integrantes WHERE id_integrante = ? LIMIT 1', [id]);
    if (filas.length === 0) return null;
    return new Integrante(filas[0]);
  }

  static async create({
    id_usuario = null,
    nombre_completo,
    rol,
    fotografia_url = null,
    biografia = null,
    activo = true
  }: IntegranteCreateInput): Promise<Integrante | null> {
    // Si se vincula una cuenta, verificar que exista y no esté vinculada a otro integrante
    if (id_usuario) {
      const [vinculados] = await db.query<RowDataPacket[]>(
        'SELECT id_integrante FROM integrantes WHERE id_usuario = ? LIMIT 1',
        [id_usuario]
      );
      if (vinculados.length > 0) {
        throw new ApiError(409, 'La cuenta indicada ya está vinculada a otro integrante');
      }
    }
    const [resultado] = await db.query<ResultSetHeader>(
      'INSERT INTO integrantes (id_usuario, nombre_completo, rol, fotografia_url, biografia, activo) VALUES (?, ?, ?, ?, ?, ?)',
      [id_usuario, nombre_completo.trim(), rol, fotografia_url, biografia, activo ? 1 : 0]
    );
    return await this.getById(resultado.insertId);
  }

  static async update(id: number | string, datos: IntegranteUpdateInput): Promise<Integrante | null> {
    const integrante = await this.getById(id);
    if (!integrante) return null;

    const campos: string[] = [];
    const valores: any[] = [];
    for (const columna of ['nombre_completo', 'rol', 'fotografia_url', 'biografia'] as const) {
      const valor = datos[columna];
      if (valor !== undefined) {
        campos.push(`${columna} = ?`);
        valores.push(typeof valor === 'string' ? valor.trim() : valor);
      }
    }
    if (datos.id_usuario !== undefined) {
      campos.push('id_usuario = ?');
      valores.push(datos.id_usuario);
    }
    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo ? 1 : 0);
    }
    if (campos.length > 0) {
      await db.query(`UPDATE integrantes SET ${campos.join(', ')} WHERE id_integrante = ?`, [...valores, id]);
    }
    return await this.getById(id);
  }

  static async remove(id: number | string): Promise<boolean> {
    const [resultado] = await db.query<ResultSetHeader>('DELETE FROM integrantes WHERE id_integrante = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

export default IntegranteService;
