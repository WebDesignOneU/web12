// src/models/reserva.entity.ts
import type { RowDataPacket } from 'mysql2';

export interface ReservaRow extends RowDataPacket {
  id_reserva: number;
  codigo_reserva: string;
  id_funcion: number;
  id_espectador: number | null;
  cantidad_entradas: number;
  fecha_reserva: string;
  estado_reserva: string;
  // Campos de JOIN provistos por ReservaService:
  //   obra_titulo, funcion_fecha_hora, funcion_lugar, funcion_estado
  obra_titulo?: string | null;
  funcion_fecha_hora?: string | null;
  funcion_lugar?: string | null;
  funcion_estado?: string | null;
}

export class Reserva {
  id_reserva: number;
  codigo_reserva: string;
  id_funcion: number;
  id_espectador: number | null;
  cantidad_entradas: number;
  fecha_reserva: string;
  estado_reserva: string;
  obra_titulo: string | null;
  funcion_fecha_hora: string | null;
  funcion_lugar: string | null;
  funcion_estado: string | null;

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
  }: ReservaRow) {
    this.id_reserva = id_reserva;
    this.codigo_reserva = codigo_reserva;
    this.id_funcion = id_funcion;
    this.id_espectador = id_espectador;
    this.cantidad_entradas = cantidad_entradas;
    this.fecha_reserva = fecha_reserva;
    this.estado_reserva = estado_reserva;
    this.obra_titulo = obra_titulo;
    this.funcion_fecha_hora = funcion_fecha_hora;
    this.funcion_lugar = funcion_lugar;
    this.funcion_estado = funcion_estado;
  }
}

export default Reserva;
