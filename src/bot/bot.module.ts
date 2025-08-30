import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotUpdate } from './bot.update';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN is not defined');
        }
        return {
          token,
          options: {
            telegram: {
              webhookReply: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
  providers: [BotUpdate],
})
export class BotModule {}
