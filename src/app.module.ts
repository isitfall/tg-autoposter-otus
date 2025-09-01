import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import databaseConfig from './config/db.config';
import authConfig from './config/auth.config';
import { TelegramModule } from './telegram/telegram.module';
import { ChannelsModule } from './channels/channels.module';
import { PostModule } from './post/post.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig],
    }),
    TypeOrmModule.forRoot(databaseConfig() as TypeOrmModuleOptions),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TelegramModule,
    ChannelsModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
