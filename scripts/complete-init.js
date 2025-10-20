const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completeInitialization() {
  try {
    console.log('🚀 Starting complete database initialization...');

    // 1. Clear existing data (except users and drivers)
    console.log('🧹 Clearing existing data...');
    
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
    await prisma.transportDivision.deleteMany();
    await prisma.userRole.deleteMany();

    console.log('✅ Data cleared successfully');

    // 2. Create User Roles
    console.log('👥 Creating user roles...');
    const roles = await prisma.userRole.createMany({
      data: [
        { name: 'admin' },
        { name: 'driver' },
        { name: 'dispatcher' }
      ]
    });
    console.log(`✅ Created ${roles.count} user roles`);

    // 3. Create Transport Divisions
    console.log('🚛 Creating transport divisions...');
    const transportDivisions = await prisma.transportDivision.createMany({
      data: [
        { name: 'Central Florida Division', description: 'Covers Orlando, Lakeland, and Winter Haven areas' },
        { name: 'South Florida Division', description: 'Covers Miami, Fort Lauderdale, and West Palm Beach' },
        { name: 'North Florida Division', description: 'Covers Jacksonville, Gainesville, and Tallahassee' },
        { name: 'West Florida Division', description: 'Covers Tampa, St. Petersburg, and Clearwater' },
        { name: 'East Florida Division', description: 'Covers Daytona Beach, Melbourne, and Cocoa Beach' }
      ]
    });
    console.log(`✅ Created ${transportDivisions.count} transport divisions`);

    // 4. Create Material Types
    console.log('🏗️ Creating material types...');
    const materials = await prisma.materialType.createMany({
      data: [
        { name: 'Sand', description: 'Fine sand for construction and landscaping' },
        { name: 'Gravel', description: 'Coarse gravel for roads and drainage' },
        { name: 'Concrete', description: 'Ready-mix concrete for construction' },
        { name: 'Asphalt', description: 'Hot mix asphalt for road construction' },
        { name: 'Limestone', description: 'Crushed limestone for base material' },
        { name: 'Fill Dirt', description: 'Clean fill dirt for backfill' },
        { name: 'Topsoil', description: 'Quality topsoil for landscaping' },
        { name: 'Riprap', description: 'Large stone for erosion control' }
      ]
    });
    console.log(`✅ Created ${materials.count} material types`);

    // 5. Create Truck Types
    console.log('🚚 Creating truck types...');
    const truckTypes = await prisma.truckType.createMany({
      data: [
        { name: 'Dump Truck', capacity: 10.0, description: 'Standard dump truck for bulk materials' },
        { name: 'Semi Trailer', capacity: 20.0, description: 'Large semi trailer for heavy loads' },
        { name: 'Flatbed', capacity: 15.0, description: 'Flatbed truck for oversized materials' },
        { name: 'Tanker', capacity: 12.0, description: 'Liquid tanker for water and chemicals' },
        { name: 'Concrete Mixer', capacity: 8.0, description: 'Concrete mixer truck' },
        { name: 'Lowboy', capacity: 25.0, description: 'Lowboy trailer for heavy equipment' }
      ]
    });
    console.log(`✅ Created ${truckTypes.count} truck types`);

    // 6. Create States
    console.log('🗺️ Creating states...');
    const floridaState = await prisma.state.create({ data: { name: 'Florida' } });
    const georgiaState = await prisma.state.create({ data: { name: 'Georgia' } });
    const alabamaState = await prisma.state.create({ data: { name: 'Alabama' } });
    console.log(`✅ Created 3 states`);

    // 7. Create Cities
    console.log('🏙️ Creating cities...');
    const orlandoCity = await prisma.city.create({ data: { name: 'Orlando', stateId: floridaState.id } });
    const tampaCity = await prisma.city.create({ data: { name: 'Tampa', stateId: floridaState.id } });
    const miamiCity = await prisma.city.create({ data: { name: 'Miami', stateId: floridaState.id } });
    const jacksonvilleCity = await prisma.city.create({ data: { name: 'Jacksonville', stateId: floridaState.id } });
    console.log(`✅ Created 4 cities`);

    // 8. Create Addresses
    console.log('📍 Creating addresses...');
    const orlandoAddress = await prisma.address.create({ data: { address: '123 Main St', zip: 32801, cityId: orlandoCity.id } });
    const tampaAddress = await prisma.address.create({ data: { address: '456 Industrial Blvd', zip: 33601, cityId: tampaCity.id } });
    const miamiAddress = await prisma.address.create({ data: { address: '789 Port Ave', zip: 33101, cityId: miamiCity.id } });
    const jacksonvilleAddress = await prisma.address.create({ data: { address: '321 Construction Way', zip: 32201, cityId: jacksonvilleCity.id } });
    console.log(`✅ Created 4 addresses`);

    // 9. Create Work Plants
    console.log('🏭 Creating work plants...');
    const centralPlant = await prisma.workPlant.create({ data: { name: 'Central Plant', addressId: orlandoAddress.id } });
    const northPlant = await prisma.workPlant.create({ data: { name: 'North Plant', addressId: tampaAddress.id } });
    const southPlant = await prisma.workPlant.create({ data: { name: 'South Plant', addressId: miamiAddress.id } });
    const eastPlant = await prisma.workPlant.create({ data: { name: 'East Plant', addressId: jacksonvilleAddress.id } });
    console.log(`✅ Created 4 work plants`);

    // 10. Create Route Types
    console.log('🛣️ Creating route types...');
    const localRouteType = await prisma.routeType.create({ data: { name: 'Local' } });
    const regionalRouteType = await prisma.routeType.create({ data: { name: 'Regional' } });
    const longDistanceRouteType = await prisma.routeType.create({ data: { name: 'Long Distance' } });
    console.log(`✅ Created 3 route types`);

    // 11. Create Routes
    console.log('🗺️ Creating routes...');
    const route1 = await prisma.route.create({ 
      data: { 
        miles: '25', 
        routeTypeId: localRouteType.id, 
        pickWorkPlantId: centralPlant.id, 
        dropWorkPlantId: northPlant.id 
      } 
    });
    const route2 = await prisma.route.create({ 
      data: { 
        miles: '45', 
        routeTypeId: regionalRouteType.id, 
        pickWorkPlantId: northPlant.id, 
        dropWorkPlantId: southPlant.id 
      } 
    });
    const route3 = await prisma.route.create({ 
      data: { 
        miles: '120', 
        routeTypeId: longDistanceRouteType.id, 
        pickWorkPlantId: centralPlant.id, 
        dropWorkPlantId: southPlant.id 
      } 
    });
    console.log(`✅ Created 3 routes`);

    // 12. Create Test Users and Drivers
    console.log('👤 Creating test users and drivers...');
    
    const driverRole = await prisma.userRole.findUnique({ where: { name: 'driver' } });
    const centralDivision = await prisma.transportDivision.findFirst();

    // Create test driver
    const testUser = await prisma.user.create({
      data: {
        email: 'testdriver@floridasandgravel.com',
        name: 'John',
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

    console.log(`✅ Created test user: ${testUser.email}`);
    console.log(`✅ Created test driver: ${testDriver.truckNumber}`);

    // 13. Create Sample Orders
    console.log('📦 Creating sample orders...');
    
    const sandMaterial = await prisma.materialType.findFirst({ where: { name: 'Sand' } });
    const gravelMaterial = await prisma.materialType.findFirst({ where: { name: 'Gravel' } });
    const concreteMaterial = await prisma.materialType.findFirst({ where: { name: 'Concrete' } });
    const firstRoute = await prisma.route.findFirst();

    const orders = await prisma.order.createMany({
      data: [
        {
          orderNumber: 'ORD-2024-001',
          bolNumber: 'BOL-001',
          rate: 150.00,
          instructions: 'Deliver sand to construction site - Orlando Downtown Project',
          weight: 10.5,
          material: 'Sand',
          status: 'PENDING',
          createdById: testUser.id,
          driverId: testDriver.id,
          routeId: firstRoute.id
        },
        {
          orderNumber: 'ORD-2024-002',
          bolNumber: 'BOL-002',
          rate: 200.00,
          instructions: 'Deliver gravel to road project - I-4 Expansion',
          weight: 15.0,
          material: 'Gravel',
          status: 'IN_PROGRESS',
          createdById: testUser.id,
          driverId: testDriver.id,
          routeId: firstRoute.id
        },
        {
          orderNumber: 'ORD-2024-003',
          bolNumber: 'BOL-003',
          rate: 175.00,
          instructions: 'Deliver concrete to building site - New Office Complex',
          weight: 12.0,
          material: 'Concrete',
          status: 'COMPLETED',
          createdById: testUser.id,
          driverId: testDriver.id,
          routeId: firstRoute.id
        },
        {
          orderNumber: 'ORD-2024-004',
          bolNumber: 'BOL-004',
          rate: 180.00,
          instructions: 'Deliver asphalt to parking lot - Shopping Center',
          weight: 8.5,
          material: 'Asphalt',
          status: 'ASSIGNED',
          createdById: testUser.id,
          driverId: testDriver.id,
          routeId: firstRoute.id
        },
        {
          orderNumber: 'ORD-2024-005',
          bolNumber: 'BOL-005',
          rate: 160.00,
          instructions: 'Deliver limestone to driveway - Residential Project',
          weight: 6.0,
          material: 'Limestone',
          status: 'PENDING',
          createdById: testUser.id,
          driverId: testDriver.id,
          routeId: firstRoute.id
        }
      ]
    });

    console.log(`✅ Created ${orders.count} sample orders`);

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
