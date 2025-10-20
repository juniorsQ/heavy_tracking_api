#!/usr/bin/env node

/**
 * Script para crear órdenes/viajes para conductores
 * Uso: node scripts/create-order.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createOrder() {
  try {
    console.log('🚛 Creando orden/viaje para conductor...\n');

    // Obtener conductores disponibles
    const drivers = await prisma.driver.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            lastName: true
          }
        },
        transportDivision: true
      }
    });

    console.log('📋 Conductores disponibles:');
    drivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.user.name} ${driver.user.lastName} (${driver.user.email}) - Camión: ${driver.truckNumber} - División: ${driver.transportDivision?.name || 'Sin división'}`);
    });

    // Obtener rutas disponibles
    const routes = await prisma.route.findMany({
      include: {
        routeType: true,
        pickWorkPlant: {
          include: {
            address: {
              include: {
                city: {
                  include: {
                    state: true
                  }
                }
              }
            }
          }
        },
        dropWorkPlant: {
          include: {
            address: {
              include: {
                city: {
                  include: {
                    state: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('\n🛣️ Rutas disponibles:');
    routes.forEach((route, index) => {
      console.log(`${index + 1}. ${route.miles} millas - ${route.routeType?.name || 'Sin tipo'} - Desde: ${route.pickWorkPlant?.name || 'Sin planta'} - Hasta: ${route.dropWorkPlant?.name || 'Sin planta'}`);
    });

    // Crear orden de ejemplo
    const orderData = {
      orderNumber: `ORD-${Date.now()}`,
      bolNumber: `BOL-${Date.now()}`,
      rate: 150.00,
      instructions: 'Entrega urgente de arena para construcción. Llamar antes de llegar.',
      weight: 25000.0,
      driverId: drivers[0]?.id || 1, // Usar el primer conductor disponible
      material: 'Arena',
      date: new Date().toISOString().split('T')[0], // Fecha de hoy
      startTime: '08:00',
      endTime: '12:00',
      routeId: routes[0]?.id || 1 // Usar la primera ruta disponible
    };

    console.log('\n📦 Creando orden con los siguientes datos:');
    console.log(JSON.stringify(orderData, null, 2));

    const order = await prisma.order.create({
      data: {
        orderNumber: orderData.orderNumber,
        bolNumber: orderData.bolNumber,
        rate: orderData.rate,
        instructions: orderData.instructions,
        weight: orderData.weight,
        driverId: orderData.driverId,
        material: orderData.material,
        assignmentDate: new Date(`${orderData.date}T${orderData.startTime}:00`),
        startTime: orderData.startTime,
        endTime: orderData.endTime,
        routeId: orderData.routeId,
        status: 'ASSIGNED',
        createdById: 1 // ID del usuario que crea la orden (admin)
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        route: {
          include: {
            routeType: true,
            pickWorkPlant: true,
            dropWorkPlant: true
          }
        }
      }
    });

    console.log('\n✅ Orden creada exitosamente!');
    console.log(`📋 Número de orden: ${order.orderNumber}`);
    console.log(`👤 Conductor: ${order.driver.user.name} ${order.driver.user.lastName} (${order.driver.user.email})`);
    console.log(`🚛 Camión: ${order.driver.truckNumber}`);
    console.log(`📅 Fecha de asignación: ${order.assignmentDate.toLocaleDateString()}`);
    console.log(`⏰ Horario: ${order.startTime} - ${order.endTime}`);
    console.log(`💰 Tarifa: $${order.rate}`);
    console.log(`📦 Material: ${order.material}`);
    console.log(`⚖️ Peso: ${order.weight} lbs`);
    console.log(`🛣️ Ruta: ${order.route.miles} millas`);

  } catch (error) {
    console.error('❌ Error creando orden:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para crear múltiples órdenes
async function createMultipleOrders(count = 3) {
  try {
    console.log(`🚛 Creando ${count} órdenes/viajes...\n`);

    const drivers = await prisma.driver.findMany();
    const routes = await prisma.route.findMany();

    if (drivers.length === 0) {
      console.log('❌ No hay conductores disponibles');
      return;
    }

    if (routes.length === 0) {
      console.log('❌ No hay rutas disponibles');
      return;
    }

    const materials = ['Arena', 'Grava', 'Cemento', 'Piedra', 'Arcilla'];
    const instructions = [
      'Entrega urgente para construcción',
      'Llamar antes de llegar al sitio',
      'Entregar en horario específico',
      'Verificar peso antes de descargar',
      'Coordinación con supervisor de obra'
    ];

    for (let i = 0; i < count; i++) {
      const orderData = {
        orderNumber: `ORD-${Date.now()}-${i + 1}`,
        bolNumber: `BOL-${Date.now()}-${i + 1}`,
        rate: Math.floor(Math.random() * 200) + 100, // Entre $100-$300
        instructions: instructions[Math.floor(Math.random() * instructions.length)],
        weight: Math.floor(Math.random() * 30000) + 10000, // Entre 10,000-40,000 lbs
        driverId: drivers[Math.floor(Math.random() * drivers.length)].id,
        material: materials[Math.floor(Math.random() * materials.length)],
        date: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Días diferentes
        startTime: ['08:00', '09:00', '10:00', '14:00', '15:00'][Math.floor(Math.random() * 5)],
        endTime: ['12:00', '13:00', '14:00', '17:00', '18:00'][Math.floor(Math.random() * 5)],
        routeId: routes[Math.floor(Math.random() * routes.length)].id
      };

      const order = await prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          bolNumber: orderData.bolNumber,
          rate: orderData.rate,
          instructions: orderData.instructions,
          weight: orderData.weight,
          driverId: orderData.driverId,
          material: orderData.material,
          assignmentDate: new Date(`${orderData.date}T${orderData.startTime}:00`),
          startTime: orderData.startTime,
          endTime: orderData.endTime,
          routeId: orderData.routeId,
          status: 'ASSIGNED',
          createdById: 1
        }
      });

      console.log(`✅ Orden ${i + 1} creada: ${order.orderNumber}`);
    }

    console.log(`\n🎉 Se crearon ${count} órdenes exitosamente!`);

  } catch (error) {
    console.error('❌ Error creando órdenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--multiple')) {
    const count = parseInt(args[args.indexOf('--multiple') + 1]) || 3;
    createMultipleOrders(count);
  } else {
    createOrder();
  }
}

module.exports = { createOrder, createMultipleOrders };
