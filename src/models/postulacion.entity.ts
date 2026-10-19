// src/models/postulacion.entity.ts
import type { RowDataPacket } from 'mysql2';

export interface PostulacionRow extends RowDataPacket {
  id_postulacion: number;
  id_convocatoria: number;
  id_usuario: number | null;
  nombre_completo: string;
  ci: string;
  email: string;
  telefono: string;
  carrera_ucb: string | null;
  experiencia_anios: number;
  estilo_danza: string | null;
  link_video_demo: string | null;
  fecha_postulacion: string;
  estado_evaluacion: string;
  // "convocatoria_titulo" proviene del JOIN con convocatorias en PostulacionService
  convocatoria_titulo?: string | null;
}

export class Postulacion {
  id_postulacion: number;
  id_convocatoria: number;
  id_usuario: number | null;
  nombre_completo: string;
  ci: string;
  email: string;
  telefono: string;
  carrera_ucb: string | null;
  experiencia_anios: number;
  estilo_danza: string | null;
  link_video_demo: string | null;
  fecha_postulacion: string;
  estado_evaluacion: string;
  convocatoria_titulo: string | null;

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
  }: PostulacionRow) {
    this.id_postulacion = id_postulacion;
    this.id_convocatoria = id_convocatoria;
    this.id_usuario = id_usuario;
    this.nombre_completo = nombre_completo;
    this.ci = ci;
    this.email = email;
    this.telefono = telefono;
    this.carrera_ucb = carrera_ucb;
    this.experiencia_anios = experiencia_anios;
    this.estilo_danza = estilo_danza;
    this.link_video_demo = link_video_demo;
    this.fecha_postulacion = fecha_postulacion;
    this.estado_evaluacion = estado_evaluacion;
    this.convocatoria_titulo = convocatoria_titulo;
  }
}

export default Postulacion;
