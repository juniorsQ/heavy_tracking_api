import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../utils/logger';

export class RoutesController {
  // GET /api/v1/routes
  getRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
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
        },
        orderBy: {
          id: 'asc'
        }
      });

      res.json({
        success: true,
        data: routes
      });
    } catch (error) {
      logger.error('Get routes error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // GET /api/v1/routes/:id
  getRouteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const routeId = parseInt(id, 10);

      if (isNaN(routeId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid route ID'
        });
        return;
      }

      const route = await prisma.route.findUnique({
        where: { id: routeId },
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
          },
          orders: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      name: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!route) {
        res.status(404).json({
          success: false,
          error: 'Route not found'
        });
        return;
      }

      res.json({
        success: true,
        data: route
      });
    } catch (error) {
      logger.error('Get route by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}

export class WorkPlantsController {
  // GET /api/v1/work-plants
  getWorkPlants = async (req: Request, res: Response): Promise<void> => {
    try {
      const workPlants = await prisma.workPlant.findMany({
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
        },
        orderBy: {
          name: 'asc'
        }
      });

      res.json({
        success: true,
        data: workPlants
      });
    } catch (error) {
      logger.error('Get work plants error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // GET /api/v1/work-plants/:id
  getWorkPlantById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const workPlantId = parseInt(id, 10);

      if (isNaN(workPlantId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid work plant ID'
        });
        return;
      }

      const workPlant = await prisma.workPlant.findUnique({
        where: { id: workPlantId },
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

      if (!workPlant) {
        res.status(404).json({
          success: false,
          error: 'Work plant not found'
        });
        return;
      }

      res.json({
        success: true,
        data: workPlant
      });
    } catch (error) {
      logger.error('Get work plant by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}

export class RouteTypesController {
  // GET /api/v1/route-types
  getRouteTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const routeTypes = await prisma.routeType.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      res.json({
        success: true,
        data: routeTypes
      });
    } catch (error) {
      logger.error('Get route types error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
