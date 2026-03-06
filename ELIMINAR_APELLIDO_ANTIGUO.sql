-- ELIMINAR COLUMNA APELLIDO ANTIGUA
ALTER TABLE estudiantes DROP COLUMN IF EXISTS apellido;
ALTER TABLE estudiantes DROP COLUMN IF EXISTS apellido_completo;

-- Verificar estructura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'estudiantes'
ORDER BY ordinal_position;
