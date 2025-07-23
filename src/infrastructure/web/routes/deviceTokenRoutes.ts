import { Router } from 'express';
import { container } from '../../config/container';
import { DeviceTokenController } from '../controllers/DeviceTokenController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const deviceTokenController = container.get<DeviceTokenController>('DeviceTokenController');

/**
 * @swagger
 * tags:
 *   name: Device Tokens
 *   description: Device token management for push notifications
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceToken:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the device token
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who owns this device token
 *         token:
 *           type: string
 *           description: The actual device token for push notifications
 *         platform:
 *           type: string
 *           enum: [ios, android, web]
 *           description: Platform type
 *         appVersion:
 *           type: string
 *           description: Version of the application
 *         deviceModel:
 *           type: string
 *           description: Model of the device
 *         osVersion:
 *           type: string
 *           description: Operating system version
 *         isActive:
 *           type: boolean
 *           description: Whether the token is active
 *         lastUsedAt:
 *           type: string
 *           format: date-time
 *           description: Last time the token was used
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the token was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the token was last updated
 */

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post('/', deviceTokenController.createDeviceToken.bind(deviceTokenController));
router.get('/', deviceTokenController.listDeviceTokens.bind(deviceTokenController));
router.get('/:id', deviceTokenController.getDeviceToken.bind(deviceTokenController));
router.put('/:id', deviceTokenController.updateDeviceToken.bind(deviceTokenController));
router.delete('/:id', deviceTokenController.deleteDeviceToken.bind(deviceTokenController));

export { router as deviceTokenRoutes };