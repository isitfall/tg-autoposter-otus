import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Убираем корневой маршрут, чтобы статические файлы имели приоритет
}
