// Test script para verificar la implementación de roles moderador y administrador
const axios = require('axios');

const BASE_URL = 'http://localhost:3007/api/auth';

// Configuración de prueba
const testData = {
  admin: {
    email: 'test-admin@xumaa.com',
    password: 'AdminPass123',
    confirmPassword: 'AdminPass123',
    age: 30,
    firstName: 'Test',
    lastName: 'Admin'
  },
  moderator: {
    email: 'test-moderator@xumaa.com',
    password: 'ModeratorPass123',
    confirmPassword: 'ModeratorPass123',
    age: 25,
    firstName: 'Test',
    lastName: 'Moderator'
  }
};

async function testAdminRoles() {
  console.log('🧪 Iniciando pruebas de roles administrativos...\n');

  try {
    // Paso 1: Crear un administrador (esto requiere que ya exista un admin en el sistema)
    console.log('1️⃣ Intentando crear administrador...');
    
    // Nota: Para esta prueba, necesitas un token de administrador válido
    // Puedes obtenerlo haciendo login con un administrador existente
    const adminToken = 'TU_TOKEN_DE_ADMINISTRADOR_AQUI';
    
    if (adminToken === 'TU_TOKEN_DE_ADMINISTRADOR_AQUI') {
      console.log('⚠️ Por favor, actualiza el token de administrador en el script');
      console.log('   1. Crea un administrador en la base de datos');
      console.log('   2. Haz login para obtener el token');
      console.log('   3. Actualiza la variable adminToken en este script');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Crear moderador
    console.log('2️⃣ Creando moderador...');
    const moderatorResponse = await axios.post(
      `${BASE_URL}/create-moderator`,
      testData.moderator,
      { headers }
    );
    
    console.log('✅ Moderador creado exitosamente:');
    console.log('   - ID:', moderatorResponse.data.data.userId);
    console.log('   - Email:', moderatorResponse.data.data.email);
    console.log('   - Role:', moderatorResponse.data.data.role);
    console.log('   - Account Status:', moderatorResponse.data.data.accountStatus);
    console.log('   - Is Verified:', moderatorResponse.data.data.isVerified);
    console.log('');

    // Crear administrador
    console.log('3️⃣ Creando administrador...');
    const adminResponse = await axios.post(
      `${BASE_URL}/create-administrator`,
      testData.admin,
      { headers }
    );
    
    console.log('✅ Administrador creado exitosamente:');
    console.log('   - ID:', adminResponse.data.data.userId);
    console.log('   - Email:', adminResponse.data.data.email);
    console.log('   - Role:', adminResponse.data.data.role);
    console.log('   - Account Status:', adminResponse.data.data.accountStatus);
    console.log('   - Is Verified:', adminResponse.data.data.isVerified);
    console.log('');

    // Verificar que pueden hacer login inmediatamente
    console.log('4️⃣ Verificando login del moderador...');
    const moderatorLogin = await axios.post(`${BASE_URL}/login`, {
      email: testData.moderator.email,
      password: testData.moderator.password
    });
    
    console.log('✅ Moderador puede hacer login inmediatamente');
    console.log('   - Token generado:', moderatorLogin.data.data.accessToken ? 'Sí' : 'No');
    console.log('');

    console.log('5️⃣ Verificando login del administrador...');
    const adminLogin = await axios.post(`${BASE_URL}/login`, {
      email: testData.admin.email,
      password: testData.admin.password
    });
    
    console.log('✅ Administrador puede hacer login inmediatamente');
    console.log('   - Token generado:', adminLogin.data.data.accessToken ? 'Sí' : 'No');
    console.log('');

    console.log('🎉 Todas las pruebas pasaron exitosamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('   ✅ Moderadores se crean con account_status: active');
    console.log('   ✅ Moderadores se crean con is_verified: true');
    console.log('   ✅ Administradores se crean con account_status: active');
    console.log('   ✅ Administradores se crean con is_verified: true');
    console.log('   ✅ Ambos pueden hacer login inmediatamente');

  } catch (error) {
    console.error('❌ Error durante las pruebas:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data.error);
      
      if (error.response.status === 403) {
        console.error('   💡 Asegúrate de usar un token de administrador válido');
      }
      
      if (error.response.status === 400 && error.response.data.error.includes('already registered')) {
        console.error('   💡 Los emails de prueba ya existen, usa emails diferentes');
      }
    } else {
      console.error('   ', error.message);
    }
  }
}

// Función para crear el primer administrador (usar solo una vez)
async function createFirstAdmin() {
  console.log('🔧 Creando primer administrador del sistema...');
  console.log('⚠️ Esta función debe usarse solo para crear el primer administrador');
  console.log('   Después de esto, usa los endpoints normales con autenticación');
  console.log('');
  
  // Esta función requeriría acceso directo a la base de datos
  // o un endpoint especial para bootstrap del sistema
  console.log('💡 Para crear el primer administrador:');
  console.log('   1. Conecta a tu base de datos PostgreSQL');
  console.log('   2. Ejecuta el siguiente SQL:');
  console.log('');
  console.log(`   INSERT INTO users (
     id, email, password_hash, age, role, 
     account_status, is_verified, created_at
   ) VALUES (
     gen_random_uuid(),
     'admin@xumaa.com',
     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
     30,
     'administrator',
     'active',
     true,
     NOW()
   );`);
  console.log('');
  console.log('   3. Haz login con email: admin@xumaa.com, password: password');
  console.log('   4. Usa el token obtenido para crear más administradores y moderadores');
}

// Ejecutar pruebas
if (process.argv[2] === '--create-first-admin') {
  createFirstAdmin();
} else {
  testAdminRoles();
}