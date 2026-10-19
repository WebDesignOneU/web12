// src/services/obra.service.ts
// CRUD de obras (tabla "obras"), con sus funciones asociadas.
import type { ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';
import Obra, { type ObraRow } from '../models/obra.entity';
import Funcion, { type FuncionRow } from '../models/funcion.entity';

export interface ObraCreateInput {
  titulo: string;
  descripcion?: string | null;
  director?: string | null;
  imagen_banner?: string | null;
}

export interface ObraUpdateInput {
  titulo?: string;
  descripcion?: string | null;
  director?: string | null;
  imagen_banner?: string | null;
}

export class ObraService {
  static async getAll(): Promise<Obra[]> {
    const [filas] = await db.query<ObraRow[]>('SELECT * FROM obras ORDER BY titulo ASC');
    return filas.map((fila) => new Obra(fila));
  }

  // Incluye las funciones programadas de la obra
  static async getById(id: number | string): Promise<Obra | null> {
    const [filas] = await db.query<ObraRow[]>('SELECT * FROM obras WHERE id_obra = ? LIMIT 1', [id]);
    if (filas.length === 0) return null;

    const [funciones] = await db.query<FuncionRow[]>(
      `SELECT f.*, o.titulo AS obra_titulo
             FROM funciones f
             INNER JOIN obras o ON o.id_obra = f.id_obra
             WHERE f.id_obra = ? AND f.estado = 'programada'
             ORDER BY f.fecha_hora ASC`,
      [id]
    );
    return new Obra({ ...filas[0], funciones: funciones.map((fila) => new Funcion(fila)) });
  }

  static async create({
    titulo,
    descripcion = null,
    director = null,
    imagen_banner = null
  }: ObraCreateInput): Promise<Obra | null> {
    const [resultado] = await db.query<ResultSetHeader>(
      'INSERT INTO obras (titulo, descripcion, director, imagen_banner) VALUES (?, ?, ?, ?)',
      [titulo.trim(), descripcion, director ? director.trim() : null, imagen_banner]
    );
    return await this.getById(resultado.insertId);
  }

  static async update(id: number | string, datos: ObraUpdateInput): Promise<Obra | null> {
    const obra = await this.getById(id);
    if (!obra) return null;

    const campos: string[] = [];
    const valores: any[] = [];
    for (const columna of ['titulo', 'descripcion', 'director', 'imagen_banner'] as const) {
      const valor = datos[columna];
      if (valor !== undefined) {
        campos.push(`${columna} = ?`);
        valores.push(typeof valor === 'string' ? valor.trim() : valor);
      }
    }
    if (campos.length > 0) {
      await db.query(`UPDATE obras SET ${campos.join(', ')} WHERE id_obra = ?`, [...valores, id]);
    }
    return await this.getById(id);
  }

  static async remove(id: number | string): Promise<boolean> {
    // Las funciones hijas se eliminan en cascada (ON DELETE CASCADE)
    const [resultado] = await db.query<ResultSetHeader>('DELETE FROM obras WHERE id_obra = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

export default ObraService;
