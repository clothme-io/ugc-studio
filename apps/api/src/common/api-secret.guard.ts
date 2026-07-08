import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiSecretGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const secret = this.config.get<string>('API_SECRET');
    if (!secret || secret === 'change-me-in-production') {
      return true;
    }
    const header = req.headers['x-api-secret'];
    if (header !== secret) {
      throw new UnauthorizedException('Invalid API secret');
    }
    return true;
  }
}
