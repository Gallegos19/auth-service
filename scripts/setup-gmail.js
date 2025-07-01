// scripts/setup-gmail.js - CORRECCIÓN INMEDIATA
require('dotenv').config();
require('ts-node').register();

const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

async function setupGmailOAuth() {
  console.log('🔧 Configurando Gmail OAuth2 para Xuma\'a Auth Service...\n');

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  console.log(clientId, clientSecret);
  
  if (!clientId || !clientSecret) {
    console.log('❌ Error: Variables de entorno faltantes\n');
    console.log('📝 Necesitas configurar las siguientes variables en tu .env:');
    console.log('   GMAIL_CLIENT_ID=tu-client-id');
    console.log('   GMAIL_CLIENT_SECRET=tu-client-secret');
    console.log('   GMAIL_USER=tu-email@gmail.com\n');
    return;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  // CORRECCIÓN: Agregar prompt: 'consent' para forzar refresh token
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // 🔧 ESTO ES CRUCIAL
  });

  console.log('🔗 Autoriza la aplicación visitando esta URL:');
  console.log(authUrl);
  console.log('\n📋 Pasos para obtener el refresh token:');
  console.log('   1. Visita la URL de arriba');
  console.log('   2. Autoriza la aplicación');
  console.log('   3. Copia el código de autorización');
  console.log('   4. Pégalo aquí abajo\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🔑 Ingresa el código de autorización: ', async (code) => {
    rl.close();

    try {
      console.log('\n🔄 Intercambiando código por tokens...');
      const { tokens } = await oauth2Client.getToken(code);
      
      // 🔧 CORRECCIÓN: Verificar que tenemos refresh token
      console.log('🔍 Tokens recibidos:', {
        access_token: tokens.access_token ? '✅ Recibido' : '❌ Faltante',
        refresh_token: tokens.refresh_token ? '✅ Recibido' : '❌ Faltante',
        expires_in: tokens.expiry_date ? '✅ Configurado' : '❌ No configurado'
      });

      if (!tokens.refresh_token) {
        console.log('\n⚠️ NO SE OBTUVO REFRESH TOKEN');
        console.log('🔧 Soluciones:');
        console.log('   1. Ve a https://myaccount.google.com/permissions');
        console.log('   2. Revoca acceso a "Xuma\'a Auth Service"');
        console.log('   3. Ejecuta el comando nuevamente');
        console.log('   4. Asegúrate de autorizar completamente\n');
        return;
      }
      
      console.log('\n✅ ¡Configuración exitosa!\n');
      console.log('📝 Agrega las siguientes variables a tu archivo .env:\n');
      console.log(`GMAIL_CLIENT_ID=${clientId}`);
      console.log(`GMAIL_CLIENT_SECRET=${clientSecret}`);
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`); // 🔧 Ahora debería aparecer
      console.log(`GMAIL_USER=tu-email@gmail.com`);
      console.log('\n🔄 Recuerda reiniciar el servidor después de actualizar el .env');
      
    } catch (error) {
      console.error('❌ Error obteniendo tokens:', error);
      
      if (error.message && error.message.includes('invalid_grant')) {
        console.log('\n🔧 Error invalid_grant - Soluciones:');
        console.log('   1. El código expiró (máximo 10 minutos)');
        console.log('   2. El código ya se usó anteriormente');
        console.log('   3. Obtén un código NUEVO y úsalo inmediatamente');
      }
    }
  });
}

// Función para probar el envío de email
async function testGmailSending() {
  console.log('📧 Probando envío de email...\n');

  // Verificar variables requeridas
  const requiredVars = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'GMAIL_USER'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('❌ Variables faltantes en .env:', missingVars.join(', '));
    console.log('🔧 Ejecuta primero: npm run gmail:setup');
    return;
  }

  try {
    const { GmailEmailService } = require('../src/infrastructure/external/GmailEmailService');
    const emailService = new GmailEmailService();

    await emailService.sendWelcomeEmail(
      process.env.GMAIL_USER,
      'Usuario de Prueba'
    );

    console.log('✅ Email de prueba enviado exitosamente!');
    console.log(`📧 Revisa la bandeja de entrada de: ${process.env.GMAIL_USER}`);
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error.message);
    
    if (error.message.includes('Invalid Credentials')) {
      console.log('\n🔧 El refresh token puede haber expirado o ser inválido.');
      console.log('💡 Solución: npm run gmail:setup');
    }
  }
}

// Ejecutar según argumentos
const command = process.argv[2];

if (command === 'setup') {
  setupGmailOAuth();
} else if (command === 'test') {
  testGmailSending();
} else {
  console.log('🔧 Gmail OAuth2 Setup para Xuma\'a\n');
  console.log('Comandos disponibles:');
  console.log('  npm run gmail:setup  - Configurar OAuth2');
  console.log('  npm run gmail:test   - Probar envío de email\n');
  console.log('📚 Documentación: https://developers.google.com/gmail/api/auth/about-auth');
}

module.exports = { setupGmailOAuth, testGmailSending };