-- LIMPIAR BASE DE DATOS
-- Mantener solo el usuario admin

-- 1. Eliminar todas las asistencias
DELETE FROM asistencias;

-- 2. Eliminar todos los estudiantes
DELETE FROM estudiantes;

-- 3. Eliminar todos los eventos
DELETE FROM eventos;

-- 4. Verificar que solo quede el admin
SELECT email, nombre, rol FROM perfiles;

-- Resultado esperado: solo admin@escuela.com
