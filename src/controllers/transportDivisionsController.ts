import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../utils/logger';

export class TransportDivisionsController {
  // GET /api/v1/transport-divisions
  getTransportDivisions = async (req: Request, res: Response): Promise<void> => {
    try {
      const transportDivisions = await prisma.transportDivision.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      res.json({
        success: true,
        data: transportDivisions
      });
    } catch (error) {
      logger.error('Get transport divisions error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // GET /api/v1/transport-divisions/:id
  getTransportDivisionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const divisionId = parseInt(id, 10);

      if (isNaN(divisionId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid transport division ID'
        });
        return;
      }

      const transportDivision = await prisma.transportDivision.findUnique({
        where: { id: divisionId },
        include: {
          drivers: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  lastName: true,
                  phoneNumber: true
                }
              }
            }
          }
        }
      });

      if (!transportDivision) {
        res.status(404).json({
          success: false,
          error: 'Transport division not found'
        });
        return;
      }

      res.json({
        success: true,
        data: transportDivision
      });
    } catch (error) {
      logger.error('Get transport division by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
