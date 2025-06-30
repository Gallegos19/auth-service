// scripts/setup-gmail.js
// Script para configurar Gmail OAuth2
require('dotenv').config();

const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

async function setupGmailOAuth() {
  console.log('🔧 Configurando Gmail OAuth2 para Xuma\'a Auth Service...\n');

  // Paso 1: Verificar variables de entorno
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  console.log(clientId, clientSecret);
  if (!clientId || !clientSecret) {
    console.log('❌ Error: Variables de entorno faltantes\n');
    console.log('📝 Necesitas configurar las siguientes variables en tu .env:');
    console.log('   GMAIL_CLIENT_ID=tu-client-id');
    console.log('   GMAIL_CLIENT_SECRET=tu-client-secret');
    console.log('   GMAIL_USER=tu-email@gmail.com\n');
    console.log('🔗 Para obtener estas credenciales:');
    console.log('   1. Ve a https://console.developers.google.com/');
    console.log('   2. Crea un nuevo proyecto o selecciona uno existente');
    console.log('   3. Habilita la Gmail API');
    console.log('   4. Crea credenciales OAuth 2.0');
    console.log('   5. Agrega https://developers.google.com/oauthplayground como redirect URI');
    return;
  }

  // Paso 2: Configurar OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  // Paso 3: Generar URL de autorización
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🔗 Autoriza la aplicación visitando esta URL:');
  console.log(authUrl);
  console.log('\n📋 Pasos para obtener el refresh token:');
  console.log('   1. Visita la URL de arriba');
  console.log('   2. Autoriza la aplicación');
  console.log('   3. Copia el código de autorización');
  console.log('   4. Pégalo aquí abajo\n');

  // Paso 4: Obtener código de autorización del usuario
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🔑 Ingresa el código de autorización: ', async (code) => {
    rl.close();

    try {
      // Paso 5: Intercambiar código por tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('\n✅ ¡Configuración exitosa!\n');
      console.log('📝 Agrega las siguientes variables a tu archivo .env:\n');
      console.log(`GMAIL_CLIENT_ID=${clientId}`);
      console.log(`GMAIL_CLIENT_SECRET=${clientSecret}`);
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log(`GMAIL_USER=tu-email@gmail.com`);
      console.log('\n🔄 Recuerda reiniciar el servidor después de actualizar el .env');
      
    } catch (error) {
      console.error('❌ Error obteniendo tokens:', error);
    }
  });
}

// Función para probar el envío de email
async function testGmailSending() {
  console.log('📧 Probando envío de email...\n');

try {
    const { GmailEmailService } = require('../src/infrastructure/external/GmailEmailService');
    const emailService = new GmailEmailService();

    await emailService.sendWelcomeEmail(
        process.env.GMAIL_USER,
        'Usuario de Prueba'
    );

    console.log('✅ Email de prueba enviado exitosamente!');
} catch (error) {
    console.error('❌ Error enviando email de prueba:', error);
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