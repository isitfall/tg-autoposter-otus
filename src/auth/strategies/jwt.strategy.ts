import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.jwt_secret') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      telegramId: payload.telegramId,
      username: payload.username,
      firstName: payload.firstName,
      lastName: payload.lastName
    };
  }
}
