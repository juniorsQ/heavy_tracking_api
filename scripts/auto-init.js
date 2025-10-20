const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function initializeProduction() {
  try {
    console.log('🚀 Starting production database initialization...');

    // 1. Create User Roles
    console.log('📋 Creating user roles...');
    const roles = [
      { name: 'admin', description: 'System administrator' },
      { name: 'driver', description: 'Truck driver' },
      { name: 'dispatcher', description: 'Load dispatcher' }
    ];

    await prisma.userRole.createMany({
      data: roles,
      skipDuplicates: true
    });

    // 2. Create Transport Divisions
    console.log('🚛 Creating transport divisions...');
    const transportDivisions = [
      {
        name: 'South Florida Division',
        description: 'Covers Miami, Fort Lauderdale, and West Palm Beach areas'
      },
      {
        name: 'Central Florida Division', 
        description: 'Covers Orlando, Lakeland, and Winter Haven areas'
      },
      {
        name: 'North Florida Division',
        description: 'Covers Jacksonville, Gainesville, and Tallahassee areas'
      },
      {
        name: 'West Coast Division',
        description: 'Covers Tampa, St. Petersburg, and Clearwater areas'
      }
    ];

    await prisma.transportDivision.createMany({
      data: transportDivisions,
      skipDuplicates: true
    });

    // 3. Create Test Driver User
    console.log('👤 Creating test driver user...');
    const driverRole = await prisma.userRole.findFirst({
      where: { name: 'driver' }
    });

    if (driverRole) {
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      
      const driverUser = await prisma.user.upsert({
        where: { email: 'onerbren@gmail.com' },
        update: {},
        create: {
          email: 'onerbren@gmail.com',
          name: 'Test',
          lastName: 'Driver',
          phoneNumber: '+584122119581',
          password: hashedPassword,
          isVerified: true,
          roleId: driverRole.id
        }
      });

      // Create driver profile
      const southFloridaDivision = await prisma.transportDivision.findFirst({
        where: { name: 'South Florida Division' }
      });

      if (southFloridaDivision) {
        await prisma.driver.createMany({
          data: [{
            userId: driverUser.id,
            truckNumber: 'TEST001',
            transportDivisionId: southFloridaDivision.id
          }],
          skipDuplicates: true
        });
      }

      console.log('✅ Test driver created:', driverUser.email);
    }

    console.log('🎉 Production database initialization completed successfully!');
    
    // Verify data
    const userRoles = await prisma.userRole.findMany();
    const transportDivisions = await prisma.transportDivision.findMany();
    const users = await prisma.user.findMany();
    const drivers = await prisma.driver.findMany();

    console.log('📊 Database Status:');
    console.log(`- User Roles: ${userRoles.length}`);
    console.log(`- Transport Divisions: ${transportDivisions.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Drivers: ${drivers.length}`);

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeProduction()
    .then(() => {
      console.log('✅ Initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeProduction };
