#!/usr/bin/env node

/**
 * Script para visualizar datos de la base de datos
 * Uso: node scripts/view-database.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function viewDatabase() {
  try {
    console.log('📊 VISUALIZACIÓN DE LA BASE DE DATOS\n');
    console.log('=' .repeat(50));

    // 1. Usuarios y Conductores
    console.log('\n👥 USUARIOS Y CONDUCTORES:');
    console.log('-'.repeat(30));
    
    const users = await prisma.user.findMany({
      include: {
        role: true,
        driver: {
          include: {
            transportDivision: true
          }
        }
      }
    });

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Teléfono: ${user.phoneNumber}`);
      console.log(`   🔐 Verificado: ${user.isVerified ? 'Sí' : 'No'}`);
      console.log(`   👤 Rol: ${user.role?.name || 'Sin rol'}`);
      
      if (user.driver) {
        console.log(`   🚛 Camión: ${user.driver.truckNumber}`);
        console.log(`   ✅ Disponible: ${user.driver.available ? 'Sí' : 'No'}`);
        console.log(`   🏢 División: ${user.driver.transportDivision?.name || 'Sin división'}`);
      }
      console.log('');
    });

    // 2. Órdenes/Viajes
    console.log('\n📦 ÓRDENES/VIEJES:');
    console.log('-'.repeat(30));
    
    const orders = await prisma.order.findMany({
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
        },
        createdBy: {
          select: {
            name: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (orders.length === 0) {
      console.log('❌ No hay órdenes en la base de datos');
    } else {
      orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber}`);
        console.log(`   📋 BOL: ${order.bolNumber}`);
        console.log(`   👤 Conductor: ${order.driver.user.name} ${order.driver.user.lastName}`);
        console.log(`   🚛 Camión: ${order.driver.truckNumber}`);
        console.log(`   📅 Fecha: ${order.assignmentDate.toLocaleDateString()}`);
        console.log(`   ⏰ Horario: ${order.startTime} - ${order.endTime}`);
        console.log(`   📦 Material: ${order.material}`);
        console.log(`   ⚖️ Peso: ${order.weight} lbs`);
        console.log(`   💰 Tarifa: $${order.rate}`);
        console.log(`   📊 Estado: ${order.status}`);
        console.log(`   🛣️ Ruta: ${order.route.miles} millas`);
        console.log(`   📍 Desde: ${order.route.pickWorkPlant?.name || 'Sin planta'}`);
        console.log(`   📍 Hasta: ${order.route.dropWorkPlant?.name || 'Sin planta'}`);
        console.log('');
      });
    }

    // 3. Divisiones de Transporte
    console.log('\n🏢 DIVISIONES DE TRANSPORTE:');
    console.log('-'.repeat(30));
    
    const divisions = await prisma.transportDivision.findMany({
      include: {
        drivers: {
          include: {
            user: {
              select: {
                name: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    divisions.forEach((division, index) => {
      console.log(`${index + 1}. ${division.name}`);
      console.log(`   📝 Descripción: ${division.description}`);
      console.log(`   👥 Conductores: ${division.drivers.length}`);
      
      if (division.drivers.length > 0) {
        division.drivers.forEach(driver => {
          console.log(`      - ${driver.user.name} ${driver.user.lastName} (${driver.truckNumber})`);
        });
      }
      console.log('');
    });

    // 4. Rutas
    console.log('\n🛣️ RUTAS:');
    console.log('-'.repeat(30));
    
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

    routes.forEach((route, index) => {
      console.log(`${index + 1}. Ruta ${route.id}`);
      console.log(`   📏 Distancia: ${route.miles} millas`);
      console.log(`   🏷️ Tipo: ${route.routeType?.name || 'Sin tipo'}`);
      console.log(`   📍 Origen: ${route.pickWorkPlant?.name || 'Sin planta'} - ${route.pickWorkPlant?.address?.city?.name || 'Sin ciudad'}`);
      console.log(`   📍 Destino: ${route.dropWorkPlant?.name || 'Sin planta'} - ${route.dropWorkPlant?.address?.city?.name || 'Sin ciudad'}`);
      console.log('');
    });

    // 5. Plantas de Trabajo
    console.log('\n🏭 PLANTAS DE TRABAJO:');
    console.log('-'.repeat(30));
    
    const plants = await prisma.workPlant.findMany({
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
    });

    plants.forEach((plant, index) => {
      console.log(`${index + 1}. ${plant.name}`);
      console.log(`   📍 Dirección: ${plant.address?.address || 'Sin dirección'}`);
      console.log(`   🏙️ Ciudad: ${plant.address?.city?.name || 'Sin ciudad'}`);
      console.log(`   🗺️ Estado: ${plant.address?.city?.state?.name || 'Sin estado'}`);
      console.log(`   📮 Código Postal: ${plant.address?.zip || 'Sin código'}`);
      console.log('');
    });

    // 6. Estadísticas
    console.log('\n📊 ESTADÍSTICAS:');
    console.log('-'.repeat(30));
    
    const stats = {
      totalUsers: await prisma.user.count(),
      totalDrivers: await prisma.driver.count(),
      totalOrders: await prisma.order.count(),
      totalRoutes: await prisma.route.count(),
      totalPlants: await prisma.workPlant.count(),
      totalDivisions: await prisma.transportDivision.count(),
      availableDrivers: await prisma.driver.count({ where: { available: true } }),
      assignedOrders: await prisma.order.count({ where: { status: 'ASSIGNED' } }),
      completedOrders: await prisma.order.count({ where: { status: 'COMPLETED' } })
    };

    console.log(`👥 Total de usuarios: ${stats.totalUsers}`);
    console.log(`🚛 Total de conductores: ${stats.totalDrivers}`);
    console.log(`✅ Conductores disponibles: ${stats.availableDrivers}`);
    console.log(`📦 Total de órdenes: ${stats.totalOrders}`);
    console.log(`📋 Órdenes asignadas: ${stats.assignedOrders}`);
    console.log(`✅ Órdenes completadas: ${stats.completedOrders}`);
    console.log(`🛣️ Total de rutas: ${stats.totalRoutes}`);
    console.log(`🏭 Total de plantas: ${stats.totalPlants}`);
    console.log(`🏢 Total de divisiones: ${stats.totalDivisions}`);

  } catch (error) {
    console.error('❌ Error visualizando base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
if (require.main === module) {
  viewDatabase();
}

module.exports = { viewDatabase };
