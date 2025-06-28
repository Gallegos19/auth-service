#!/bin/bash
# scripts/dev/start-neon.sh
# Script para iniciar desarrollo con Neon Database

set -e  # Salir si cualquier comando falla

echo "🚀 Iniciando Xuma'a Auth Service con Neon Database..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

# Verificar que el archivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Archivo .env no encontrado"
    echo "Copia .env.example a .env y configura tus variables"
    exit 1
fi

# Cargar variables de entorno
source .env

# Verificar que USER_DB_URL esté configurada
if [ -z "$USER_DB_URL" ]; then
    echo "❌ USER_DB_URL no está configurada en .env"
    echo "Por favor configura tu connection string de Neon en .env"
    exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Aplicar cambios a la base de datos
echo "🗄️ Sincronizando esquema con Neon Database..."
npx prisma db push

# Verificar conexión
echo "🔍 Verificando conexión a base de datos..."
if npx prisma db pull > /dev/null 2>&1; then
    echo "✅ Conexión a Neon exitosa"
else
    echo "❌ Error conectando a Neon Database"
    echo "Verifica tu connection string en .env"
    exit 1
fi

echo "✅ Configuración completada!"
echo "🌐 La aplicación estará disponible en: http://localhost:${PORT:-3000}"
echo "📚 Documentación API: http://localhost:${PORT:-3000}/api/docs"
echo ""
echo "🎯 Iniciando aplicación..."
npm run dev