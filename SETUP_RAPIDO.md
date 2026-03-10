# ⚡ Guía Rápida - Configurar Entorno de Desarrollo

## 🚀 Opción 1: Script Automático (Recomendado)

```bash
# 1. Ejecutar script de migración
./migrate.sh

# 2. Seguir las instrucciones en pantalla
# 3. Copiar credenciales generadas a js/tursodb.js
# 4. Ejecutar servidor local
python -m http.server 8000
```

## 🔧 Opción 2: Manual

### 1. Instalar Turso CLI
```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
```

### 2. Crear BD de Desarrollo
```bash
turso db create mi-sistema-dev
turso db tokens create mi-sistema-dev
turso db show mi-sistema-dev
```

### 3. Actualizar Credenciales
Editar `js/tursodb.js`:
```javascript
this.dbUrl = 'https://tu-nueva-bd.turso.io';
this.authToken = 'tu-nuevo-token';
```

### 4. Cambiar Versión Cache
Editar `index.html`:
```html
<script src="js/tursodb.js?v=DEV001"></script>
<script src="js/app.js?v=DEV001"></script>
```

### 5. Ejecutar Localmente
```bash
python -m http.server 8000
# Abrir: http://localhost:8000
# Login: admin@escuela.com / Admin123!
```

## 📊 Verificar Instalación

1. ✅ Login funciona
2. ✅ Crear estudiante
3. ✅ Crear evento
4. ✅ Escanear QR (usar datos de prueba)
5. ✅ Modo offline funciona

## 🔄 Sincronizar con Producción

```bash
# Crear rama de desarrollo
git checkout -b development
git add .
git commit -m "Configurar entorno de desarrollo"
git push -u origin development
```

## 🎯 Datos de Prueba Incluidos

- **Estudiantes**: EST001, EST002, EST003
- **Evento**: "Evento de Prueba"
- **Admin**: admin@escuela.com / Admin123!

¡Listo para desarrollar! 🎉