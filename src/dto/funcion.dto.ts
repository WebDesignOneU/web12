// src/dto/funcion.dto.ts
import type { Funcion } from '../models/funcion.entity';

export class FuncionDTO {
  id: number;
  idObra: number;
  obra: string | null; // título de la obra (JOIN)
  fechaHora: string;
  lugar: string;
  capacidadTotal: number;
  asientosDisponibles: number;
  estado: string;

  constructor({
    id_funcion,
    id_obra,
    fecha_hora,
    lugar,
    capacidad_total,
    asientos_disponibles,
    estado,
    obra_titulo = null
  }: Funcion) {
    this.id = id_funcion;
    this.idObra = id_obra;
    this.obra = obra_titulo;
    this.fechaHora = fecha_hora;
    this.lugar = lugar;
    this.capacidadTotal = capacidad_total;
    this.asientosDisponibles = asientos_disponibles;
    this.estado = estado;
  }
}

export default FuncionDTO;
