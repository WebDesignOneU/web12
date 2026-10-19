// src/models/espectador.entity.ts
// El espectador se crea/usa dentro del flujo de reservas (sp_registrar_reserva)
// a partir del CI proporcionado.
import type { RowDataPacket } from 'mysql2';

export interface EspectadorRow extends RowDataPacket {
  id_espectador: number;
  id_usuario: number | null;
  ci: string;
  nombre_completo: string;
  correo: string;
  telefono: string | null;
  es_estudiante_ucb: number | boolean;
}

export class Espectador {
  id_espectador: number;
  id_usuario: number | null;
  ci: string;
  nombre_completo: string;
  correo: string;
  telefono: string | null;
  es_estudiante_ucb: number | boolean;

  constructor({
    id_espectador,
    id_usuario,
    ci,
    nombre_completo,
    correo,
    telefono,
    es_estudiante_ucb
  }: EspectadorRow) {
    this.id_espectador = id_espectador;
    this.id_usuario = id_usuario;
    this.ci = ci;
    this.nombre_completo = nombre_completo;
    this.correo = correo;
    this.telefono = telefono;
    this.es_estudiante_ucb = es_estudiante_ucb;
  }
}

export default Espectador;
