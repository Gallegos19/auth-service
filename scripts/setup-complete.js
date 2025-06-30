// scripts/setup-complete.js
// Script completo para configurar el Auth Service con Gmail

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

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.purple}🔧 ${msg}${colors.reset}`)
};

async function runCommand(command, description) {
  try {
    log.info(description);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log.error(`Error ejecutando: ${command}`);
    return false;
  }
}

function checkEnvironment() {
  log.step('Verificando prerrequisitos...');
  
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

function setupEnvironmentFile() {
  log.step('Configurando archivo .env...');
  
  const envPath = '.env';
  const envExamplePath = '.env.example';
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      log.info('Creando .env desde .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      log.success('Archivo .env creado');
    } else {
      log.error('.env.example no encontrado');
      process.exit(1);
    }
  } else {
    log.success('Archivo .env ya existe');
  }
}

function installDependencies() {
  log.step('Instalando dependencias...');
  
  if (!fs.existsSync('node_modules')) {
    if (!runCommand('npm install', 'Instalando paquetes npm...')) {
      process.exit(1);
    }
  } else {
    log.success('Dependencias ya instaladas');
  }
}

function setupPrisma() {
  log.step('Configurando Prisma...');
  
  if (!runCommand('npx prisma generate', 'Generando cliente Prisma...')) {
    log.error('Falló la generación del cliente Prisma');
    process.exit(1);
  }
}

function checkDatabaseConnection() {
  log.step('Verificando configuración de base de datos...');
  
  require('dotenv').config();
  
  if (!process.env.USER_DB_URL) {
    log.warning('USER_DB_URL no configurada en .env');
    log.info('Configura tu string de conexión de Neon Database en .env');
    return false;
  }
  
  log.success('URL de base de datos configurada');
  return true;
}

function checkGmailConfiguration() {
  log.step('Verificando configuración de Gmail...');
  
  require('dotenv').config();
  
  const gmailVars = [
    'GMAIL_CLIENT_ID',
    'GMAIL_CLIENT_SECRET', 
    'GMAIL_REFRESH_TOKEN',
    'GMAIL_USER'
  ];
  
  const missingVars = gmailVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log.warning(`Variables de Gmail faltantes: ${missingVars.join(', ')}`);
    log.info('El servicio usará emails mock. Para emails reales:');
    log.info('1. Lee CONFIGURACIÓN_GMAIL.md');
    log.info('2. Ejecuta: npm run gmail:setup');
    return false;
  }
  
  log.success('Gmail completamente configurado');
  return true;
}

function displayConfiguration() {
  require('dotenv').config();
  
  console.log('\n' + '='.repeat(60));
  console.log('🌱 CONFIGURACIÓN DE XUMA\'A AUTH SERVICE');
  console.log('='.repeat(60));
  
  console.log(`📊 Puerto del servidor: ${process.env.PORT || '3000'}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Base de datos: ${process.env.USER_DB_URL ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`📧 Gmail: ${checkGmailConfigurationSync() ? '✅ Configurado' : '⚠️ Mock mode'}`);
  console.log(`🔑 JWT: ${process.env.JWT_ACCESS_SECRET ? '✅ Configurado' : '⚠️ Usando defaults'}`);
  
  console.log('\n📋 Próximos pasos:');
  if (!process.env.USER_DB_URL) {
    console.log('1. Configura USER_DB_URL en .env');
  }
  if (!checkGmailConfigurationSync()) {
    console.log('2. Configura Gmail: npm run gmail:setup');
  }
  console.log('3. Ejecuta: npm run dev');
  console.log('4. Visita: http://localhost:3000/api/docs');
  
  console.log('\n🔗 Enlaces útiles:');
  console.log('- Documentación API: http://localhost:3000/api/docs');
  console.log('- Health Check: http://localhost:3000/health');
  console.log('- Neon Database: https://console.neon.tech');
  console.log('- Gmail Setup: Lee CONFIGURACIÓN_GMAIL.md');
  
  console.log('\n' + '='.repeat(60));
}

function checkGmailConfigurationSync() {
  const gmailVars = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'GMAIL_USER'];
  return gmailVars.every(varName => process.env[varName]);
}

async function main() {
  console.log('🚀 Configuración completa de Xuma\'a Auth Service\n');
  
  try {
    checkEnvironment();
    setupEnvironmentFile();
    installDependencies();
    setupPrisma();
    
    const dbOk = checkDatabaseConnection();
    const gmailOk = checkGmailConfiguration();
    
    console.log('\n✅ Configuración básica completada!\n');
    
    displayConfiguration();
    
    if (!dbOk) {
      log.warning('\n⚠️ Recuerda configurar la base de datos antes de ejecutar el servidor');
    }
    
    if (!gmailOk) {
      log.info('\n📧 Para configurar Gmail OAuth2, ejecuta: npm run gmail:setup');
    }
    
    console.log('\n🎉 ¡Listo para desarrollar! Ejecuta: npm run dev');
    
  } catch (error) {
    log.error('Error durante la configuración:');
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);