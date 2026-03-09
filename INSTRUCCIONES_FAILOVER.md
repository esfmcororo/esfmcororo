# Sistema de Failover Automático - Instrucciones

## ¿Qué hace?

El sistema ahora tiene **2 bases de datos**:
- **BD Principal**: Tu Turso actual (sfemcororo)
- **BD Respaldo**: Segunda BD de Turso (debes crearla)

Si la BD principal falla, el sistema **automáticamente** cambia a la BD de respaldo sin que el usuario lo note.

## Configuración (IMPORTANTE)

### Paso 1: Crear BD de Respaldo en Turso

1. Ve a https://turso.tech
2. Crea una nueva base de datos llamada `sfemcororo-backup`
3. Copia la URL y el token de autenticación

### Paso 2: Configurar Credenciales

Edita el archivo `js/tursodb.js` líneas 10-13:

```javascript
this.backupDb = {
    url: 'https://TU-BD-BACKUP.turso.io',  // ← Poner URL de tu BD backup
    token: 'TU_TOKEN_BACKUP_AQUI'          // ← Poner token de tu BD backup
};
```

### Paso 3: Inicializar BD de Respaldo

Ejecuta este script una vez para crear las tablas en la BD backup:

```bash
# Conectar a tu BD backup y ejecutar:
turso db shell sfemcororo-backup < CREAR_TABLAS.sql
```

O copia manualmente las tablas desde la BD principal.

## ¿Cómo funciona?

### Failover Automático
1. Usuario hace una operación (login, registrar asistencia, etc.)
2. Sistema intenta usar BD principal
3. **Si falla** → Cambia automáticamente a BD respaldo
4. Usuario ve notificación: "⚠️ Usando servidor de respaldo"
5. Sistema sigue funcionando normalmente

### Sincronización Automática
- Cada operación de escritura (INSERT, UPDATE, DELETE) se replica a ambas BDs
- Si una BD está caída, guarda en cola y sincroniza cuando vuelva
- Cuando BD principal se recupera, vuelve automáticamente

### Recuperación Automática
- Cada 30 segundos verifica si BD principal volvió
- Si detecta que funciona, cambia de vuelta automáticamente
- Sincroniza todos los cambios pendientes

## Ventajas

✅ **Sin caídas**: Si Turso falla, sigues trabajando
✅ **Automático**: No necesitas hacer nada manualmente
✅ **Sincronizado**: Ambas BDs tienen los mismos datos
✅ **Transparente**: Usuario no nota el cambio

## Monitoreo

En la consola del navegador verás:
- `✅ Sincronizado a BD backup` - Datos replicados correctamente
- `⚠️ Cambiando a BD de respaldo...` - Failover activado
- `✅ Restaurando BD principal...` - Volvió a BD principal

## Costos

- Turso Free Tier: 500 MB por BD
- Con 2 BDs: 1 GB total gratis
- Suficiente para miles de estudiantes y asistencias

## Alternativa: BD Local como Respaldo

Si no quieres pagar por segunda BD en Turso, puedes usar LocalStorage como respaldo temporal:

```javascript
// En lugar de segunda BD Turso, usar localStorage
this.backupDb = {
    type: 'localStorage',
    prefix: 'backup_'
};
```

Esto guarda datos localmente en el navegador como respaldo de emergencia.
