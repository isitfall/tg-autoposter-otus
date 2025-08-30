import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return user;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
    };
  }

  async register(email: string, password: string, nickname?: string) {
    const user = await this.usersService.create(email, password, nickname);
    
    // Автоматически логиним пользователя после регистрации
    return this.login(user);
  }
}
