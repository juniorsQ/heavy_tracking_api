const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completeInitialization() {
  try {
    console.log('🚀 Starting complete database initialization...');

    // 1. DROP ALL DATA - Como haría un dev semi-senior
    console.log('🧹 DROPPING ALL existing data...');
    
    // Eliminar en orden correcto para evitar problemas de foreign key
    await prisma.orderHasRoute.deleteMany();
    await prisma.deliveryConfirmation.deleteMany();
    await prisma.order.deleteMany();
    await prisma.route.deleteMany();
    await prisma.routeType.deleteMany();
    await prisma.workPlant.deleteMany();
    await prisma.address.deleteMany();
    await prisma.city.deleteMany();
    await prisma.state.deleteMany();
    await prisma.materialType.deleteMany();
    await prisma.truckType.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.verificationCode.deleteMany();
    await prisma.passwordResetCode.deleteMany();
    await prisma.user.deleteMany();
    await prisma.transportDivision.deleteMany();
    await prisma.userRole.deleteMany();

    console.log('✅ ALL data DROPPED successfully');

    // 2. INSERT BASIC DATA - Solo lo esencial
    console.log('📦 INSERTING basic data...');

    // User Roles básicos
    const adminRole = await prisma.userRole.create({ data: { name: 'admin' } });
    const driverRole = await prisma.userRole.create({ data: { name: 'driver' } });
    console.log('✅ User roles created');

    // Transport Divisions básicas
    const centralDivision = await prisma.transportDivision.create({ 
      data: { name: 'Central Florida Division', description: 'Orlando area' } 
    });
    const southDivision = await prisma.transportDivision.create({ 
      data: { name: 'South Florida Division', description: 'Miami area' } 
    });
    console.log('✅ Transport divisions created');

    // Material Types básicos
    await prisma.materialType.createMany({
      data: [
        { name: 'Sand', description: 'Construction sand' },
        { name: 'Gravel', description: 'Road gravel' },
        { name: 'Concrete', description: 'Ready-mix concrete' }
      ]
    });
    console.log('✅ Material types created');

    // Truck Types básicos
    await prisma.truckType.createMany({
      data: [
        { name: 'Dump Truck', capacity: 10.0, description: 'Standard dump truck' },
        { name: 'Semi Trailer', capacity: 20.0, description: 'Large semi trailer' }
      ]
    });
    console.log('✅ Truck types created');

    // Test User y Driver
    const testUser = await prisma.user.create({
      data: {
        email: 'test@floridasandgravel.com',
        name: 'Test',
        lastName: 'Driver',
        phoneNumber: '+1234567890',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        isVerified: true,
        roleId: driverRole.id
      }
    });

    const testDriver = await prisma.driver.create({
      data: {
        truckNumber: 'FSG-001',
        available: true,
        userId: testUser.id,
        transportDivisionId: centralDivision.id
      }
    });
    console.log('✅ Test user and driver created');

    // Estados y ciudades básicas
    const floridaState = await prisma.state.create({ data: { name: 'Florida' } });
    const orlandoCity = await prisma.city.create({ data: { name: 'Orlando', stateId: floridaState.id } });
    const orlandoAddress = await prisma.address.create({ data: { address: '123 Main St', zip: 32801, cityId: orlandoCity.id } });
    const centralPlant = await prisma.workPlant.create({ data: { name: 'Central Plant', addressId: orlandoAddress.id } });
    console.log('✅ Basic locations created');

    // Route types y rutas básicas
    const localRouteType = await prisma.routeType.create({ data: { name: 'Local' } });
    const testRoute = await prisma.route.create({ 
      data: { 
        miles: '25', 
        routeTypeId: localRouteType.id, 
        pickWorkPlantId: centralPlant.id, 
        dropWorkPlantId: centralPlant.id 
      } 
    });
    console.log('✅ Basic routes created');

    // Sample orders básicas
    await prisma.order.createMany({
      data: [
        {
          orderNumber: 'ORD-001',
          bolNumber: 'BOL-001',
          rate: 150.00,
          instructions: 'Deliver sand to construction site',
          weight: 10.5,
          material: 'Sand',
          status: 'PENDING',
          createdById: testUser.id,
          driverId: testDriver.id,
          routeId: testRoute.id
        },
        {
          orderNumber: 'ORD-002',
          bolNumber: 'BOL-002',
          rate: 200.00,
          instructions: 'Deliver gravel to road project',
          weight: 15.0,
          material: 'Gravel',
          status: 'IN_PROGRESS',
          createdById: testUser.id,
          driverId: testDriver.id,
          routeId: testRoute.id
        }
      ]
    });
    console.log('✅ Sample orders created');

    // 14. Final Status
    console.log('📊 Final Database Status:');
    const userRolesCount = await prisma.userRole.count();
    const transportDivisionsCount = await prisma.transportDivision.count();
    const materialTypesCount = await prisma.materialType.count();
    const truckTypesCount = await prisma.truckType.count();
    const statesCount = await prisma.state.count();
    const citiesCount = await prisma.city.count();
    const addressesCount = await prisma.address.count();
    const workPlantsCount = await prisma.workPlant.count();
    const routeTypesCount = await prisma.routeType.count();
    const routesCount = await prisma.route.count();
    const usersCount = await prisma.user.count();
    const driversCount = await prisma.driver.count();
    const ordersCount = await prisma.order.count();

    console.log(`- User Roles: ${userRolesCount}`);
    console.log(`- Transport Divisions: ${transportDivisionsCount}`);
    console.log(`- Material Types: ${materialTypesCount}`);
    console.log(`- Truck Types: ${truckTypesCount}`);
    console.log(`- States: ${statesCount}`);
    console.log(`- Cities: ${citiesCount}`);
    console.log(`- Addresses: ${addressesCount}`);
    console.log(`- Work Plants: ${workPlantsCount}`);
    console.log(`- Route Types: ${routeTypesCount}`);
    console.log(`- Routes: ${routesCount}`);
    console.log(`- Users: ${usersCount}`);
    console.log(`- Drivers: ${driversCount}`);
    console.log(`- Orders: ${ordersCount}`);

    console.log('🎉 Complete database initialization finished successfully!');
    console.log('');
    console.log('📋 Test Credentials:');
    console.log('Email: testdriver@floridasandgravel.com');
    console.log('Password: password');
    console.log('Truck Number: FSG-001');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
completeInitialization()
  .then(() => {
    console.log('✅ Initialization completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  });
