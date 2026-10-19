// src/dto/reserva.dto.ts
import type { Reserva } from '../models/reserva.entity';

export class ReservaDTO {
  id: number;
  codigoReserva: string;
  idFuncion: number;
  idEspectador: number | null;
  cantidadEntradas: number;
  fechaReserva: string;
  estadoReserva: string;
  funcion?: {
    id: number;
    obra: string | null;
    fechaHora: string | null;
    lugar: string | null;
    estado: string | null;
  };

  constructor({
    id_reserva,
    codigo_reserva,
    id_funcion,
    id_espectador,
    cantidad_entradas,
    fecha_reserva,
    estado_reserva,
    obra_titulo = null,
    funcion_fecha_hora = null,
    funcion_lugar = null,
    funcion_estado = null
  }: Reserva) {
    this.id = id_reserva;
    this.codigoReserva = codigo_reserva;
    this.idFuncion = id_funcion;
    this.idEspectador = id_espectador;
    this.cantidadEntradas = cantidad_entradas;
    this.fechaReserva = fecha_reserva;
    this.estadoReserva = estado_reserva;
    if (obra_titulo || funcion_fecha_hora) {
      // Resumen de la función asociada (JOIN)
      this.funcion = {
        id: id_funcion,
        obra: obra_titulo,
        fechaHora: funcion_fecha_hora,
        lugar: funcion_lugar,
        estado: funcion_estado
      };
    }
  }
}

export default ReservaDTO;
