// src/services/convocatoria.service.ts
// Convocatorias de audiciones (tabla "convocatorias").
import type { ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';
import Convocatoria, { type ConvocatoriaRow } from '../models/convocatoria.entity';

const SELECT_CONVOCATORIA = `
    SELECT c.*, (SELECT COUNT(*) FROM postulaciones p WHERE p.id_convocatoria = c.id_convocatoria) AS total_postulaciones
    FROM convocatorias c`;

export interface ConvocatoriaFiltros {
  estado?: unknown;
}

export interface ConvocatoriaCreateInput {
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  requisitos?: string | null;
  estado?: string;
}

export interface ConvocatoriaUpdateInput {
  titulo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  requisitos?: string | null;
  estado?: string;
}

export class ConvocatoriaService {
  static async getAll({ estado }: ConvocatoriaFiltros = {}): Promise<Convocatoria[]> {
    const condiciones: string[] = [];
    const parametros: any[] = [];
    if (estado) {
      condiciones.push('c.estado = ?');
      parametros.push(estado);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const [filas] = await db.query<ConvocatoriaRow[]>(
      `${SELECT_CONVOCATORIA} ${where} ORDER BY c.fecha_inicio DESC`,
      parametros
    );
    return filas.map((fila) => new Convocatoria(fila));
  }

  static async getById(id: number | string): Promise<Convocatoria | null> {
    const [filas] = await db.query<ConvocatoriaRow[]>(`${SELECT_CONVOCATORIA} WHERE c.id_convocatoria = ? LIMIT 1`, [
      id
    ]);
    if (filas.length === 0) return null;
    return new Convocatoria(filas[0]);
  }

  static async create({
    titulo,
    fecha_inicio,
    fecha_fin,
    requisitos = null,
    estado = 'abierta'
  }: ConvocatoriaCreateInput): Promise<Convocatoria | null> {
    const [resultado] = await db.query<ResultSetHeader>(
      'INSERT INTO convocatorias (titulo, fecha_inicio, fecha_fin, requisitos, estado) VALUES (?, ?, ?, ?, ?)',
      [titulo.trim(), fecha_inicio, fecha_fin, requisitos, estado]
    );
    return await this.getById(resultado.insertId);
  }

  static async update(id: number | string, datos: ConvocatoriaUpdateInput): Promise<Convocatoria | null> {
    const convocatoria = await this.getById(id);
    if (!convocatoria) return null;

    const campos: string[] = [];
    const valores: any[] = [];
    for (const columna of ['titulo', 'fecha_inicio', 'fecha_fin', 'requisitos', 'estado'] as const) {
      const valor = datos[columna];
      if (valor !== undefined) {
        campos.push(`${columna} = ?`);
        valores.push(typeof valor === 'string' ? valor.trim() : valor);
      }
    }
    if (campos.length > 0) {
      await db.query(`UPDATE convocatorias SET ${campos.join(', ')} WHERE id_convocatoria = ?`, [...valores, id]);
    }
    return await this.getById(id);
  }

  static async remove(id: number | string): Promise<boolean> {
    const [resultado] = await db.query<ResultSetHeader>('DELETE FROM convocatorias WHERE id_convocatoria = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

export default ConvocatoriaService;
