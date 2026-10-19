// src/dto/suscriptor.dto.ts
import type { Suscriptor } from '../models/suscriptor.entity';

export class SuscriptorDTO {
  id: number;
  email: string;
  nombre: string | null;
  idUsuario: number | null;
  fechaSuscripcion: string;
  estado: string;

  constructor({ id_suscriptor, email, nombre, id_usuario, fecha_suscripcion, estado }: Suscriptor) {
    this.id = id_suscriptor;
    this.email = email;
    this.nombre = nombre;
    this.idUsuario = id_usuario;
    this.fechaSuscripcion = fecha_suscripcion;
    this.estado = estado;
  }
}

export default SuscriptorDTO;
