# 🎓 Sistema de Asistencia QR - SFEM "Simón Bolívar"

Sistema web completo para registro de asistencias mediante códigos QR, desarrollado para instituciones educativas.

## 🚀 Características Implementadas

### ✅ Módulos Funcionales
- **Autenticación** con roles (admin/usuario)
- **Gestión de estudiantes** por especialidad y año
- **Gestión de usuarios** (docentes/admin)
- **Creación y edición de eventos**
- **Escaneo QR** con cámara o subida de imagen
- **Sistema offline inteligente** con recuperación automática
- **Generación masiva de QRs** por grupo
- **Carga masiva** desde Excel
- **Exportación a Excel** con estadísticas completas
- **Auditoría de registros** y limpieza de duplicados

### 🔧 Tecnologías
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Base de datos**: Turso (SQLite en la nube)
- **Librerías**: Html5-QrCode, QRCode.js, XLSX.js, JSZip
- **Hosting**: GitHub Pages

## 📦 Configuración para Desarrollo

### 1. Clonar el Repositorio
```bash
git clone https://github.com/sfemcororo-hash/sfemcororo.git
cd sfemcororo
```

### 2. Crear Nueva Base de Datos Turso (Para Desarrollo)

#### Instalar Turso CLI
```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows
powershell -c "irm get.tur.so/install.ps1 | iex"
```

#### Crear BD de Desarrollo
```bash
# Login en Turso
turso auth login

# Crear nueva BD para desarrollo
turso db create sistema-asistencia-dev

# Obtener URL de conexión
turso db show sistema-asistencia-dev

# Crear token de acceso
turso db tokens create sistema-asistencia-dev
```

### 3. Configurar Credenciales de Desarrollo

Editar `js/tursodb.js`:
```javascript
// CAMBIAR ESTAS CREDENCIALES POR LAS DE TU BD DE DESARROLLO
this.dbUrl = 'https://tu-bd-dev.turso.io';
this.authToken = 'tu-token-de-desarrollo-aqui';
```

### 4. Inicializar Base de Datos

Ejecutar scripts SQL en tu BD de desarrollo:

```sql
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

-- Crear usuario admin por defecto
INSERT INTO usuarios (ci, nombre, apellido_paterno, apellido_materno, email, password, especialidad, codigo_unico, rol) 
VALUES ('79310777', 'Admin', 'Sistema', 'Principal', 'admin@escuela.com', 'Admin123!', 'ADMINISTRACIÓN', 'ADM001', 'admin');
```

### 5. Ejecutar en Servidor Local

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server

# Opción 3: PHP
php -S localhost:8000
```

Abrir: http://localhost:8000

### 6. Credenciales de Prueba
- **Email**: admin@escuela.com
- **Contraseña**: Admin123!

## 🔄 Migración a Nueva BD

### Script de Migración Completa

```bash
#!/bin/bash
# migrate.sh

# 1. Exportar datos de BD actual
turso db shell sistema-asistencia-prod ".dump" > backup.sql

# 2. Crear nueva BD
turso db create sistema-asistencia-new

# 3. Importar datos
turso db shell sistema-asistencia-new < backup.sql

# 4. Obtener nuevas credenciales
echo "Nueva URL:"
turso db show sistema-asistencia-new | grep "URL"

echo "Nuevo Token:"
turso db tokens create sistema-asistencia-new
```

### Actualizar Código para Nueva BD

1. **Cambiar credenciales** en `js/tursodb.js`
2. **Actualizar versión** en `index.html` (cambiar `?v=` en scripts)
3. **Probar conexión** con usuario admin

## 📁 Estructura del Proyecto

```
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos completos
├── js/
│   ├── app.js              # Lógica principal (1800+ líneas)
│   └── tursodb.js          # Adaptador de BD
├── *.sql                   # Scripts de BD
├── FASE1_COMPLETADO.md     # Documentación de funcionalidades
├── PRUEBAS_FASE1.md        # Guía de pruebas
└── README.md               # Este archivo
```

## 🧪 Entorno de Pruebas vs Producción

### Producción (Actual)
- **URL**: https://sfemcororo-hash.github.io/sfemcororo/
- **BD**: sfemcororo-sfemcororo.aws-us-east-1.turso.io
- **Rama**: `main`

### Desarrollo (Nuevo)
- **URL**: http://localhost:8000
- **BD**: tu-bd-dev.turso.io
- **Rama**: `development` (crear nueva)

### Crear Rama de Desarrollo
```bash
git checkout -b development
git push -u origin development
```

## 🔧 Configuración Avanzada

### Variables de Entorno (Recomendado)
Crear archivo `.env.js`:
```javascript
const CONFIG = {
    TURSO_URL: 'https://tu-bd-dev.turso.io',
    TURSO_TOKEN: 'tu-token-aqui',
    ENVIRONMENT: 'development'
};
```

### Modo Debug
Agregar en `js/app.js`:
```javascript
const DEBUG = true; // Cambiar a false en producción
if (DEBUG) console.log('Modo desarrollo activo');
```

## 📊 Datos de Prueba

### Estudiantes de Ejemplo
```sql
INSERT INTO estudiantes VALUES 
('1', 'EST001', '12345678', 'JUAN', 'PEREZ', 'LOPEZ', 'MATEMÁTICA', 'PRIMERO', '70000001', 'juan@test.com', datetime('now')),
('2', 'EST002', '87654321', 'MARIA', 'GARCIA', 'SILVA', 'MATEMÁTICA', 'PRIMERO', '70000002', 'maria@test.com', datetime('now'));
```

### Evento de Prueba
```sql
INSERT INTO eventos VALUES 
('1', 'Evento de Prueba', '2024-01-15', '2024-01-15', '08:00', '18:00', NULL, '1', 1, datetime('now'));
```

## 🚀 Despliegue

### GitHub Pages (Automático)
1. Push a rama `main`
2. GitHub Pages se actualiza automáticamente
3. Disponible en: https://tu-usuario.github.io/tu-repo/

### Servidor Propio
1. Subir archivos por FTP/SSH
2. Configurar servidor web (Apache/Nginx)
3. Actualizar credenciales de BD

## 🔒 Seguridad (Pendiente - Fase 2)

- [ ] Variables de entorno para credenciales
- [ ] Encriptación de contraseñas
- [ ] Validación de inputs
- [ ] Protección CSRF
- [ ] Rate limiting
- [ ] Logs de auditoría

## 📞 Soporte

Para configurar tu entorno de desarrollo:
1. Sigue esta guía paso a paso
2. Crea tu propia BD en Turso
3. Actualiza las credenciales
4. Prueba con datos de ejemplo

**¡Listo para desarrollar!** 🎉