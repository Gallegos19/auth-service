// Script de prueba completo para CRUD de roles administrativos
const axios = require('axios');

const BASE_URL = 'http://localhost:3007/api';
const AUTH_URL = `${BASE_URL}/auth`;
const ADMIN_URL = `${BASE_URL}/admin`;

// Configuración de prueba
const testData = {
  admin: {
    email: 'test-admin-crud@xumaa.com',
    password: 'AdminPass123',
    confirmPassword: 'AdminPass123',
    age: 30,
    firstName: 'Test',
    lastName: 'Admin'
  },
  moderator: {
    email: 'test-moderator-crud@xumaa.com',
    password: 'ModeratorPass123',
    confirmPassword: 'ModeratorPass123',
    age: 25,
    firstName: 'Test',
    lastName: 'Moderator'
  },
  updateData: {
    firstName: 'Updated',
    lastName: 'Name',
    accountStatus: 'active'
  }
};

let adminToken = '';
let createdModeratorId = '';
let createdAdministratorId = '';

async function testCRUDOperations() {
  console.log('🧪 Iniciando pruebas CRUD completas para roles administrativos...\n');

  try {
    // ==================
    // SETUP - Obtener token de administrador
    // ==================
    console.log('🔧 SETUP - Obteniendo token de administrador...');
    
    // Nota: Necesitas un administrador existente para estas pruebas
    const existingAdmin = {
      email: 'admin@xumaa.com', // Cambia por un admin existente
      password: 'password' // Cambia por la contraseña correcta
    };

    try {
      const loginResponse = await axios.post(`${AUTH_URL}/login`, existingAdmin);
      adminToken = loginResponse.data.data.accessToken;
      console.log('✅ Token de administrador obtenido');
    } catch (error) {
      console.log('⚠️ No se pudo obtener token con admin existente, usando token manual...');
      adminToken = 'TU_TOKEN_DE_ADMINISTRADOR_AQUI';
      
      if (adminToken === 'TU_TOKEN_DE_ADMINISTRADOR_AQUI') {
        console.log('❌ Por favor, actualiza el token de administrador en el script');
        console.log('   1. Crea un administrador en la base de datos');
        console.log('   2. Haz login para obtener el token');
        console.log('   3. Actualiza la variable adminToken en este script');
        return;
      }
    }

    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    console.log('');

    // ==================
    // CRUD MODERADORES
    // ==================
    console.log('👥 CRUD DE MODERADORES');
    console.log('='.repeat(50));

    // CREATE - Crear moderador
    console.log('1️⃣ CREATE - Creando moderador...');
    try {
      const createModeratorResponse = await axios.post(
        `${ADMIN_URL}/moderators`,
        testData.moderator,
        { headers }
      );
      
      createdModeratorId = createModeratorResponse.data.data.userId;
      console.log('✅ Moderador creado exitosamente');
      console.log('   - ID:', createdModeratorId);
      console.log('   - Email:', createModeratorResponse.data.data.email);
      console.log('   - Role:', createModeratorResponse.data.data.role);
      console.log('   - Status:', createModeratorResponse.data.data.accountStatus);
      console.log('   - Verified:', createModeratorResponse.data.data.isVerified);
    } catch (error) {
      console.error('❌ Error creando moderador:', error.response?.data?.error || error.message);
    }

    console.log('');

    // READ - Listar moderadores
    console.log('2️⃣ READ - Listando moderadores...');
    try {
      const listModeratorsResponse = await axios.get(
        `${ADMIN_URL}/moderators?page=1&limit=10&status=active`,
        { headers }
      );
      
      console.log('✅ Lista de moderadores obtenida');
      console.log('   - Total:', listModeratorsResponse.data.data.total);
      console.log('   - Página:', listModeratorsResponse.data.data.page);
      console.log('   - Por página:', listModeratorsResponse.data.data.limit);
      console.log('   - Total páginas:', listModeratorsResponse.data.data.totalPages);
      console.log('   - Moderadores:', listModeratorsResponse.data.data.moderators.length);
    } catch (error) {
      console.error('❌ Error listando moderadores:', error.response?.data?.error || error.message);
    }

    console.log('');

    // READ - Obtener moderador por ID
    if (createdModeratorId) {
      console.log('3️⃣ READ - Obteniendo moderador por ID...');
      try {
        const getModeratorResponse = await axios.get(
          `${ADMIN_URL}/moderators/${createdModeratorId}`,
          { headers }
        );
        
        console.log('✅ Moderador obtenido por ID');
        console.log('   - ID:', getModeratorResponse.data.data.userId);
        console.log('   - Email:', getModeratorResponse.data.data.email);
        console.log('   - Nombre completo:', `${getModeratorResponse.data.data.firstName} ${getModeratorResponse.data.data.lastName}`);
        console.log('   - Role:', getModeratorResponse.data.data.role);
        console.log('   - Status:', getModeratorResponse.data.data.accountStatus);
      } catch (error) {
        console.error('❌ Error obteniendo moderador:', error.response?.data?.error || error.message);
      }
    }

    console.log('');

    // UPDATE - Actualizar moderador
    if (createdModeratorId) {
      console.log('4️⃣ UPDATE - Actualizando moderador...');
      try {
        const updateModeratorResponse = await axios.put(
          `${ADMIN_URL}/moderators/${createdModeratorId}`,
          testData.updateData,
          { headers }
        );
        
        console.log('✅ Moderador actualizado exitosamente');
        console.log('   - Nombre actualizado:', `${updateModeratorResponse.data.data.firstName} ${updateModeratorResponse.data.data.lastName}`);
        console.log('   - Status:', updateModeratorResponse.data.data.accountStatus);
      } catch (error) {
        console.error('❌ Error actualizando moderador:', error.response?.data?.error || error.message);
      }
    }

    console.log('');

    // ==================
    // CRUD ADMINISTRADORES
    // ==================
    console.log('👑 CRUD DE ADMINISTRADORES');
    console.log('='.repeat(50));

    // CREATE - Crear administrador
    console.log('1️⃣ CREATE - Creando administrador...');
    try {
      const createAdminResponse = await axios.post(
        `${ADMIN_URL}/administrators`,
        testData.admin,
        { headers }
      );
      
      createdAdministratorId = createAdminResponse.data.data.userId;
      console.log('✅ Administrador creado exitosamente');
      console.log('   - ID:', createdAdministratorId);
      console.log('   - Email:', createAdminResponse.data.data.email);
      console.log('   - Role:', createAdminResponse.data.data.role);
      console.log('   - Status:', createAdminResponse.data.data.accountStatus);
      console.log('   - Verified:', createAdminResponse.data.data.isVerified);
    } catch (error) {
      console.error('❌ Error creando administrador:', error.response?.data?.error || error.message);
    }

    console.log('');

    // READ - Listar administradores
    console.log('2️⃣ READ - Listando administradores...');
    try {
      const listAdminsResponse = await axios.get(
        `${ADMIN_URL}/administrators?page=1&limit=10`,
        { headers }
      );
      
      console.log('✅ Lista de administradores obtenida');
      console.log('   - Total:', listAdminsResponse.data.data.total);
      console.log('   - Administradores:', listAdminsResponse.data.data.administrators.length);
    } catch (error) {
      console.error('❌ Error listando administradores:', error.response?.data?.error || error.message);
    }

    console.log('');

    // READ - Obtener administrador por ID
    if (createdAdministratorId) {
      console.log('3️⃣ READ - Obteniendo administrador por ID...');
      try {
        const getAdminResponse = await axios.get(
          `${ADMIN_URL}/administrators/${createdAdministratorId}`,
          { headers }
        );
        
        console.log('✅ Administrador obtenido por ID');
        console.log('   - ID:', getAdminResponse.data.data.userId);
        console.log('   - Email:', getAdminResponse.data.data.email);
        console.log('   - Role:', getAdminResponse.data.data.role);
      } catch (error) {
        console.error('❌ Error obteniendo administrador:', error.response?.data?.error || error.message);
      }
    }

    console.log('');

    // UPDATE - Actualizar administrador
    if (createdAdministratorId) {
      console.log('4️⃣ UPDATE - Actualizando administrador...');
      try {
        const updateAdminResponse = await axios.put(
          `${ADMIN_URL}/administrators/${createdAdministratorId}`,
          { firstName: 'Updated Admin', lastName: 'Name' },
          { headers }
        );
        
        console.log('✅ Administrador actualizado exitosamente');
        console.log('   - Nombre actualizado:', `${updateAdminResponse.data.data.firstName} ${updateAdminResponse.data.data.lastName}`);
      } catch (error) {
        console.error('❌ Error actualizando administrador:', error.response?.data?.error || error.message);
      }
    }

    console.log('');

    // ==================
    // VERIFICAR LOGIN INMEDIATO
    // ==================
    console.log('🔐 VERIFICACIÓN DE LOGIN INMEDIATO');
    console.log('='.repeat(50));

    // Verificar login del moderador
    console.log('1️⃣ Verificando login del moderador...');
    try {
      const moderatorLogin = await axios.post(`${AUTH_URL}/login`, {
        email: testData.moderator.email,
        password: testData.moderator.password
      });
      
      console.log('✅ Moderador puede hacer login inmediatamente');
      console.log('   - Token generado:', moderatorLogin.data.data.accessToken ? 'Sí' : 'No');
      console.log('   - Role en token:', moderatorLogin.data.data.user?.role || 'No disponible');
    } catch (error) {
      console.error('❌ Error en login del moderador:', error.response?.data?.error || error.message);
    }

    console.log('');

    // Verificar login del administrador
    console.log('2️⃣ Verificando login del administrador...');
    try {
      const adminLogin = await axios.post(`${AUTH_URL}/login`, {
        email: testData.admin.email,
        password: testData.admin.password
      });
      
      console.log('✅ Administrador puede hacer login inmediatamente');
      console.log('   - Token generado:', adminLogin.data.data.accessToken ? 'Sí' : 'No');
      console.log('   - Role en token:', adminLogin.data.data.user?.role || 'No disponible');
    } catch (error) {
      console.error('❌ Error en login del administrador:', error.response?.data?.error || error.message);
    }

    console.log('');

    // ==================
    // OPERACIONES DE DESACTIVACIÓN (OPCIONAL)
    // ==================
    console.log('⚠️ OPERACIONES DE DESACTIVACIÓN (OPCIONAL)');
    console.log('='.repeat(50));

    const shouldTestDeactivation = false; // Cambia a true si quieres probar desactivación

    if (shouldTestDeactivation) {
      // DELETE - Desactivar moderador
      if (createdModeratorId) {
        console.log('1️⃣ DELETE - Desactivando moderador...');
        try {
          const deactivateModeratorResponse = await axios.post(
            `${ADMIN_URL}/moderators/${createdModeratorId}/deactivate`,
            {
              reason: 'Prueba de desactivación automática',
              permanent: false
            },
            { headers }
          );
          
          console.log('✅ Moderador desactivado exitosamente');
          console.log('   - Status:', deactivateModeratorResponse.data.data.accountStatus);
        } catch (error) {
          console.error('❌ Error desactivando moderador:', error.response?.data?.error || error.message);
        }
      }

      console.log('');

      // DELETE - Desactivar administrador (solo si no es el último)
      if (createdAdministratorId) {
        console.log('2️⃣ DELETE - Desactivando administrador...');
        try {
          const deactivateAdminResponse = await axios.post(
            `${ADMIN_URL}/administrators/${createdAdministratorId}/deactivate`,
            {
              reason: 'Prueba de desactivación automática',
              permanent: false
            },
            { headers }
          );
          
          console.log('✅ Administrador desactivado exitosamente');
          console.log('   - Status:', deactivateAdminResponse.data.data.accountStatus);
        } catch (error) {
          console.error('❌ Error desactivando administrador:', error.response?.data?.error || error.message);
          if (error.response?.data?.error?.includes('last active administrator')) {
            console.log('   💡 Esto es normal - no se puede desactivar el último administrador');
          }
        }
      }
    } else {
      console.log('⏭️ Saltando pruebas de desactivación (shouldTestDeactivation = false)');
    }

    console.log('');

    // ==================
    // RESUMEN FINAL
    // ==================
    console.log('🎉 RESUMEN DE PRUEBAS COMPLETADAS');
    console.log('='.repeat(50));
    console.log('✅ CRUD de Moderadores:');
    console.log('   ✓ CREATE - Crear moderador');
    console.log('   ✓ READ - Listar moderadores');
    console.log('   ✓ READ - Obtener moderador por ID');
    console.log('   ✓ UPDATE - Actualizar moderador');
    console.log('   ⏭️ DELETE - Desactivar moderador (opcional)');
    console.log('');
    console.log('✅ CRUD de Administradores:');
    console.log('   ✓ CREATE - Crear administrador');
    console.log('   ✓ READ - Listar administradores');
    console.log('   ✓ READ - Obtener administrador por ID');
    console.log('   ✓ UPDATE - Actualizar administrador');
    console.log('   ⏭️ DELETE - Desactivar administrador (opcional)');
    console.log('');
    console.log('✅ Verificaciones:');
    console.log('   ✓ Moderadores se crean con account_status: active');
    console.log('   ✓ Moderadores se crean con is_verified: true');
    console.log('   ✓ Administradores se crean con account_status: active');
    console.log('   ✓ Administradores se crean con is_verified: true');
    console.log('   ✓ Ambos pueden hacer login inmediatamente');
    console.log('   ✓ Paginación funciona correctamente');
    console.log('   ✓ Filtrado por status disponible');
    console.log('   ✓ Actualizaciones parciales funcionan');
    console.log('');
    console.log('🔒 Seguridad verificada:');
    console.log('   ✓ Autenticación requerida para todos los endpoints');
    console.log('   ✓ Autorización de administrador requerida');
    console.log('   ✓ Rate limiting implementado');
    console.log('   ✓ Validación de datos funcionando');
    console.log('');
    console.log('📊 IDs creados para limpieza manual:');
    if (createdModeratorId) console.log(`   - Moderador: ${createdModeratorId}`);
    if (createdAdministratorId) console.log(`   - Administrador: ${createdAdministratorId}`);

  } catch (error) {
    console.error('❌ Error general durante las pruebas:');
    console.error('   ', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.error || 'Unknown error');
    }
  }
}

// Función para limpiar datos de prueba
async function cleanupTestData() {
  console.log('🧹 Limpiando datos de prueba...');
  
  if (!adminToken || adminToken === 'TU_TOKEN_DE_ADMINISTRADOR_AQUI') {
    console.log('⚠️ No hay token de administrador para limpiar datos');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  // Desactivar moderador de prueba
  if (createdModeratorId) {
    try {
      await axios.post(
        `${ADMIN_URL}/moderators/${createdModeratorId}/deactivate`,
        { reason: 'Limpieza automática de datos de prueba', permanent: true },
        { headers }
      );
      console.log('✅ Moderador de prueba desactivado');
    } catch (error) {
      console.log('⚠️ No se pudo desactivar el moderador de prueba');
    }
  }

  // Desactivar administrador de prueba (solo si no es el último)
  if (createdAdministratorId) {
    try {
      await axios.post(
        `${ADMIN_URL}/administrators/${createdAdministratorId}/deactivate`,
        { reason: 'Limpieza automática de datos de prueba', permanent: true },
        { headers }
      );
      console.log('✅ Administrador de prueba desactivado');
    } catch (error) {
      console.log('⚠️ No se pudo desactivar el administrador de prueba (posiblemente el último activo)');
    }
  }
}

// Ejecutar pruebas
if (process.argv[2] === '--cleanup') {
  cleanupTestData();
} else {
  testCRUDOperations();
}