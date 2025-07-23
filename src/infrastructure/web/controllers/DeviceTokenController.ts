import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateDeviceTokenDto } from '../dto/CreateDeviceTokenDto';
import { UpdateDeviceTokenDto } from '../dto/UpdateDeviceTokenDto';
import { CreateDeviceTokenUseCase } from '../../../application/use-cases/CreateDeviceTokenUseCase';
import { GetDeviceTokenUseCase } from '../../../application/use-cases/GetDeviceTokenUseCase';
import { UpdateDeviceTokenUseCase } from '../../../application/use-cases/UpdateDeviceTokenUseCase';
import { DeleteDeviceTokenUseCase } from '../../../application/use-cases/DeleteDeviceTokenUseCase';
import { ListDeviceTokensUseCase } from '../../../application/use-cases/ListDeviceTokensUseCase';

@injectable()
export class DeviceTokenController {
  constructor(
    @inject('CreateDeviceTokenUseCase') private readonly createDeviceTokenUseCase: CreateDeviceTokenUseCase,
    @inject('GetDeviceTokenUseCase') private readonly getDeviceTokenUseCase: GetDeviceTokenUseCase,
    @inject('UpdateDeviceTokenUseCase') private readonly updateDeviceTokenUseCase: UpdateDeviceTokenUseCase,
    @inject('DeleteDeviceTokenUseCase') private readonly deleteDeviceTokenUseCase: DeleteDeviceTokenUseCase,
    @inject('ListDeviceTokensUseCase') private readonly listDeviceTokensUseCase: ListDeviceTokensUseCase
  ) {}

  /**
   * @swagger
   * /api/device-tokens:
   *   post:
   *     summary: Create a new device token
   *     description: Creates a new device token for push notifications
   *     tags: [Device Tokens]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - token
   *               - platform
   *             properties:
   *               userId:
   *                 type: string
   *                 format: uuid
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *               token:
   *                 type: string
   *                 example: "dGhpcyBpcyBhIGZha2UgdG9rZW4="
   *               platform:
   *                 type: string
   *                 enum: [ios, android, web]
   *                 example: "ios"
   *               appVersion:
   *                 type: string
   *                 example: "1.0.0"
   *               deviceModel:
   *                 type: string
   *                 example: "iPhone 14 Pro"
   *               osVersion:
   *                 type: string
   *                 example: "16.0"
   *     responses:
   *       201:
   *         description: Device token created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                     token:
   *                       type: string
   *                     platform:
   *                       type: string
   *                     appVersion:
   *                       type: string
   *                     deviceModel:
   *                       type: string
   *                     osVersion:
   *                       type: string
   *                     isActive:
   *                       type: boolean
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                 message:
   *                   type: string
   *       400:
   *         description: Validation error
   *       409:
   *         description: Device token already exists
   */
  async createDeviceToken(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreateDeviceTokenDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      const result = await this.createDeviceTokenUseCase.execute({
        userId: dto.userId,
        token: dto.token,
        platform: dto.platform,
        appVersion: dto.appVersion,
        deviceModel: dto.deviceModel,
        osVersion: dto.osVersion
      });

      res.status(201).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else if (error.message === 'Device token already exists') {
        res.status(409).json({
          success: false,
          error: error.message
        });
      } else if (error.message.includes('Invalid platform')) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * @swagger
   * /api/device-tokens/{id}:
   *   get:
   *     summary: Get device token by ID
   *     description: Retrieves a specific device token by its ID
   *     tags: [Device Tokens]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Device token ID
   *     responses:
   *       200:
   *         description: Device token retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                     token:
   *                       type: string
   *                     platform:
   *                       type: string
   *                     appVersion:
   *                       type: string
   *                     deviceModel:
   *                       type: string
   *                     osVersion:
   *                       type: string
   *                     isActive:
   *                       type: boolean
   *                     lastUsedAt:
   *                       type: string
   *                       format: date-time
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *       404:
   *         description: Device token not found
   */
  async getDeviceToken(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.getDeviceTokenUseCase.execute({ id });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Device token not found') {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * @swagger
   * /api/device-tokens/{id}:
   *   put:
   *     summary: Update device token
   *     description: Updates an existing device token
   *     tags: [Device Tokens]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Device token ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *                 example: "dGhpcyBpcyBhIGZha2UgdG9rZW4="
   *               appVersion:
   *                 type: string
   *                 example: "1.0.1"
   *               deviceModel:
   *                 type: string
   *                 example: "iPhone 14 Pro Max"
   *               osVersion:
   *                 type: string
   *                 example: "16.1"
   *               isActive:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       200:
   *         description: Device token updated successfully
   *       404:
   *         description: Device token not found
   *       409:
   *         description: Device token already exists (when updating token)
   */
  async updateDeviceToken(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = plainToClass(UpdateDeviceTokenDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      const result = await this.updateDeviceTokenUseCase.execute({
        id,
        token: dto.token,
        appVersion: dto.appVersion,
        deviceModel: dto.deviceModel,
        osVersion: dto.osVersion,
        isActive: dto.isActive
      });

      res.status(200).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error: any) {
      if (error.message === 'Device token not found') {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else if (error.message === 'Device token already exists') {
        res.status(409).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * @swagger
   * /api/device-tokens/{id}:
   *   delete:
   *     summary: Delete device token
   *     description: Deletes a device token by its ID
   *     tags: [Device Tokens]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Device token ID
   *     responses:
   *       200:
   *         description: Device token deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                 message:
   *                   type: string
   *       404:
   *         description: Device token not found
   */
  async deleteDeviceToken(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.deleteDeviceTokenUseCase.execute({ id });

      res.status(200).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error: any) {
      if (error.message === 'Device token not found') {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * @swagger
   * /api/device-tokens:
   *   get:
   *     summary: List device tokens
   *     description: Lists device tokens for a specific user
   *     tags: [Device Tokens]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID to filter device tokens
   *       - in: query
   *         name: activeOnly
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Filter only active device tokens
   *     responses:
   *       200:
   *         description: Device tokens retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     deviceTokens:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                           userId:
   *                             type: string
   *                             format: uuid
   *                           token:
   *                             type: string
   *                           platform:
   *                             type: string
   *                           appVersion:
   *                             type: string
   *                           deviceModel:
   *                             type: string
   *                           osVersion:
   *                             type: string
   *                           isActive:
   *                             type: boolean
   *                           lastUsedAt:
   *                             type: string
   *                             format: date-time
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                     total:
   *                       type: integer
   *                 message:
   *                   type: string
   *       400:
   *         description: Missing required userId parameter
   */
  async listDeviceTokens(req: Request, res: Response): Promise<void> {
    try {
      const { userId, activeOnly } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'userId parameter is required'
        });
        return;
      }

      const result = await this.listDeviceTokensUseCase.execute({
        userId: userId as string,
        activeOnly: activeOnly === 'true'
      });

      res.status(200).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}