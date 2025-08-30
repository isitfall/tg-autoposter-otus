import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ITelegramData } from '@exact-team/telegram-oauth2';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('telegram')
    async telegramLogin(@Body() tgDetails: ITelegramData) {
        const user = await this.authService.validateTgUser(tgDetails);
        return this.authService.login(user);
    }
}
