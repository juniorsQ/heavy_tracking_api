const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting production database initialization...');

  try {
    // 1. Create User Roles
    console.log('📋 Creating user roles...');
    const roles = [
      { name: 'driver', description: 'Truck driver role' },
      { name: 'admin', description: 'System administrator role' },
      { name: 'dispatcher', description: 'Order dispatcher role' },
      { name: 'customer', description: 'Customer role' }
    ];

    for (const role of roles) {
      await prisma.userRole.upsert({
        where: { name: role.name },
        update: role,
        create: role
      });
    }
    console.log('✅ User roles created');

    // 2. Create Transport Divisions
    console.log('🚛 Creating transport divisions...');
    const transportDivisions = [
      {
        name: 'South Florida Division',
        description: 'Covers Miami-Dade, Broward, and Palm Beach counties',
        isActive: true
      },
      {
        name: 'Central Florida Division',
        description: 'Covers Orange, Seminole, and Osceola counties',
        isActive: true
      },
      {
        name: 'North Florida Division',
        description: 'Covers Jacksonville, Gainesville, and Tallahassee areas',
        isActive: true
      },
      {
        name: 'West Florida Division',
        description: 'Covers Tampa, St. Petersburg, and Clearwater areas',
        isActive: true
      }
    ];

    for (const division of transportDivisions) {
      await prisma.transportDivision.upsert({
        where: { name: division.name },
        update: division,
        create: division
      });
    }
    console.log('✅ Transport divisions created');

    // 3. Create Truck Types
    console.log('🚚 Creating truck types...');
    const truckTypes = [
      {
        name: 'Dump Truck',
        description: 'Heavy-duty truck for hauling loose materials',
        capacity: '10-15 tons',
        isActive: true
      },
      {
        name: 'Flatbed Truck',
        description: 'Open-bed truck for carrying large or irregular loads',
        capacity: '8-12 tons',
        isActive: true
      },
      {
        name: 'Box Truck',
        description: 'Enclosed truck for protected cargo transport',
        capacity: '5-8 tons',
        isActive: true
      },
      {
        name: 'Semi Trailer',
        description: 'Large trailer truck for heavy loads',
        capacity: '20-40 tons',
        isActive: true
      }
    ];

    for (const truckType of truckTypes) {
      await prisma.truckType.upsert({
        where: { name: truckType.name },
        update: truckType,
        create: truckType
      });
    }
    console.log('✅ Truck types created');

    // 4. Create Material Types
    console.log('🏗️ Creating material types...');
    const materialTypes = [
      {
        name: 'Sand',
        description: 'Fine granular material',
        unit: 'cubic yards',
        isActive: true
      },
      {
        name: 'Gravel',
        description: 'Coarse granular material',
        unit: 'cubic yards',
        isActive: true
      },
      {
        name: 'Concrete',
        description: 'Ready-mix concrete',
        unit: 'cubic yards',
        isActive: true
      },
      {
        name: 'Asphalt',
        description: 'Paving material',
        unit: 'tons',
        isActive: true
      },
      {
        name: 'Rock',
        description: 'Large stone material',
        unit: 'cubic yards',
        isActive: true
      }
    ];

    for (const materialType of materialTypes) {
      await prisma.materialType.upsert({
        where: { name: materialType.name },
        update: materialType,
        create: materialType
      });
    }
    console.log('✅ Material types created');

    // 5. Create Test Admin User
    console.log('👤 Creating test admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'admin' }
    });

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@heavy-tracking.com' },
      update: {},
      create: {
        email: 'admin@heavy-tracking.com',
        name: 'Admin',
        lastName: 'System',
        phoneNumber: '+1234567890',
        password: hashedPassword,
        isVerified: true,
        roleId: adminRole.id
      }
    });
    console.log('✅ Test admin user created');

    // 6. Create Test Driver User
    console.log('👨‍💼 Creating test driver user...');
    const driverRole = await prisma.userRole.findUnique({
      where: { name: 'driver' }
    });

    const driverUser = await prisma.user.upsert({
      where: { email: 'onerbren@gmail.com' },
      update: {},
      create: {
        email: 'onerbren@gmail.com',
        name: 'Test',
        lastName: 'Driver',
        phoneNumber: '+584122119581',
        password: await bcrypt.hash('Test123!', 10),
        isVerified: true,
        roleId: driverRole.id
      }
    });

    // Create driver profile
    const southFloridaDivision = await prisma.transportDivision.findUnique({
      where: { name: 'South Florida Division' }
    });

    const dumpTruck = await prisma.truckType.findUnique({
      where: { name: 'Dump Truck' }
    });

    await prisma.driver.upsert({
      where: { userId: driverUser.id },
      update: {},
      create: {
        userId: driverUser.id,
        licenseNumber: 'FL123456789',
        licenseExpiry: new Date('2025-12-31'),
        truckNumber: 'TEST001',
        truckTypeId: dumpTruck.id,
        transportDivisionId: southFloridaDivision.id,
        isActive: true,
        isAvailable: true
      }
    });
    console.log('✅ Test driver user created');

    // 7. Create Sample Orders
    console.log('📦 Creating sample orders...');
    const customerRole = await prisma.userRole.findUnique({
      where: { name: 'customer' }
    });

    const customerUser = await prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        email: 'customer@example.com',
        name: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567891',
        password: await bcrypt.hash('Customer123!', 10),
        isVerified: true,
        roleId: customerRole.id
      }
    });

    const sandMaterial = await prisma.materialType.findUnique({
      where: { name: 'Sand' }
    });

    const sampleOrder = await prisma.order.create({
      data: {
        customerId: customerUser.id,
        materialTypeId: sandMaterial.id,
        quantity: 5,
        unit: 'cubic yards',
        pickupAddress: '123 Sand Quarry, Miami, FL',
        deliveryAddress: '456 Construction Site, Miami, FL',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'pending',
        specialInstructions: 'Handle with care - construction site access required',
        estimatedPrice: 250.00
      }
    });
    console.log('✅ Sample orders created');

    console.log('🎉 Production database initialization completed successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('Admin: admin@heavy-tracking.com / Admin123!');
    console.log('Driver: onerbren@gmail.com / Test123!');
    console.log('Customer: customer@example.com / Customer123!');
    console.log('\n🚛 Transport Divisions: 4 created');
    console.log('🚚 Truck Types: 4 created');
    console.log('🏗️ Material Types: 5 created');
    console.log('📦 Sample Orders: 1 created');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('💥 Initialization failed:', e);
    process.exit(1);
  });
