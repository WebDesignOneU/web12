CREATE DATABASE IF NOT EXISTS ballet_ucb_db;
USE ballet_ucb_db;

-- =====================================================
-- 1. AUTENTICACIÓN Y USUARIOS CENTRALIZADOS
-- =====================================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    rol ENUM('admin', 'director', 'bailarin', 'postulante', 'espectador') NOT NULL DEFAULT 'espectador',
    estado ENUM('activo', 'inactivo', 'bloqueado') DEFAULT 'activo',
    ultimo_acceso DATETIME NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. SUSCRIPCIONES Y NOTICIAS
-- =====================================================
CREATE TABLE suscriptores (
    id_suscriptor INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    nombre VARCHAR(100),
    id_usuario INT NULL, -- Opcional: si el suscriptor decide crear una cuenta
    fecha_suscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'desuscrito') DEFAULT 'activo',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE TABLE noticias (
    id_noticia INT AUTO_INCREMENT PRIMARY KEY,
    id_autor INT NOT NULL, -- Administrador o Director que redacta
    titulo VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    contenido TEXT NOT NULL,
    imagen_url VARCHAR(255),
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    destacado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_autor) REFERENCES usuarios(id_usuario)
);

-- =====================================================
-- 3. OBRAS, FUNCIONES Y RESERVAS
-- =====================================================
CREATE TABLE obras (
    id_obra INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    director VARCHAR(100),
    imagen_banner VARCHAR(255)
);

CREATE TABLE funciones (
    id_funcion INT AUTO_INCREMENT PRIMARY KEY,
    id_obra INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    lugar VARCHAR(150) DEFAULT 'Auditorio UCB',
    capacidad_total INT NOT NULL,
    asientos_disponibles INT NOT NULL,
    estado ENUM('programada', 'agotada', 'cancelada', 'finalizada') DEFAULT 'programada',
    FOREIGN KEY (id_obra) REFERENCES obras(id_obra) ON DELETE CASCADE
);

CREATE TABLE espectadores (
    id_espectador INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NULL, -- Permite reservas como invitado o con usuario registrado
    ci VARCHAR(20) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    es_estudiante_ucb BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    codigo_reserva VARCHAR(20) NOT NULL UNIQUE,
    id_funcion INT NOT NULL,
    id_espectador INT NOT NULL,
    cantidad_entradas INT NOT NULL CHECK (cantidad_entradas > 0),
    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_reserva ENUM('confirmada', 'asistio', 'cancelada') DEFAULT 'confirmada',
    FOREIGN KEY (id_funcion) REFERENCES funciones(id_funcion),
    FOREIGN KEY (id_espectador) REFERENCES espectadores(id_espectador)
);

-- =====================================================
-- 4. CONVOCATORIAS Y POSTULACIONES
-- =====================================================
CREATE TABLE convocatorias (
    id_convocatoria INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    requisitos TEXT,
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta'
);

CREATE TABLE postulaciones (
    id_postulacion INT AUTO_INCREMENT PRIMARY KEY,
    id_convocatoria INT NOT NULL,
    id_usuario INT NULL, -- Vincula la postulación a la cuenta del usuario postulante
    nombre_completo VARCHAR(150) NOT NULL,
    ci VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    carrera_ucb VARCHAR(100),
    experiencia_anios INT DEFAULT 0,
    estilo_danza VARCHAR(100),
    link_video_demo VARCHAR(255),
    fecha_postulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_evaluacion ENUM('pendiente', 'preseleccionado', 'aceptado', 'rechazado') DEFAULT 'pendiente',
    FOREIGN KEY (id_convocatoria) REFERENCES convocatorias(id_convocatoria),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- =====================================================
-- 5. ELENCO INTEGRANTES
-- =====================================================
CREATE TABLE integrantes (
    id_integrante INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NULL, -- Vincula al integrante con su acceso al portal
    nombre_completo VARCHAR(150) NOT NULL,
    rol ENUM('solista', 'cuerpo_de_ballet', 'director', 'maestro') NOT NULL,
    fotografia_url VARCHAR(255),
    biografia TEXT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

DELIMITER //

CREATE TRIGGER trg_descontar_cupos_reserva
AFTER INSERT ON reservas
FOR EACH ROW
BEGIN
    IF NEW.estado_reserva = 'confirmada' THEN
        -- Descontar asientos
        UPDATE funciones
        SET asientos_disponibles = asientos_disponibles - NEW.cantidad_entradas
        WHERE id_funcion = NEW.id_funcion;
        
        -- Si los asientos llegan a 0, cambiar estado a 'agotada'
        UPDATE funciones
        SET estado = 'agotada'
        WHERE id_funcion = NEW.id_funcion AND asientos_disponibles = 0;
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_restaurar_cupos_cancelacion
AFTER UPDATE ON reservas
FOR EACH ROW
BEGIN
    -- Si cambia de 'confirmada' a 'cancelada'
    IF OLD.estado_reserva = 'confirmada' AND NEW.estado_reserva = 'cancelada' THEN
        UPDATE funciones
        SET asientos_disponibles = asientos_disponibles + OLD.cantidad_entradas,
            estado = IF(estado = 'agotada', 'programada', estado)
        WHERE id_funcion = OLD.id_funcion;
    END IF;
END //

DELIMITER ;


DELIMITER //

CREATE FUNCTION fn_verificar_disponibilidad(
    p_id_funcion INT,
    p_cantidad INT
) 
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_disponibles INT;
    
    SELECT asientos_disponibles INTO v_disponibles
    FROM funciones
    WHERE id_funcion = p_id_funcion;
    
    IF v_disponibles >= p_cantidad THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE FUNCTION fn_generar_codigo_reserva() 
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE v_caracteres VARCHAR(36) DEFAULT 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    DECLARE v_codigo VARCHAR(20) DEFAULT 'BUCB-';
    DECLARE i INT DEFAULT 1;
    
    WHILE i <= 5 DO
        SET v_codigo = CONCAT(v_codigo, SUBSTRING(v_caracteres, FLOOR(1 + RAND() * 36), 1));
        SET i = i + 1;
    END WHILE;
    
    RETURN v_codigo;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_reporte_ocupacion_funciones()
BEGIN
    SELECT 
        o.titulo AS obra,
        f.id_funcion,
        f.fecha_hora,
        f.lugar,
        f.capacidad_total,
        f.asientos_disponibles,
        (f.capacidad_total - f.asientos_disponibles) AS entradas_reservadas,
        ROUND(((f.capacidad_total - f.asientos_disponibles) / f.capacidad_total) * 100, 2) AS porcentaje_ocupacion,
        f.estado
    FROM funciones f
    INNER JOIN obras o ON f.id_obra = o.id_obra
    ORDER BY f.fecha_hora ASC;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_evaluar_postulacion(
    IN p_id_postulacion INT,
    IN p_nuevo_estado ENUM('pendiente', 'preseleccionado', 'aceptado', 'rechazado')
)
BEGIN
    DECLARE v_id_usuario INT;

    START TRANSACTION;

    -- Actualizar estado de la postulación
    UPDATE postulaciones
    SET estado_evaluacion = p_nuevo_estado
    WHERE id_postulacion = p_id_postulacion;

    -- Obtener id_usuario asociado
    SELECT id_usuario INTO v_id_usuario
    FROM postulaciones
    WHERE id_postulacion = p_id_postulacion;

    -- Si fue aceptado y tiene cuenta de usuario, ascender a rol 'bailarin'
    IF p_nuevo_estado = 'aceptado' AND v_id_usuario IS NOT NULL THEN
        UPDATE usuarios
        SET rol = 'bailarin'
        WHERE id_usuario = v_id_usuario;
    END IF;

    COMMIT;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_registrar_reserva(
    IN p_id_funcion INT,
    IN p_ci VARCHAR(20),
    IN p_nombre_completo VARCHAR(150),
    IN p_correo VARCHAR(150),
    IN p_telefono VARCHAR(20),
    IN p_es_estudiante BOOLEAN,
    IN p_id_usuario INT,
    IN p_cantidad INT,
    OUT p_codigo_reserva_out VARCHAR(20),
    OUT p_resultado INT -- 1: Éxito, -1: Cupos insuficientes
)
sp_main: BEGIN
    DECLARE v_id_espectador INT;
    DECLARE v_codigo VARCHAR(20);
    
    -- Manejo de transacción
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_resultado = -2; -- Error en la BD
        SET p_codigo_reserva_out = NULL;
    END;

    -- 1. Validar disponibilidad
    IF NOT fn_verificar_disponibilidad(p_id_funcion, p_cantidad) THEN
        SET p_resultado = -1; -- No hay cupos
        SET p_codigo_reserva_out = NULL;
        LEAVE sp_main;
    END IF;

    START TRANSACTION;

    -- 2. Buscar o Registrar Espectador
    SELECT id_espectador INTO v_id_espectador
    FROM espectadores
    WHERE ci = p_ci;

    IF v_id_espectador IS NULL THEN
        INSERT INTO espectadores (id_usuario, ci, nombre_completo, correo, telefono, es_estudiante_ucb)
        VALUES (p_id_usuario, p_ci, p_nombre_completo, p_correo, p_telefono, p_es_estudiante);
        SET v_id_espectador = LAST_INSERT_ID();
    END IF;

    -- 3. Generar código de reserva y guardar
    SET v_codigo = fn_generar_codigo_reserva();

    INSERT INTO reservas (codigo_reserva, id_funcion, id_espectador, cantidad_entradas, estado_reserva)
    VALUES (v_codigo, p_id_funcion, v_id_espectador, p_cantidad, 'confirmada');

    COMMIT;

    SET p_codigo_reserva_out = v_codigo;
    SET p_resultado = 1; -- Éxito
END //

DELIMITER ;
