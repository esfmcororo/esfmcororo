-- ============================================
-- ACTUALIZAR ESTRUCTURA DE TABLAS
-- ============================================

-- 1. MODIFICAR TABLA ESTUDIANTES
ALTER TABLE estudiantes
ADD COLUMN dni TEXT UNIQUE,
ADD COLUMN celular TEXT,
ADD COLUMN apellido_paterno TEXT,
ADD COLUMN apellido_materno TEXT;

-- Renombrar columnas existentes
ALTER TABLE estudiantes RENAME COLUMN apellido TO apellido_completo;

-- Reorganizar estructura (opcional - para orden lógico)
-- PostgreSQL no permite reordenar columnas, pero podemos documentar el orden deseado:

/*
ESTRUCTURA FINAL DE ESTUDIANTES:
- id (UUID) - PK
- codigo_unico (TEXT) - UNIQUE
- dni (TEXT) - UNIQUE
- nombre (TEXT)
- apellido_paterno (TEXT)
- apellido_materno (TEXT)
- celular (TEXT)
- email (TEXT)
- especialidad (TEXT)
- anio (INTEGER)
- created_at (TIMESTAMP)
*/

-- 2. CREAR TABLA DOCENTES (usuarios con menos privilegios)
CREATE TABLE IF NOT EXISTS docentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dni TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT NOT NULL,
    celular TEXT,
    email TEXT UNIQUE NOT NULL,
    especialidad TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS en docentes
ALTER TABLE docentes ENABLE ROW LEVEL SECURITY;

-- Políticas para docentes
CREATE POLICY "Docentes ven su propio perfil"
ON docentes FOR SELECT
USING (usuario_id = auth.uid());

CREATE POLICY "Admins gestionan docentes"
ON docentes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM perfiles
        WHERE id = auth.uid() AND rol = 'admin'
    )
);

-- 3. VERIFICAR ESTRUCTURA
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'estudiantes'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'docentes'
ORDER BY ordinal_position;
