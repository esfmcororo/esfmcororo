-- CONFIGURAR ZONA HORARIA BOLIVIA (UTC-4)
-- Bolivia no usa horario de verano, siempre UTC-4

-- Opción 1: Configurar a nivel de base de datos
ALTER DATABASE postgres SET timezone TO 'America/La_Paz';

-- Opción 2: Verificar zona horaria actual
SHOW timezone;

-- Opción 3: Ver timestamps con zona horaria correcta
SELECT NOW() AT TIME ZONE 'America/La_Paz' as hora_bolivia;

-- Verificar registros existentes
SELECT created_at, created_at AT TIME ZONE 'America/La_Paz' as hora_bolivia 
FROM estudiantes 
ORDER BY created_at DESC 
LIMIT 5;
