// src/dto/postulacion.dto.ts
import type { Postulacion } from '../models/postulacion.entity';

export class PostulacionDTO {
  id: number;
  idConvocatoria: number;
  idUsuario: number | null;
  nombreCompleto: string;
  ci: string;
  email: string;
  telefono: string;
  carreraUcb: string | null;
  experienciaAnios: number;
  estiloDanza: string | null;
  linkVideoDemo: string | null;
  fechaPostulacion: string;
  estadoEvaluacion: string;
  convocatoria?: { id: number; titulo: string | null };

  constructor({
    id_postulacion,
    id_convocatoria,
    id_usuario,
    nombre_completo,
    ci,
    email,
    telefono,
    carrera_ucb,
    experiencia_anios,
    estilo_danza,
    link_video_demo,
    fecha_postulacion,
    estado_evaluacion,
    convocatoria_titulo = null
  }: Postulacion) {
    this.id = id_postulacion;
    this.idConvocatoria = id_convocatoria;
    this.idUsuario = id_usuario;
    this.nombreCompleto = nombre_completo;
    this.ci = ci;
    this.email = email;
    this.telefono = telefono;
    this.carreraUcb = carrera_ucb;
    this.experienciaAnios = experiencia_anios;
    this.estiloDanza = estilo_danza;
    this.linkVideoDemo = link_video_demo;
    this.fechaPostulacion = fecha_postulacion;
    this.estadoEvaluacion = estado_evaluacion;
    if (convocatoria_titulo) this.convocatoria = { id: id_convocatoria, titulo: convocatoria_titulo };
  }
}

export default PostulacionDTO;
