// src/dto/integrante.dto.ts
// El id_usuario (vínculo con la cuenta de acceso) solo se expone a admins.
import type { Integrante } from '../models/integrante.entity';

export interface IntegranteDTOOpciones {
  incluirUsuario?: boolean;
}

export class IntegranteDTO {
  id: number;
  nombreCompleto: string;
  rol: string;
  fotografiaUrl: string | null;
  biografia: string | null;
  activo: boolean;

  constructor(
    { id_integrante, nombre_completo, rol, fotografia_url, biografia, activo }: Integrante,
    _opciones: IntegranteDTOOpciones = {}
  ) {
    this.id = id_integrante;
    this.nombreCompleto = nombre_completo;
    this.rol = rol;
    this.fotografiaUrl = fotografia_url;
    this.biografia = biografia;
    this.activo = Boolean(activo);
  }
}

export default IntegranteDTO;
