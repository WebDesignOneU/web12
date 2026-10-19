// src/models/convocatoria.entity.ts
import type { RowDataPacket } from 'mysql2';

export interface ConvocatoriaRow extends RowDataPacket {
  id_convocatoria: number;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  requisitos: string | null;
  estado: string;
  // "total_postulaciones" proviene de la subconsulta COUNT en ConvocatoriaService
  total_postulaciones?: number | null;
}

export class Convocatoria {
  id_convocatoria: number;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  requisitos: string | null;
  estado: string;
  total_postulaciones: number | null;

  constructor({
    id_convocatoria,
    titulo,
    fecha_inicio,
    fecha_fin,
    requisitos,
    estado,
    total_postulaciones = null
  }: ConvocatoriaRow) {
    this.id_convocatoria = id_convocatoria;
    this.titulo = titulo;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.requisitos = requisitos;
    this.estado = estado;
    this.total_postulaciones = total_postulaciones;
  }
}

export default Convocatoria;
