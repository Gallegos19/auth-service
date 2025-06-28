// scripts/setup-dev.js
// Script de configuración multiplataforma usando Node.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Funciones de logging
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  gear: (msg) => console.log(`${colors.purple}🔧 ${msg}${colors.reset}`)
};

function runCommand(command, description) {
  try {
    log.info(description);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log.error(`Error ejecutando: ${command}`);
    return false;
  }
}

function checkPrerequisites() {
  log.gear('Verificando prerrequisitos...');
  
  // Verificar Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion < 20) {
      log.error(`Node.js versión 20+ requerida. Versión actual: ${nodeVersion}`);
      process.exit(1);
    }
    
    log.success(`Node.js ${nodeVersion}`);
  } catch (error) {
    log.error('Node.js no está instalado');
    process.exit(1);
  }
  
  // Verificar npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log.success(`npm ${npmVersion}`);
  } catch (error) {
    log.error('npm no está instalado');
    process.exit(1);
  }
}

function setupEnvironment() {
  const envPath = '.env';
  const envExamplePath = '.env.example';
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      log.info('Creando archivo .env desde .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      log.warning('IMPORTANTE: Edita .env y configura tu connection string de Neon');
      log.warning('   USER_DB_URL=postgresql://...');
    } else {
      log.error('Archivo .env.example no encontrado');
      process.exit(1);
    }
  } else {
    log.success('Archivo .env existe');
  }
}

function setupPrismaSchema() {
  // Verificar si existe schema en la ubicación estándar
  const standardSchemaPath = 'prisma/schema.prisma';
  const currentSchemaPath = 'src/infrastructure/database/prisma/schema.prisma';
  
  if (!fs.existsSync(standardSchemaPath)) {
    if (fs.existsSync(currentSchemaPath)) {
      log.info('Moviendo schema de Prisma a ubicación estándar...');
      // Crear directorio prisma si no existe
      if (!fs.existsSync('prisma')) {
        fs.mkdirSync('prisma', { recursive: true });
      }
      // Copiar archivo
      fs.copyFileSync(currentSchemaPath, standardSchemaPath);
      log.success('Schema de Prisma movido a prisma/schema.prisma');
    } else {
      log.error('No se encontró schema.prisma en ninguna ubicación');
      log.info('Ubicaciones verificadas:');
      log.info('- prisma/schema.prisma');
      log.info('- src/infrastructure/database/prisma/schema.prisma');
      process.exit(1);
    }
  } else {
    log.success('Schema de Prisma encontrado en prisma/schema.prisma');
  }
}

function installDependencies() {
  if (!fs.existsSync('node_modules')) {
    log.info('Instalando dependencias...');
    if (!runCommand('npm install', 'Instalando paquetes npm...')) {
      process.exit(1);
    }
  } else {
    log.success('Dependencias ya instaladas');
  }
}

function setupPrisma() {
  log.gear('Generando cliente Prisma...');
  if (!runCommand('npx prisma generate', 'Generando cliente Prisma...')) {
    log.error('Falló la generación del cliente Prisma');
    log.info('Intentando con ruta específica del schema...');
    if (!runCommand('npx prisma generate --schema=src/infrastructure/database/prisma/schema.prisma', 'Generando con ruta específica...')) {
      process.exit(1);
    }
  }
}

function main() {
  console.log('🚀 Configurando entorno de desarrollo para Xuma\'a Auth Service...\n');
  
  checkPrerequisites();
  setupEnvironment();
  setupPrismaSchema();
  installDependencies();
  setupPrisma();
  
  console.log('\n✅ Configuración completada!\n');
  console.log('📋 Próximos pasos:');
  console.log('1. Configura tu base de datos Neon en .env');
  console.log('   USER_DB_URL=postgresql://usuario:password@host/database');
  console.log('2. Ejecuta: npm run dev:neon');
  console.log('3. Visita: http://localhost:3000/api/docs\n');
  console.log('🔗 Enlaces útiles:');
  console.log('- Neon Database: https://neon.tech');
  console.log('- Documentación Prisma: https://prisma.io/docs');
}

main();