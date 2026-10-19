// src/models/obra.entity.ts
import type { RowDataPacket } from 'mysql2';
import type { Funcion } from './funcion.entity';

export interface ObraRow extends RowDataPacket {
  id_obra: number;
  titulo: string;
  descripcion: string | null;
  director: string | null;
  imagen_banner: string | null;
}

// "funciones" (opcional) contiene las funciones programadas asociadas (detalle)
export interface ObraInput extends ObraRow {
  funciones?: Funcion[] | null;
}

export class Obra {
  id_obra: number;
  titulo: string;
  descripcion: string | null;
  director: string | null;
  imagen_banner: string | null;
  funciones: Funcion[] | null;

  constructor({ id_obra, titulo, descripcion, director, imagen_banner, funciones = null }: ObraInput) {
    this.id_obra = id_obra;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.director = director;
    this.imagen_banner = imagen_banner;
    this.funciones = funciones;
  }
}

export default Obra;
