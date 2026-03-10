-- CREAR TABLA ADMINISTRATIVOS
CREATE TABLE IF NOT EXISTS administrativos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_unico TEXT UNIQUE NOT NULL,
    dni TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT NOT NULL,
    personal TEXT NOT NULL,
    cargo TEXT NOT NULL,
    celular TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Verificar creación
SELECT name FROM sqlite_master WHERE type='table' AND name='administrativos';