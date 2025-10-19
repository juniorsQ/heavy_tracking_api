const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function seedProduction() {
  try {
    console.log('🌱 Seeding production database...');

    // Create transport divisions
    const transportDivisions = [
      {
        name: 'South Florida Division',
        description: 'Covers Miami-Dade, Broward, and Palm Beach counties'
      },
      {
        name: 'Central Florida Division', 
        description: 'Covers Orange, Seminole, and Osceola counties'
      },
      {
        name: 'North Florida Division',
        description: 'Covers Jacksonville, Gainesville, and Tallahassee areas'
      }
    ];

    for (const division of transportDivisions) {
      await prisma.transportDivision.upsert({
        where: { name: division.name },
        update: division,
        create: division
      });
      console.log(`✅ Created/Updated: ${division.name}`);
    }

    // Create user roles
    const roles = [
      { name: 'driver' },
      { name: 'admin' },
      { name: 'dispatcher' }
    ];

    for (const role of roles) {
      await prisma.userRole.upsert({
        where: { name: role.name },
        update: role,
        create: role
      });
      console.log(`✅ Created/Updated role: ${role.name}`);
    }

    console.log('🎉 Production database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProduction();
