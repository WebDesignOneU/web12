// src/models/suscriptor.entity.ts
import type { RowDataPacket } from 'mysql2';

export interface SuscriptorRow extends RowDataPacket {
  id_suscriptor: number;
  email: string;
  nombre: string | null;
  id_usuario: number | null;
  fecha_suscripcion: string;
  estado: string;
}

export class Suscriptor {
  id_suscriptor: number;
  email: string;
  nombre: string | null;
  id_usuario: number | null;
  fecha_suscripcion: string;
  estado: string;

  constructor({ id_suscriptor, email, nombre, id_usuario, fecha_suscripcion, estado }: SuscriptorRow) {
    this.id_suscriptor = id_suscriptor;
    this.email = email;
    this.nombre = nombre;
    this.id_usuario = id_usuario;
    this.fecha_suscripcion = fecha_suscripcion;
    this.estado = estado;
  }
}

export default Suscriptor;
