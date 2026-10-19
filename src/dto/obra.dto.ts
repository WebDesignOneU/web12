// src/dto/obra.dto.ts
import type { Funcion } from '../models/funcion.entity';
import type { FuncionDTO } from './funcion.dto';

export interface ObraDTOInput {
  id_obra: number;
  titulo: string;
  descripcion: string | null;
  director: string | null;
  imagen_banner: string | null;
  funciones?: Array<Funcion | FuncionDTO> | null;
}

export class ObraDTO {
  id: number;
  titulo: string;
  descripcion: string | null;
  director: string | null;
  imagenBanner: string | null;
  funciones?: Array<Funcion | FuncionDTO>;

  constructor({ id_obra, titulo, descripcion, director, imagen_banner, funciones = null }: ObraDTOInput) {
    this.id = id_obra;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.director = director;
    this.imagenBanner = imagen_banner;
    if (funciones) this.funciones = funciones; // próximas funciones (detalle)
  }
}

export default ObraDTO;
