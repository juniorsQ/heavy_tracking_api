import { Request, Response } from 'express';
import prisma from '../config/database';
import { 
  OrderQueryParams, 
  OrdersResponse, 
  CreateOrderRequest,
  SetAvailabilityRequest,
  ApiResponse 
} from '../types';
import logger from '../utils/logger';

export class HomeController {
  // GET /api/v1/orders/:id
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const orderId = parseInt(id, 10);

      if (isNaN(orderId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid order ID'
        });
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
              lastName: true,
              phoneNumber: true
            }
          },
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  lastName: true,
                  phoneNumber: true
                }
              },
              transportDivision: true
            }
          },
          route: {
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
          },
          orderHasRoutes: {
            include: {
              route: {
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
              }
            }
          },
          deliveryConfirmations: true
        }
      });

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      logger.error('Get order by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // POST /api/v1/users/availables
  setUserAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { available }: SetAvailabilityRequest = req.body;
      const userId = (req as any).user.id;

      if (typeof available !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Available status must be a boolean'
        });
        return;
      }

      const driver = await prisma.driver.findFirst({
        where: { userId }
      });

      if (!driver) {
        res.status(404).json({
          success: false,
          error: 'Driver profile not found'
        });
        return;
      }

      await prisma.driver.update({
        where: { id: driver.id },
        data: { available }
      });

      res.json({
        success: true,
        data: { available },
        message: `Availability set to ${available ? 'available' : 'unavailable'}`
      });
    } catch (error) {
      logger.error('Set user availability error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // GET /api/v1/drivers/orders
  getDriverOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const {
        page = 1,
        take = 10,
        today = true,
        differentFromToday = false
      }: OrderQueryParams = req.query;

      const pageNum = parseInt(page.toString(), 10);
      const takeNum = parseInt(take.toString(), 10);
      const skip = (pageNum - 1) * takeNum;

      // Get driver
      const driver = await prisma.driver.findFirst({
        where: { userId }
      });

      if (!driver) {
        res.status(404).json({
          success: false,
          error: 'Driver profile not found'
        });
        return;
      }

      // Build date filter
      let dateFilter: any = {};
      if (today) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        dateFilter = {
          assignmentDate: {
            gte: todayStart,
            lte: todayEnd
          }
        };
      } else if (differentFromToday) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        dateFilter = {
          assignmentDate: {
            lt: todayStart
          }
        };
      }

      // Get orders
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: {
            driverId: driver.id,
            ...dateFilter
          },
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                name: true,
                lastName: true,
                phoneNumber: true
              }
            },
            driver: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    lastName: true,
                    phoneNumber: true
                  }
                },
                transportDivision: true
              }
            },
            route: {
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
            },
            orderHasRoutes: {
              include: {
                route: {
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
                }
              }
            },
            deliveryConfirmations: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: takeNum
        }),
        prisma.order.count({
          where: {
            driverId: driver.id,
            ...dateFilter
          }
        })
      ]);

      const totalPages = Math.ceil(total / takeNum);

      const response: OrdersResponse = {
        data: orders,
        pagination: {
          page: pageNum,
          take: takeNum,
          total,
          totalPages
        }
      };

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      logger.error('Get driver orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // POST /api/v1/orders
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        orderNumber,
        bolNumber,
        rate,
        instructions,
        weight,
        driverId,
        material,
        date,
        startTime,
        endTime,
        routeId
      }: CreateOrderRequest = req.body;

      const userId = (req as any).user.id;

      // Validate required fields
      if (!orderNumber || !bolNumber || !rate || !instructions || !weight || !driverId || !material || !date || !startTime || !endTime || !routeId) {
        res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
        return;
      }

      // Check if order number already exists
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber }
      });

      if (existingOrder) {
        res.status(409).json({
          success: false,
          error: 'Order number already exists'
        });
        return;
      }

      // Check if driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: driverId }
      });

      if (!driver) {
        res.status(404).json({
          success: false,
          error: 'Driver not found'
        });
        return;
      }

      // Check if route exists
      const route = await prisma.route.findUnique({
        where: { id: routeId }
      });

      if (!route) {
        res.status(404).json({
          success: false,
          error: 'Route not found'
        });
        return;
      }

      // Parse assignment date
      const assignmentDate = new Date(`${date}T${startTime}:00`);

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          bolNumber,
          rate,
          instructions,
          weight,
          assignmentDate,
          driverId,
          routeId,
          material,
          startTime,
          endTime,
          createdById: userId,
          status: 'ASSIGNED'
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
              lastName: true,
              phoneNumber: true
            }
          },
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  lastName: true,
                  phoneNumber: true
                }
              },
              transportDivision: true
            }
          },
          route: {
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
          }
        }
      });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      logger.error('Create order error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
