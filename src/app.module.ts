import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/db-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRoot(databaseConfig() as TypeOrmModuleOptions),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
