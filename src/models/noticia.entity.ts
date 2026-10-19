// src/models/noticia.entity.ts
import type { RowDataPacket } from 'mysql2';

export interface NoticiaRow extends RowDataPacket {
  id_noticia: number;
  id_autor: number;
  titulo: string;
  slug: string;
  contenido: string;
  imagen_url: string | null;
  fecha_publicacion: string;
  destacado: number | boolean;
  // "autor_email" proviene del JOIN con usuarios en NoticiaService.getAll/getBySlug
  autor_email?: string | null;
}

export class Noticia {
  id_noticia: number;
  id_autor: number;
  titulo: string;
  slug: string;
  contenido: string;
  imagen_url: string | null;
  fecha_publicacion: string;
  destacado: number | boolean;
  autor_email: string | null;

  constructor({
    id_noticia,
    id_autor,
    titulo,
    slug,
    contenido,
    imagen_url,
    fecha_publicacion,
    destacado,
    autor_email = null
  }: NoticiaRow) {
    this.id_noticia = id_noticia;
    this.id_autor = id_autor;
    this.titulo = titulo;
    this.slug = slug;
    this.contenido = contenido;
    this.imagen_url = imagen_url;
    this.fecha_publicacion = fecha_publicacion;
    this.destacado = destacado;
    this.autor_email = autor_email;
  }
}

export default Noticia;
