import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { FileUtils } from '../utils';
import config from '../config';
import logger from '../utils/logger';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = config.upload.path;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = FileUtils.generateFileName(file.originalname);
    cb(null, fileName);
  }
});

const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback) => {
  const extension = FileUtils.getFileExtension(file.originalname);
  if (FileUtils.isValidImageExtension(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
});

export class OrderDetailsController {
  // POST /api/v1/orders/:id/confirm-delivery
  confirmDelivery = async (req: Request, res: Response): Promise<void> => {
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

      // Check if order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          driver: true
        }
      });

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      // Check if user is the assigned driver
      const userId = (req as any).user.id;
      const driver = await prisma.driver.findFirst({
        where: { userId }
      });

      if (!driver || driver.id !== order.driverId) {
        res.status(403).json({
          success: false,
          error: 'You are not authorized to confirm this delivery'
        });
        return;
      }

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Delivery confirmation image is required'
        });
        return;
      }

      // Create delivery confirmation record
      const deliveryConfirmation = await prisma.deliveryConfirmation.create({
        data: {
          orderId,
          imagePath: req.file.path,
          notes: req.body.notes || null
        }
      });

      // Update order status to completed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: {
          id: deliveryConfirmation.id,
          orderId: deliveryConfirmation.orderId,
          imagePath: deliveryConfirmation.imagePath,
          confirmedAt: deliveryConfirmation.confirmedAt,
          notes: deliveryConfirmation.notes
        },
        message: 'Delivery confirmed successfully'
      });
    } catch (error) {
      logger.error('Confirm delivery error:', error);
      
      // Clean up uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // GET /api/v1/orders/:id/delivery-confirmation
  getDeliveryConfirmation = async (req: Request, res: Response): Promise<void> => {
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

      const deliveryConfirmation = await prisma.deliveryConfirmation.findFirst({
        where: { orderId },
        include: {
          order: {
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

      if (!deliveryConfirmation) {
        res.status(404).json({
          success: false,
          error: 'Delivery confirmation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: deliveryConfirmation
      });
    } catch (error) {
      logger.error('Get delivery confirmation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  // GET /api/v1/orders/:id/image
  getDeliveryImage = async (req: Request, res: Response): Promise<void> => {
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

      const deliveryConfirmation = await prisma.deliveryConfirmation.findFirst({
        where: { orderId }
      });

      if (!deliveryConfirmation) {
        res.status(404).json({
          success: false,
          error: 'Delivery confirmation not found'
        });
        return;
      }

      const imagePath = deliveryConfirmation.imagePath;
      
      if (!fs.existsSync(imagePath)) {
        res.status(404).json({
          success: false,
          error: 'Image file not found'
        });
        return;
      }

      // Set appropriate headers for image
      const ext = path.extname(imagePath).toLowerCase();
      const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                         ext === '.png' ? 'image/png' : 
                         ext === '.gif' ? 'image/gif' : 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(imagePath)}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(imagePath);
      fileStream.pipe(res);
    } catch (error) {
      logger.error('Get delivery image error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
