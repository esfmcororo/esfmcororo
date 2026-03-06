#!/bin/bash

# COMANDOS ÚTILES PARA DESARROLLO

# 1. Iniciar servidor local
alias dev="python -m http.server 8000"

# 2. Ver cambios
alias cambios="git status"

# 3. Subir cambios rápido
function subir() {
    git add .
    git commit -m "$1"
    git push
    echo "✅ Cambios subidos. Espera 1-2 minutos para verlos en línea."
}

# USO:
# dev              → Inicia servidor local
# cambios          → Ver qué archivos cambiaron
# subir "mensaje"  → Sube cambios a producción

# EJEMPLO:
# subir "Agregué reportes de asistencia"
