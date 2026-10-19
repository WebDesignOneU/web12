// src/dto/usuario.dto.ts
// Enmascara el hash de contraseña y expone solo datos públicos del usuario.
import type { Usuario } from '../models/usuario.entity';

export class UsuarioDTO {
  id: number;
  email: string;
  rol: string;
  estado: string;
  ultimoAcceso: string | null;
  fechaRegistro: string;

  constructor({ id_usuario, email, rol, estado, ultimo_acceso, fecha_registro }: Usuario) {
    this.id = id_usuario;
    this.email = email;
    this.rol = rol;
    this.estado = estado;
    this.ultimoAcceso = ultimo_acceso;
    this.fechaRegistro = fecha_registro;
  }
}

export default UsuarioDTO;
