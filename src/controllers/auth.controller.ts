// src/controllers/auth.controller.ts
import type { RequestHandler } from 'express';
import { AuthService } from '../services/auth.service';
import { UsuarioDTO } from '../dto/usuario.dto';
import { manejarError, type ErrorCampo } from '../utils/response';
import * as val from '../utils/validators';

// POST /api/auth/register
export const register: RequestHandler = async (req, res) => {
  const { email, password, rol } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (!val.esEmail(email)) errores.push({ campo: 'email', mensaje: 'El email es inválido' });
  if (!val.esPassword(password)) errores.push({ campo: 'password', mensaje: 'La contraseña debe tener al menos 6 caracteres' });
  if (rol !== undefined && !val.esEnum(rol, val.ROLES_AUTOREGISTRO)) {
    errores.push({ campo: 'rol', mensaje: `El rol debe ser uno de: ${val.ROLES_AUTOREGISTRO.join(', ')}` });
  }
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const usuario = await AuthService.register({ email, password, rol });
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: new UsuarioDTO(usuario)
    });
  } catch (error) {
    manejarError(res, error, 'Error al registrar el usuario');
  }
};

// POST /api/auth/login
export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body || {};
  const errores: ErrorCampo[] = [];
  if (!val.esEmail(email)) errores.push({ campo: 'email', mensaje: 'El email es inválido' });
  if (!val.esTexto(password, 6)) errores.push({ campo: 'password', mensaje: 'La contraseña debe tener al menos 6 caracteres' });
  if (errores.length) {
    res.status(400).json({ success: false, message: 'Datos de entrada inválidos', errors: errores });
    return;
  }

  try {
    const resultado = await AuthService.login({ email, password });
    res.json({ success: true, message: 'Inicio de sesión exitoso', data: resultado });
  } catch (error) {
    manejarError(res, error, 'Error al iniciar sesión');
  }
};

// GET /api/auth/perfil (requiere token)
export const getPerfil: RequestHandler = async (req, res) => {
  try {
    const usuario = await AuthService.getPerfil(req.user!.id);
    if (!usuario) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }
    res.json({ success: true, data: new UsuarioDTO(usuario) });
  } catch (error) {
    manejarError(res, error);
  }
};
