import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { APP_CONSTANTS } from './constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? APP_CONSTANTS.SERVER.DEFAULT_PORT);
}
bootstrap();
