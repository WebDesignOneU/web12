// src/models/funcion.entity.ts
import type { RowDataPacket } from 'mysql2';

export interface FuncionRow extends RowDataPacket {
  id_funcion: number;
  id_obra: number;
  fecha_hora: string;
  lugar: string;
  capacidad_total: number;
  asientos_disponibles: number;
  estado: string;
  // "obra_titulo" proviene del JOIN con obras en FuncionService
  obra_titulo?: string | null;
}

export class Funcion {
  id_funcion: number;
  id_obra: number;
  fecha_hora: string;
  lugar: string;
  capacidad_total: number;
  asientos_disponibles: number;
  estado: string;
  obra_titulo: string | null;

  constructor({
    id_funcion,
    id_obra,
    fecha_hora,
    lugar,
    capacidad_total,
    asientos_disponibles,
    estado,
    obra_titulo = null
  }: FuncionRow) {
    this.id_funcion = id_funcion;
    this.id_obra = id_obra;
    this.fecha_hora = fecha_hora;
    this.lugar = lugar;
    this.capacidad_total = capacidad_total;
    this.asientos_disponibles = asientos_disponibles;
    this.estado = estado;
    this.obra_titulo = obra_titulo;
  }
}

export default Funcion;
