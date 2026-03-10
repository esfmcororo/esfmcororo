#!/bin/bash

# 🔄 Script de Migración - Sistema de Asistencia QR
# Migra datos de BD actual a nueva BD de desarrollo

echo "🚀 Iniciando migración de Base de Datos..."

# Verificar si Turso CLI está instalado
if ! command -v turso &> /dev/null; then
    echo "❌ Turso CLI no está instalado"
    echo "Instalar con: curl -sSfL https://get.tur.so/install.sh | bash"
    exit 1
fi

# Solicitar nombre de nueva BD
read -p "📝 Nombre de la nueva BD (ej: sistema-asistencia-dev): " NEW_DB_NAME

if [ -z "$NEW_DB_NAME" ]; then
    echo "❌ Nombre de BD requerido"
    exit 1
fi

echo "🔄 Creando nueva base de datos: $NEW_DB_NAME"
turso db create $NEW_DB_NAME

if [ $? -ne 0 ]; then
    echo "❌ Error creando la base de datos"
    exit 1
fi

echo "🔑 Generando token de acceso..."
TOKEN=$(turso db tokens create $NEW_DB_NAME)

echo "📋 Obteniendo URL de conexión..."
URL=$(turso db show $NEW_DB_NAME | grep "URL" | awk '{print $2}')

echo ""
echo "✅ Base de datos creada exitosamente!"
echo ""
echo "📊 CREDENCIALES DE LA NUEVA BD:"
echo "================================"
echo "URL: $URL"
echo "TOKEN: $TOKEN"
echo ""

# Crear archivo de configuración
cat > config_desarrollo.js << EOF
// 🔧 Configuración para Desarrollo
// Reemplazar en js/tursodb.js

const DESARROLLO = {
    dbUrl: '$URL',
    authToken: '$TOKEN'
};

// Copiar estas líneas en js/tursodb.js:
// this.dbUrl = '$URL';
// this.authToken = '$TOKEN';
EOF

echo "📁 Archivo 'config_desarrollo.js' creado con las credenciales"
echo ""

# Inicializar estructura de BD
echo "🏗️ Inicializando estructura de base de datos..."

turso db shell $NEW_DB_NAME << 'EOF'
-- Crear tabla usuarios
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ci TEXT,
    nombre TEXT NOT NULL,
    apellido_paterno TEXT,
    apellido_materno TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    celular TEXT,
    especialidad TEXT,
    codigo_unico TEXT,
    rol TEXT DEFAULT 'usuario',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla estudiantes
CREATE TABLE estudiantes (
    id TEXT PRIMARY KEY,
    codigo_unico TEXT UNIQUE NOT NULL,
    dni TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT,
    especialidad TEXT NOT NULL,
    anio_formacion TEXT NOT NULL,
    celular TEXT,
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla eventos
CREATE TABLE eventos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    imagen_url TEXT,
    usuario_id TEXT NOT NULL,
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla asistencias
CREATE TABLE asistencias (
    id TEXT PRIMARY KEY,
    estudiante_id TEXT NOT NULL,
    evento_id TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Crear usuario admin
INSERT INTO usuarios (ci, nombre, apellido_paterno, apellido_materno, email, password, especialidad, codigo_unico, rol) 
VALUES ('79310777', 'Admin', 'Sistema', 'Principal', 'admin@escuela.com', 'Admin123!', 'ADMINISTRACIÓN', 'ADM001', 'admin');

-- Datos de prueba - Estudiantes
INSERT INTO estudiantes VALUES 
('test1', 'EST001', '12345678', 'JUAN', 'PEREZ', 'LOPEZ', 'MATEMÁTICA', 'PRIMERO', '70000001', 'juan@test.com', datetime('now')),
('test2', 'EST002', '87654321', 'MARIA', 'GARCIA', 'SILVA', 'MATEMÁTICA', 'PRIMERO', '70000002', 'maria@test.com', datetime('now')),
('test3', 'EST003', '11111111', 'CARLOS', 'RODRIGUEZ', 'MAMANI', 'EDUCACIÓN PRIMARIA COMUNITARIA VOCACIONAL', 'SEGUNDO', '70000003', 'carlos@test.com', datetime('now'));

-- Evento de prueba
INSERT INTO eventos VALUES 
('test_event_1', 'Evento de Prueba', '2024-01-15', '2024-01-15', '08:00', '18:00', NULL, '1', 1, datetime('now'));
EOF

echo "✅ Estructura de BD inicializada con datos de prueba"
echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "=================="
echo "1. Copiar las credenciales de 'config_desarrollo.js' a 'js/tursodb.js'"
echo "2. Cambiar versión en index.html (?v=nueva_version)"
echo "3. Ejecutar servidor local: python -m http.server 8000"
echo "4. Abrir: http://localhost:8000"
echo "5. Login: admin@escuela.com / Admin123!"
echo ""
echo "📊 DATOS DE PRUEBA INCLUIDOS:"
echo "- 3 estudiantes de ejemplo"
echo "- 1 evento de prueba"
echo "- Usuario admin configurado"
echo ""
echo "🎉 ¡Migración completada exitosamente!"