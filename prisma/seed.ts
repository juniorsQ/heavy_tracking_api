import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create states
  const florida = await prisma.state.create({
    data: {
      name: 'Florida'
    }
  });

  // Create cities
  const miami = await prisma.city.create({
    data: {
      name: 'Miami',
      stateId: florida.id
    }
  });

  const fortLauderdale = await prisma.city.create({
    data: {
      name: 'Fort Lauderdale',
      stateId: florida.id
    }
  });

  const tampa = await prisma.city.create({
    data: {
      name: 'Tampa',
      stateId: florida.id
    }
  });

  const orlando = await prisma.city.create({
    data: {
      name: 'Orlando',
      stateId: florida.id
    }
  });

  // Create addresses
  const miamiAddress = await prisma.address.create({
    data: {
      address: '1234 Brickell Ave',
      zip: 33131,
      cityId: miami.id
    }
  });

  const fortLauderdaleAddress = await prisma.address.create({
    data: {
      address: '5678 Las Olas Blvd',
      zip: 33301,
      cityId: fortLauderdale.id
    }
  });

  const tampaAddress = await prisma.address.create({
    data: {
      address: '9012 Kennedy Blvd',
      zip: 33602,
      cityId: tampa.id
    }
  });

  const orlandoAddress = await prisma.address.create({
    data: {
      address: '3456 International Dr',
      zip: 32819,
      cityId: orlando.id
    }
  });

  // Create work plants
  const miamiPlant = await prisma.workPlant.create({
    data: {
      name: 'Miami Sand & Gravel Plant',
      addressId: miamiAddress.id
    }
  });

  const fortLauderdalePlant = await prisma.workPlant.create({
    data: {
      name: 'Fort Lauderdale Processing Center',
      addressId: fortLauderdaleAddress.id
    }
  });

  const tampaPlant = await prisma.workPlant.create({
    data: {
      name: 'Tampa Distribution Hub',
      addressId: tampaAddress.id
    }
  });

  const orlandoPlant = await prisma.workPlant.create({
    data: {
      name: 'Orlando Material Center',
      addressId: orlandoAddress.id
    }
  });

  // Create route types
  const localRoute = await prisma.routeType.create({
    data: {
      name: 'Local Delivery'
    }
  });

  const regionalRoute = await prisma.routeType.create({
    data: {
      name: 'Regional Transport'
    }
  });

  const longHaulRoute = await prisma.routeType.create({
    data: {
      name: 'Long Haul'
    }
  });

  // Create routes
  const miamiToFortLauderdale = await prisma.route.create({
    data: {
      miles: '25',
      routeTypeId: localRoute.id,
      pickWorkPlantId: miamiPlant.id,
      dropWorkPlantId: fortLauderdalePlant.id
    }
  });

  const fortLauderdaleToTampa = await prisma.route.create({
    data: {
      miles: '280',
      routeTypeId: regionalRoute.id,
      pickWorkPlantId: fortLauderdalePlant.id,
      dropWorkPlantId: tampaPlant.id
    }
  });

  const tampaToOrlando = await prisma.route.create({
    data: {
      miles: '85',
      routeTypeId: regionalRoute.id,
      pickWorkPlantId: tampaPlant.id,
      dropWorkPlantId: orlandoPlant.id
    }
  });

  const miamiToOrlando = await prisma.route.create({
    data: {
      miles: '235',
      routeTypeId: longHaulRoute.id,
      pickWorkPlantId: miamiPlant.id,
      dropWorkPlantId: orlandoPlant.id
    }
  });

  // Create user roles
  const driverRole = await prisma.userRole.create({
    data: {
      name: 'driver'
    }
  });

  const adminRole = await prisma.userRole.create({
    data: {
      name: 'admin'
    }
  });

  // Create transport divisions
  const southDivision = await prisma.transportDivision.create({
    data: {
      name: 'South Florida Division',
      description: 'Covers Miami-Dade, Broward, and Palm Beach counties'
    }
  });

  const centralDivision = await prisma.transportDivision.create({
    data: {
      name: 'Central Florida Division',
      description: 'Covers Orange, Seminole, and Osceola counties'
    }
  });

  const westDivision = await prisma.transportDivision.create({
    data: {
      name: 'West Florida Division',
      description: 'Covers Hillsborough, Pinellas, and Pasco counties'
    }
  });

  // Create sample users and drivers
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  const driver1 = await prisma.user.create({
    data: {
      email: 'john.doe@flsandgravel.com',
      name: 'John',
      lastName: 'Doe',
      phoneNumber: '+13055551234',
      password: hashedPassword,
      isVerified: true
    }
  });

  await prisma.driver.create({
    data: {
      truckNumber: 'FL-001',
      userId: driver1.id,
      transportDivisionId: southDivision.id,
      available: true
    }
  });

  const driver2 = await prisma.user.create({
    data: {
      email: 'jane.smith@flsandgravel.com',
      name: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+13055552345',
      password: hashedPassword,
      isVerified: true
    }
  });

  await prisma.driver.create({
    data: {
      truckNumber: 'FL-002',
      userId: driver2.id,
      transportDivisionId: centralDivision.id,
      available: false
    }
  });

  const driver3 = await prisma.user.create({
    data: {
      email: 'mike.johnson@flsandgravel.com',
      name: 'Mike',
      lastName: 'Johnson',
      phoneNumber: '+13055553456',
      password: hashedPassword,
      isVerified: true
    }
  });

  await prisma.driver.create({
    data: {
      truckNumber: 'FL-003',
      userId: driver3.id,
      transportDivisionId: westDivision.id,
      available: true
    }
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@flsandgravel.com',
      name: 'Admin',
      lastName: 'User',
      phoneNumber: '+13055550000',
      password: hashedPassword,
      isVerified: true
    }
  });

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2023-001',
      bolNumber: 'BOL-001',
      rate: 150.00,
      instructions: 'Deliver sand to construction site. Call before arrival.',
      weight: 25000.0,
      assignmentDate: new Date('2023-12-15T08:00:00Z'),
      status: 'ASSIGNED',
      material: 'Sand',
      startTime: '08:00',
      endTime: '12:00',
      createdById: admin.id,
      driverId: 1,
      routeId: miamiToFortLauderdale.id
    }
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2023-002',
      bolNumber: 'BOL-002',
      rate: 200.00,
      instructions: 'Gravel delivery for road construction project.',
      weight: 30000.0,
      assignmentDate: new Date('2023-12-16T09:00:00Z'),
      status: 'PENDING',
      material: 'Gravel',
      startTime: '09:00',
      endTime: '15:00',
      createdById: admin.id,
      routeId: fortLauderdaleToTampa.id
    }
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2023-003',
      bolNumber: 'BOL-003',
      rate: 175.00,
      instructions: 'Mixed aggregate for concrete plant.',
      weight: 28000.0,
      assignmentDate: new Date('2023-12-14T07:00:00Z'),
      status: 'COMPLETED',
      material: 'Mixed Aggregate',
      startTime: '07:00',
      endTime: '11:00',
      createdById: admin.id,
      driverId: 3,
      routeId: tampaToOrlando.id
    }
  });

  // Create delivery confirmation for completed order
  await prisma.deliveryConfirmation.create({
    data: {
      orderId: order3.id,
      imagePath: '/uploads/sample_delivery_confirmation.jpg',
      notes: 'Delivery completed successfully. Customer signed BOL.'
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - ${await prisma.state.count()} states`);
  console.log(`   - ${await prisma.city.count()} cities`);
  console.log(`   - ${await prisma.address.count()} addresses`);
  console.log(`   - ${await prisma.workPlant.count()} work plants`);
  console.log(`   - ${await prisma.routeType.count()} route types`);
  console.log(`   - ${await prisma.route.count()} routes`);
  console.log(`   - ${await prisma.userRole.count()} user roles`);
  console.log(`   - ${await prisma.transportDivision.count()} transport divisions`);
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.driver.count()} drivers`);
  console.log(`   - ${await prisma.order.count()} orders`);
  console.log(`   - ${await prisma.deliveryConfirmation.count()} delivery confirmations`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
