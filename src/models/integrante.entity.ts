// src/models/integrante.entity.ts
import type { RowDataPacket } from 'mysql2';

export interface IntegranteRow extends RowDataPacket {
  id_integrante: number;
  // Opcional: el listado público no expone la cuenta de acceso vinculada
  id_usuario?: number | null;
  nombre_completo: string;
  rol: string;
  fotografia_url: string | null;
  biografia: string | null;
  activo: number | boolean;
}

export class Integrante {
  id_integrante: number;
  id_usuario: number | null;
  nombre_completo: string;
  rol: string;
  fotografia_url: string | null;
  biografia: string | null;
  activo: number | boolean;

  constructor({
    id_integrante,
    id_usuario = null,
    nombre_completo,
    rol,
    fotografia_url,
    biografia,
    activo
  }: IntegranteRow) {
    this.id_integrante = id_integrante;
    this.id_usuario = id_usuario;
    this.nombre_completo = nombre_completo;
    this.rol = rol;
    this.fotografia_url = fotografia_url;
    this.biografia = biografia;
    this.activo = activo;
  }
}

export default Integrante;
