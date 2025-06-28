#!/bin/bash
# scripts/config.sh
# Configuración común para todos los scripts

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
GEAR="🔧"
DATABASE="🗄️"
PACKAGE="📦"

# Funciones de logging
log_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

log_error() {
    echo -e "${RED}${ERROR} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

log_gear() {
    echo -e "${PURPLE}${GEAR} $1${NC}"
}

# Verificar si estamos en el directorio raíz del proyecto
check_project_root() {
    if [ ! -f "package.json" ]; then
        log_error "Este script debe ejecutarse desde la raíz del proyecto"
        exit 1
    fi
}

# Verificar prerrequisitos básicos
check_prerequisites() {
    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado"
        exit 1
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        log_error "npm no está instalado"
        exit 1
    fi
    
    # Archivo .env
    if [ ! -f ".env" ]; then
        log_error "Archivo .env no encontrado. Copia .env.example a .env"
        exit 1
    fi
}

# Cargar variables de entorno
load_env() {
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
}