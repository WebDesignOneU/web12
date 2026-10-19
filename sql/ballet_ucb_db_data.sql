USE ballet_ucb_db;

-- =====================================================
-- 1. POBLAMIENTO DE USUARIOS CENTRALIZADOS (bcrypt hash: Password.123)
-- Hash: $2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii
-- =====================================================
INSERT INTO usuarios (id_usuario, email, password_hash, rol, estado) VALUES
-- Administradores y Dirección
(1, 'admin.ballet@ucb.edu.bo', '$2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii', 'admin', 'activo'),
(2, 'directora.ballet@ucb.edu.bo', '$2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii', 'director', 'activo'),

-- Integrantes del Elenco (Bailarines)
(3, 'valeria.mamani@ucb.edu.bo', '$2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii', 'bailarin', 'activo'),
(4, 'gabriel.flores@ucb.edu.bo', '$2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii', 'bailarin', 'activo'),

-- Postulantes a Convocatorias
(5, 'mateo.morales@ucb.edu.bo', '$2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii', 'postulante', 'activo'),
(6, 'sofia.paz@gmail.com', '$2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii', 'postulante', 'activo'),

-- Espectadores Registrados
(7, 'camila.vargas@ucb.edu.bo', '$2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii', 'espectador', 'activo'),
(8, 'carlos.torrez@gmail.com', '$2a$10$qi1rhjNl7muWCjTzsIlJe.6d0PggAk7l2KurTqTnk5PnLIJgUGNii', 'espectador', 'activo');

-- =====================================================
-- 2. POBLAMIENTO DE SUSCRIPTORES Y NOTICIAS
-- =====================================================
INSERT INTO suscriptores (email, nombre, id_usuario, estado) VALUES
('maria.gomez@gmail.com', 'María Gómez', NULL, 'activo'),
('juan.perez@hotmail.com', 'Juan Pérez', NULL, 'activo'),
('camila.vargas@ucb.edu.bo', 'Camila Vargas', 7, 'activo'),
('luis.mendoza@yahoo.com', 'Luis Mendoza', NULL, 'desuscrito');

INSERT INTO noticias (id_autor, titulo, slug, contenido, imagen_url, destacado) VALUES
(
    1,
    'Apertura de Temporada 2026: El Lago de los Cisnes',
    'apertura-temporada-2026-lago-cisnes',
    'El Ballet de la Universidad Católica Boliviana se enorgullece en presentar el inicio de la temporada artística 2026 con la icónica obra El Lago de los Cisnes en el Paraninfo Universitario.',
    '/images/noticias/lago-cisnes.jpg',
    TRUE
),
(
    2,
    'Convocatoria Abierta para Nuevos Talentos I/2026',
    'convocatoria-abierta-nuevos-talentos-1-2026',
    'Buscamos integrar nuevos bailarines a nuestro cuerpo de danza. Si tienes experiencia en danza clásica o contemporánea, revisa las bases en el apartado de postulaciones.',
    '/images/noticias/audiciones.jpg',
    TRUE
),
(
    1,
    'Participación Destacada en el Festival Nacional de Danza',
    'participacion-destacada-festival-nacional',
    'Nuestros solistas obtuvieron el primer lugar en la categoría Ensamble Contemporáneo en el certamen celebrado en Cochabamba.',
    '/images/noticias/premio-festival.jpg',
    FALSE
);

-- =====================================================
-- 3. POBLAMIENTO DE OBRAS Y FUNCIONES
-- =====================================================
INSERT INTO obras (id_obra, titulo, descripcion, director, imagen_banner) VALUES
(
    1,
    'El Lago de los Cisnes',
    'Obra maestra del ballet clásico con música de Pyotr Ilyich Tchaikovsky. Una historia de amor, magia y redención.',
    'Lic. Ana Maria Zeballos',
    '/images/obras/banner-lago-cisnes.jpg'
),
(
    2,
    'Carmen & Estampas Bolivianas',
    'Fusión contemporánea que adapta la fuerza de Carmen con arreglos folclóricos contemporáneos de Bolivia.',
    'Lic. Ana Maria Zeballos',
    '/images/obras/banner-carmen.jpg'
);

INSERT INTO funciones (id_funcion, id_obra, fecha_hora, lugar, capacidad_total, asientos_disponibles, estado) VALUES
(1, 1, '2026-11-15 19:30:00', 'Paraninfo Universitario UCB - La Paz', 250, 245, 'programada'),
(2, 1, '2026-11-16 19:30:00', 'Paraninfo Universitario UCB - La Paz', 250, 250, 'programada'),
(3, 2, '2026-12-05 18:00:00', 'Auditorio Campus San Pablo', 180, 180, 'programada');

-- =====================================================
-- 4. POBLAMIENTO DE ESPECTADORES Y RESERVAS
-- =====================================================
INSERT INTO espectadores (id_espectador, id_usuario, ci, nombre_completo, correo, telefono, es_estudiante_ucb) VALUES
(1, 7, '6849302 LP', 'Camila Vargas Quiroga', 'camila.vargas@ucb.edu.bo', '71542091', TRUE),
(2, 8, '9283011 LP', 'Carlos Eduardo Torrez', 'carlos.torrez@gmail.com', '72039481', FALSE),
(3, NULL, '7839201 CB', 'Lucía Fernández (Invitada)', 'lucia.f@gmail.com', '68920192', FALSE);

INSERT INTO reservas (codigo_reserva, id_funcion, id_espectador, cantidad_entradas, estado_reserva) VALUES
('BUCB-9A82', 1, 1, 2, 'confirmada'),
('BUCB-3F10', 1, 2, 3, 'confirmada');

-- =====================================================
-- 5. POBLAMIENTO DE CONVOCATORIAS Y POSTULACIONES
-- =====================================================
INSERT INTO convocatorias (id_convocatoria, titulo, fecha_inicio, fecha_fin, requisitos, estado) VALUES
(
    1,
    'Audiciones Elenco General I/2026',
    '2026-10-01',
    '2026-11-30',
    'Pertenecer o ser egresado UCB o público general con mínimo 2 años de formación en danza clásica o contemporánea. Edad entre 17 y 28 años.',
    'abierta'
);

INSERT INTO postulaciones (id_convocatoria, id_usuario, nombre_completo, ci, email, telefono, carrera_ucb, experiencia_anios, estilo_danza, link_video_demo, estado_evaluacion) VALUES
(
    1,
    5,
    'Mateo Morales Siles',
    '8930219 LP',
    'mateo.morales@ucb.edu.bo',
    '77291039',
    'Comunicación Social',
    3,
    'Danza Contemporánea',
    'https://youtube.com/watch?v=demo_mateo',
    'preseleccionado'
),
(
    1,
    6,
    'Sofia Alejandra Paz',
    '1029384 LP',
    'sofia.paz@gmail.com',
    '69023910',
    NULL,
    5,
    'Ballet Clásico',
    'https://drive.google.com/file/d/demo_sofia',
    'pendiente'
);

-- =====================================================
-- 6. POBLAMIENTO DEL ELENCO
-- =====================================================
INSERT INTO integrantes (id_usuario, nombre_completo, rol, fotografia_url, biografia, activo) VALUES
(
    2,
    'Lic. Ana Maria Zeballos',
    'director',
    '/images/elenco/directora.jpg',
    'Directora artística con más de 20 años de trayectoria en la danza clásica y gestión cultural.',
    TRUE
),
(
    3,
    'Valeria Mamani',
    'solista',
    '/images/elenco/valeria-mamani.jpg',
    'Primera bailarina del Ballet UCB. Estudiante de la carrera de Diseño Gráfico.',
    TRUE
),
(
    4,
    'Gabriel Flores',
    'cuerpo_de_ballet',
    '/images/elenco/gabriel-flores.jpg',
    'Bailarín e integrante del elenco desde 2024. Estudiante de Ingeniería de Sistemas.',
    TRUE
);