// scripts/start-neon.js
// Script para iniciar desarrollo con Neon Database

const { execSync, spawn } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m'
};

// Funciones de logging
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  gear: (msg) => console.log(`${colors.purple}🔧 ${msg}${colors.reset}`)
};

function runCommand(command, description, silent = false) {
  try {
    if (!silent) log.info(description);
    execSync(command, { stdio: silent ? 'pipe' : 'inherit' });
    return true;
  } catch (error) {
    log.error(`Error ejecutando: ${command}`);
    return false;
  }
}

function checkEnvironment() {
  // Verificar archivo .env
  if (!fs.existsSync('.env')) {
    log.error('Archivo .env no encontrado');
    log.info('Ejecuta primero: npm run setup:dev');
    process.exit(1);
  }
  
  // Verificar USER_DB_URL
  if (!process.env.USER_DB_URL) {
    log.error('USER_DB_URL no está configurada en .env');
    log.info('Por favor configura tu connection string de Neon en .env');
    log.info('Ejemplo: USER_DB_URL=postgresql://usuario:password@host.neon.tech/database?sslmode=require');
    process.exit(1);
  }
  
  log.success('Variables de entorno configuradas');
}

function installDependencies() {
  if (!fs.existsSync('node_modules')) {
    log.info('Instalando dependencias...');
    if (!runCommand('npm install', 'Instalando paquetes npm...')) {
      process.exit(1);
    }
  }
}

function setupDatabase() {
  log.gear('Configurando base de datos...');
  
  // Generar cliente Prisma
  if (!runCommand('npx prisma generate', 'Generando cliente Prisma...')) {
    process.exit(1);
  }
  
  // Sincronizar esquema con Neon
  log.info('Sincronizando esquema con Neon Database...');
  if (!runCommand('npx prisma db push', 'Aplicando cambios a la base de datos...')) {
    log.error('Error sincronizando con Neon Database');
    log.info('Verifica tu connection string en .env');
    log.info('Formato correcto: postgresql://usuario:password@host.neon.tech/database?sslmode=require');
    process.exit(1);
  }
  
  // Verificar conexión
  log.info('Verificando conexión a base de datos...');
  try {
    execSync('npx prisma db pull', { stdio: 'pipe' });
    log.success('Conexión a Neon exitosa');
  } catch (error) {
    log.warning('Advertencia: No se pudo verificar la conexión completa, pero la configuración parece correcta');
  }
}

function startDevelopment() {
  const port = process.env.PORT || 3000;
  
  console.log('\n✅ Configuración completada!');
  console.log(`🌐 La aplicación estará disponible en: http://localhost:${port}`);
  console.log(`📚 Documentación API: http://localhost:${port}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${port}/health`);
  console.log('\n🎯 Iniciando aplicación...\n');
  
  // Iniciar aplicación en modo desarrollo
  const devProcess = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  // Manejar cierre del proceso
  process.on('SIGINT', () => {
    log.info('\n🛑 Cerrando aplicación...');
    devProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log.info('🛑 Cerrando aplicación...');
    devProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  devProcess.on('exit', (code) => {
    if (code !== 0) {
      log.error(`Aplicación terminó con código de error: ${code}`);
    }
    process.exit(code || 0);
  });
}

function main() {
  console.log('🚀 Iniciando Xuma\'a Auth Service con Neon Database...\n');
  
  try {
    checkEnvironment();
    installDependencies();
    setupDatabase();
    startDevelopment();
  } catch (error) {
    log.error('Error durante la inicialización:');
    console.error(error);
    process.exit(1);
  }
}

main();