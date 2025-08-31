import { NestjsGrammyModule } from "@grammyjs/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TelegramUpdate } from "./telegram.update";
import { UsersModule } from "src/users/users.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        ConfigModule,  
        NestjsGrammyModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({token: configService.get<string>('TELEGRAM_BOT_TOKEN') ?? 'error'}),
            inject: [ConfigService],
      }),
      UsersModule,
      AuthModule
    ],
      providers: [TelegramUpdate],
      
})
export class TelegramModule {}
