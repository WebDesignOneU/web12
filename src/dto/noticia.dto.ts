// src/dto/noticia.dto.ts
import type { Noticia } from '../models/noticia.entity';

export class NoticiaDTO {
  id: number;
  titulo: string;
  slug: string;
  contenido: string;
  imagenUrl: string | null;
  fechaPublicacion: string;
  destacado: boolean;
  autor?: { email: string };

  constructor({
    id_noticia,
    titulo,
    slug,
    contenido,
    imagen_url,
    fecha_publicacion,
    destacado,
    autor_email = null
  }: Noticia) {
    this.id = id_noticia;
    this.titulo = titulo;
    this.slug = slug;
    this.contenido = contenido;
    this.imagenUrl = imagen_url;
    this.fechaPublicacion = fecha_publicacion;
    this.destacado = Boolean(destacado);
    this.autor = autor_email ? { email: autor_email } : undefined;
  }
}

export default NoticiaDTO;
