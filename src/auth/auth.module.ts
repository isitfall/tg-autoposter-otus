import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { TelegramOauth2NestjsModule } from '@exact-team/nestjs-telegram-oauth2';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
     PassportModule,
     TelegramOauth2NestjsModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const botToken = configService.get('auth.telegram_bot_token');
        if (!botToken) {
          throw new Error('TELEGRAM_BOT_TOKEN is not configured');
        }
        return {
          botToken,
          validUntil: 2000,
        };
      },
      inject: [ConfigService],
     }),
     JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get('auth.jwt_secret');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        return {
          secret,
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
     }),
    
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
