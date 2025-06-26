import { Request, Response } from 'express';
import { AuthCommandPort } from '../../../application/ports/input/AuthCommandPort';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { LoginUserDto } from '../dto/LoginUserDto';

export class AuthController {
  constructor(private readonly authCommandPort: AuthCommandPort) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const dto = RegisterUserDto.fromRequest(req.body);
      
      const result = await this.authCommandPort.registerUser({
        email: dto.email,
        password: dto.password,
        confirmPassword: dto.confirmPassword,
        age: dto.age,
        firstName: dto.firstName,
        lastName: dto.lastName
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = LoginUserDto.fromRequest(req.body);
      
      const result = await this.authCommandPort.loginUser({
        email: dto.email,
        password: dto.password,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      await this.authCommandPort.logoutUser({ accessToken: token });

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}