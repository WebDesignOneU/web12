// src/services/noticia.service.ts
// CRUD de noticias del portal (tabla "noticias").
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db from '../config/db';
import Noticia, { type NoticiaRow } from '../models/noticia.entity';
import { ApiError } from '../utils/ApiError';
import { generarSlug } from '../utils/slugify';

interface TotalRow extends RowDataPacket {
  total: number;
}

export interface NoticiaFiltros {
  page?: unknown;
  limit?: unknown;
  destacado?: unknown;
}

export interface NoticiaListado {
  noticias: Noticia[];
  total: number;
  page: number;
  pages: number;
}

export interface NoticiaCreateInput {
  id_autor: number;
  titulo: string;
  contenido: string;
  imagen_url?: string | null;
  destacado?: boolean;
  slug?: string | null;
}

export interface NoticiaUpdateInput {
  titulo?: string;
  contenido?: string;
  imagen_url?: string | null;
  destacado?: boolean;
  slug?: string;
}

export class NoticiaService {
  // Listado paginado con filtro opcional por "destacado"
  static async getAll({ page = 1, limit = 10, destacado }: NoticiaFiltros = {}): Promise<NoticiaListado> {
    const pagina = Math.max(1, parseInt(String(page), 10) || 1);
    const porPagina = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));

    const condiciones: string[] = [];
    const parametros: Array<string | number> = [];
    if (destacado !== undefined && destacado !== '') {
      condiciones.push('n.destacado = ?');
      parametros.push(destacado === true || destacado === 'true' ? 1 : 0);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const [[{ total }]] = await db.query<TotalRow[]>(`SELECT COUNT(*) AS total FROM noticias n ${where}`, parametros);
    const [filas] = await db.query<NoticiaRow[]>(
      `SELECT n.*, u.email AS autor_email
             FROM noticias n
             INNER JOIN usuarios u ON u.id_usuario = n.id_autor
             ${where}
             ORDER BY n.fecha_publicacion DESC
             LIMIT ? OFFSET ?`,
      [...parametros, porPagina, (pagina - 1) * porPagina]
    );

    return {
      noticias: filas.map((fila) => new Noticia(fila)),
      total,
      page: pagina,
      pages: Math.ceil(total / porPagina)
    };
  }

  // Detalle público por slug (identificador de URL)
  static async getBySlug(slug: string): Promise<Noticia | null> {
    const [filas] = await db.query<NoticiaRow[]>(
      `SELECT n.*, u.email AS autor_email
             FROM noticias n
             INNER JOIN usuarios u ON u.id_usuario = n.id_autor
             WHERE n.slug = ? LIMIT 1`,
      [slug]
    );
    if (filas.length === 0) return null;
    return new Noticia(filas[0]);
  }

  // Detalle por ID (uso interno/administrativo)
  static async getById(id: number | string): Promise<Noticia | null> {
    const [filas] = await db.query<NoticiaRow[]>('SELECT * FROM noticias WHERE id_noticia = ? LIMIT 1', [id]);
    if (filas.length === 0) return null;
    return new Noticia(filas[0]);
  }

  // Crear noticia; el slug se genera desde el título si no viene en el cuerpo
  static async create({
    id_autor,
    titulo,
    contenido,
    imagen_url = null,
    destacado = false,
    slug = null
  }: NoticiaCreateInput): Promise<Noticia | null> {
    let slugFinal = slug || generarSlug(titulo);
    slugFinal = await this._slugUnico(slugFinal);

    try {
      const [resultado] = await db.query<ResultSetHeader>(
        `INSERT INTO noticias (id_autor, titulo, slug, contenido, imagen_url, destacado)
                 VALUES (?, ?, ?, ?, ?, ?)`,
        [id_autor, titulo.trim(), slugFinal, contenido.trim(), imagen_url, destacado ? 1 : 0]
      );
      return await this.getById(resultado.insertId);
    } catch (error) {
      if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new ApiError(409, 'El slug ya está en uso');
      throw error;
    }
  }

  // Actualización parcial (solo campos enviados)
  static async update(id: number | string, datos: NoticiaUpdateInput): Promise<Noticia | null> {
    const noticia = await this.getById(id);
    if (!noticia) return null;

    const campos: string[] = [];
    const valores: any[] = [];
    const mapa = {
      titulo: 'titulo',
      contenido: 'contenido',
      imagen_url: 'imagen_url',
      destacado: 'destacado'
    };
    Object.entries(mapa).forEach(([origen, destino]) => {
      const valor = (datos as Record<string, unknown>)[origen];
      if (valor !== undefined) {
        campos.push(`${destino} = ?`);
        valores.push(
          origen === 'destacado' ? (valor ? 1 : 0) : typeof valor === 'string' ? valor.trim() : valor
        );
      }
    });
    if (datos.slug !== undefined) {
      const slugUnico = await this._slugUnico(datos.slug, id);
      campos.push('slug = ?');
      valores.push(slugUnico);
    }

    if (campos.length > 0) {
      await db.query(`UPDATE noticias SET ${campos.join(', ')} WHERE id_noticia = ?`, [...valores, id]);
    }
    return await this.getById(id);
  }

  // Eliminar noticia
  static async remove(id: number | string): Promise<boolean> {
    const [resultado] = await db.query<ResultSetHeader>('DELETE FROM noticias WHERE id_noticia = ?', [id]);
    return resultado.affectedRows > 0;
  }

  // Asegura que el slug no colisione con otro (append -2, -3, ...)
  static async _slugUnico(slugBase: string, idExcluir: number | string | null = null): Promise<string> {
    let slug = slugBase;
    let sufijo = 1;
    for (;;) {
      const [filas] = await db.query<NoticiaRow[]>('SELECT id_noticia FROM noticias WHERE slug = ? LIMIT 1', [
        slug
      ]);
      if (filas.length === 0 || (idExcluir && filas[0].id_noticia === Number(idExcluir))) {
        return slug;
      }
      sufijo += 1;
      slug = `${slugBase}-${sufijo}`;
    }
  }
}

export default NoticiaService;
