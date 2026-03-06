#!/bin/bash

# Comandos para subir a GitHub
# Reemplaza TU-USUARIO con tu usuario de GitHub

git remote add origin https://github.com/TU-USUARIO/sfemcororo.git
git branch -M main
git push -u origin main

# Después de subir, habilita GitHub Pages:
# 1. Ve a: Settings → Pages
# 2. Source: Deploy from a branch
# 3. Branch: main → /public
# 4. Save
