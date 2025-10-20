#!/bin/bash

echo "🔒 Prisma Safe Mode — MagNode MVP"
echo "================================="
set -e

# Paso 1: Crear carpeta de backups si no existe
mkdir -p backups

# Paso 2: Backup automático con fecha y hora
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
backup_file="backups/dev_backup_${timestamp}.db"
if [ -f "prisma/dev.db" ]; then
  cp prisma/dev.db "$backup_file"
  echo "💾 Backup creado: $backup_file"
else
  echo "⚠️ No se encontró prisma/dev.db, se saltará el backup."
fi

# Paso 3: Validar schema antes de migrar
echo "🔍 Validando esquema Prisma..."
npx prisma validate

# Paso 4: Aplicar migración (nombre opcional pasado como argumento)
MIGRATION_NAME=${1:-auto_update}
echo "🧩 Aplicando migración: $MIGRATION_NAME"
npx prisma migrate dev --name "$MIGRATION_NAME"

# Paso 5: Regenerar Prisma Client
echo "⚙️ Regenerando Prisma Client..."
npx prisma generate

# Paso 6: Mostrar resumen de tablas
echo "📋 Tablas disponibles en dev.db:"
npx prisma db pull

# Paso 7: Abrir Prisma Studio
echo "🚀 Abriendo Prisma Studio..."
npx prisma studio