// src/services/reserva.service.ts
// Reserva de entradas. El alta usa el procedimiento almacenado
// sp_registrar_reserva (valida cupos, registra/busca espectador y genera el
// código); los triggers descuentan/restauran asientos automáticamente.
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db from '../config/db';
import Reserva, { type ReservaRow } from '../models/reserva.entity';
import Espectador, { type EspectadorRow } from '../models/espectador.entity';
import { type FuncionRow } from '../models/funcion.entity';
import { ApiError } from '../utils/ApiError';

interface TotalRow extends RowDataPacket {
  total: number;
}

interface SalidaRow extends RowDataPacket {
  codigo_reserva: string;
  resultado: number;
}

export interface ReservaCreateInput {
  id_funcion: number;
  ci: string;
  nombre_completo: string;
  correo: string;
  telefono?: string | null;
  es_estudiante_ucb?: boolean;
  id_usuario?: number | null;
  cantidad_entradas: number;
}

export interface ReservaCreada {
  codigoReserva: string;
  idFuncion: number;
  cantidadEntradas: number;
}

export interface ReservaFiltros {
  page?: unknown;
  limit?: unknown;
  estado?: unknown;
  id_funcion?: unknown;
}

export interface ReservaListado {
  reservas: Reserva[];
  total: number;
  page: number;
  pages: number;
}

export class ReservaService {
  // Crear una reserva. Usa una conexión dedicada porque el procedimiento
  // devuelve valores OUT mediante variables de sesión (@codigo, @resultado).
  static async create({
    id_funcion,
    ci,
    nombre_completo,
    correo,
    telefono,
    es_estudiante_ucb = false,
    id_usuario = null,
    cantidad_entradas
  }: ReservaCreateInput): Promise<ReservaCreada> {
    // Validar que la función exista y esté habilitada para reservar
    const [funciones] = await db.query<FuncionRow[]>('SELECT * FROM funciones WHERE id_funcion = ? LIMIT 1', [
      id_funcion
    ]);
    if (funciones.length === 0) throw new ApiError(404, 'La función indicada no existe');
    if (funciones[0].estado !== 'programada') {
      throw new ApiError(409, `La función está ${funciones[0].estado} y no admite reservas`);
    }

    // Si la cuenta ya tiene un espectador vinculado (UNIQUE en id_usuario),
    // se envía id_usuario = NULL para no violar la restricción: la reserva
    // se registra para el CI indicado sin duplicar el vínculo.
    let idUsuarioFinal = id_usuario;
    if (id_usuario) {
      const [vinculado] = await db.query<RowDataPacket[]>(
        'SELECT id_espectador FROM espectadores WHERE id_usuario = ? LIMIT 1',
        [id_usuario]
      );
      if (vinculado.length > 0) idUsuarioFinal = null;
    }

    const conexion: PoolConnection = await db.getConnection();
    try {
      await conexion.query('CALL sp_registrar_reserva(?, ?, ?, ?, ?, ?, ?, ?, @codigo_reserva, @resultado)', [
        id_funcion,
        ci.trim(),
        nombre_completo.trim(),
        correo.trim().toLowerCase(),
        telefono ? telefono.trim() : null,
        es_estudiante_ucb ? 1 : 0,
        idUsuarioFinal,
        cantidad_entradas
      ]);
      // Leer los valores OUT del procedimiento
      const [[salida]] = await conexion.query<SalidaRow[]>(
        'SELECT @codigo_reserva AS codigo_reserva, @resultado AS resultado'
      );

      if (Number(salida.resultado) === -1) {
        throw new ApiError(409, 'La función no tiene cupos suficientes disponibles');
      }
      if (Number(salida.resultado) !== 1) {
        console.error(`[Reservas] sp_registrar_reserva devolvió ${salida.resultado} (función ${id_funcion})`);
        throw new ApiError(500, 'Error interno al registrar la reserva');
      }
      return {
        codigoReserva: salida.codigo_reserva,
        idFuncion: Number(id_funcion),
        cantidadEntradas: Number(cantidad_entradas)
      };
    } finally {
      conexion.release();
    }
  }

  // Consulta pública de una reserva por su código (ej: BUCB-9A82)
  static async getByCodigo(codigo: string): Promise<Reserva | null> {
    const [filas] = await db.query<ReservaRow[]>(
      `SELECT r.*, o.titulo AS obra_titulo, f.fecha_hora AS funcion_fecha_hora,
                    f.lugar AS funcion_lugar, f.estado AS funcion_estado
             FROM reservas r
             INNER JOIN funciones f ON f.id_funcion = r.id_funcion
             INNER JOIN obras o ON o.id_obra = f.id_obra
             WHERE r.codigo_reserva = ? LIMIT 1`,
      [codigo.trim().toUpperCase()]
    );
    if (filas.length === 0) return null;
    return new Reserva(filas[0]);
  }

  static async getById(id: number | string): Promise<Reserva | null> {
    const [filas] = await db.query<ReservaRow[]>('SELECT * FROM reservas WHERE id_reserva = ? LIMIT 1', [id]);
    if (filas.length === 0) return null;
    return new Reserva(filas[0]);
  }

  // Listado administrativo paginado con datos de función/obra
  static async getAll({ page = 1, limit = 10, estado, id_funcion }: ReservaFiltros = {}): Promise<ReservaListado> {
    const pagina = Math.max(1, parseInt(String(page), 10) || 1);
    const porPagina = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10));

    const condiciones: string[] = [];
    const parametros: any[] = [];
    if (estado) {
      condiciones.push('r.estado_reserva = ?');
      parametros.push(estado);
    }
    if (id_funcion) {
      condiciones.push('r.id_funcion = ?');
      parametros.push(id_funcion);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const [[{ total }]] = await db.query<TotalRow[]>(`SELECT COUNT(*) AS total FROM reservas r ${where}`, parametros);
    const [filas] = await db.query<ReservaRow[]>(
      `SELECT r.*, o.titulo AS obra_titulo, f.fecha_hora AS funcion_fecha_hora,
                    f.lugar AS funcion_lugar, f.estado AS funcion_estado
             FROM reservas r
             INNER JOIN funciones f ON f.id_funcion = r.id_funcion
             INNER JOIN obras o ON o.id_obra = f.id_obra
             ${where}
             ORDER BY r.fecha_reserva DESC
             LIMIT ? OFFSET ?`,
      [...parametros, porPagina, (pagina - 1) * porPagina]
    );

    return {
      reservas: filas.map((fila) => new Reserva(fila)),
      total,
      page: pagina,
      pages: Math.ceil(total / porPagina)
    };
  }

  // Cancelar reserva (el trigger trg_restaurar_cupos_cancelacion devuelve los cupos)
  static async cancelar(id: number | string): Promise<Reserva | null> {
    const [resultado] = await db.query<ResultSetHeader>(
      "UPDATE reservas SET estado_reserva = 'cancelada' WHERE id_reserva = ? AND estado_reserva = 'confirmada'",
      [id]
    );
    if (resultado.affectedRows === 0) {
      const reserva = await this.getById(id);
      if (!reserva) throw new ApiError(404, 'Reserva no encontrada');
      throw new ApiError(
        409,
        `La reserva ya fue ${reserva.estado_reserva === 'cancelada' ? 'cancelada' : 'registrada como asistencia'}`
      );
    }
    return await this.getById(id);
  }

  // Marcar asistencia a la función
  static async marcarAsistencia(id: number | string): Promise<Reserva | null> {
    const [resultado] = await db.query<ResultSetHeader>(
      "UPDATE reservas SET estado_reserva = 'asistio' WHERE id_reserva = ? AND estado_reserva = 'confirmada'",
      [id]
    );
    if (resultado.affectedRows === 0) {
      const reserva = await this.getById(id);
      if (!reserva) throw new ApiError(404, 'Reserva no encontrada');
      throw new ApiError(
        409,
        `Solo se puede marcar asistencia a reservas confirmadas (estado actual: ${reserva.estado_reserva})`
      );
    }
    return await this.getById(id);
  }

  // Detalle del espectador asociado a una reserva
  static async getEspectador(idReserva: number | string): Promise<Espectador | null> {
    const [filas] = await db.query<EspectadorRow[]>(
      `SELECT e.*
             FROM espectadores e
             INNER JOIN reservas r ON r.id_espectador = e.id_espectador
             WHERE r.id_reserva = ? LIMIT 1`,
      [idReserva]
    );
    if (filas.length === 0) return null;
    return new Espectador(filas[0]);
  }
}

export default ReservaService;
