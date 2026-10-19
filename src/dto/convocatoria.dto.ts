// src/dto/convocatoria.dto.ts
import type { Convocatoria } from '../models/convocatoria.entity';

export class ConvocatoriaDTO {
  id: number;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  requisitos: string | null;
  estado: string;
  totalPostulaciones?: number;

  constructor({
    id_convocatoria,
    titulo,
    fecha_inicio,
    fecha_fin,
    requisitos,
    estado,
    total_postulaciones = null
  }: Convocatoria) {
    this.id = id_convocatoria;
    this.titulo = titulo;
    this.fechaInicio = fecha_inicio;
    this.fechaFin = fecha_fin;
    this.requisitos = requisitos;
    this.estado = estado;
    if (total_postulaciones !== null) this.totalPostulaciones = Number(total_postulaciones);
  }
}

export default ConvocatoriaDTO;
