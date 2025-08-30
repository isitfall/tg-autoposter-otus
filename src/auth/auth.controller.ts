import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return {
      id: req.user.userId,
      telegramId: req.user.telegramId,
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName || null,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return { message: 'Статистика доступна только через Telegram бота' };
  }
}
