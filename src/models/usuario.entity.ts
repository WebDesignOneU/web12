// src/models/usuario.entity.ts
import type { RowDataPacket } from 'mysql2';

export interface UsuarioRow extends RowDataPacket {
  id_usuario: number;
  email: string;
  password_hash: string;
  rol: string;
  estado: string;
  ultimo_acceso: string | null;
  fecha_registro: string;
}

export class Usuario {
  id_usuario: number;
  email: string;
  password_hash: string; // nunca se expone: usar UsuarioDTO
  rol: string;
  estado: string;
  ultimo_acceso: string | null;
  fecha_registro: string;

  constructor({
    id_usuario,
    email,
    password_hash,
    rol,
    estado,
    ultimo_acceso,
    fecha_registro
  }: UsuarioRow) {
    this.id_usuario = id_usuario;
    this.email = email;
    this.password_hash = password_hash;
    this.rol = rol;
    this.estado = estado;
    this.ultimo_acceso = ultimo_acceso;
    this.fecha_registro = fecha_registro;
  }
}

export default Usuario;
