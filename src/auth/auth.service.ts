import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/user.entity';
import { ITelegramData } from '@exact-team/telegram-oauth2';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {
    }

    async validateTgUser(tgData: ITelegramData): Promise<UserEntity> {
        let user = await this.usersService.findByTelegramId(tgData.id);

        if (!user) {
            user = await this.usersService.create({
                telegramId: tgData.id,
                firstName: tgData.first_name,
                lastName: tgData.last_name,
                photoUrl: tgData.photo_url,
            });
        } else {
            user = await this.usersService.update(user.id, {
                telegramId: tgData.id,
                firstName: tgData.first_name,
                lastName: tgData.last_name,
                photoUrl: tgData.photo_url,
            });
        }

        return user as UserEntity;
    }

    async generateToken(user: UserEntity) {
        const payload = { sub: user.id, tgId: user.telegramId };

        return this.jwtService.sign(payload);
    }

    async login(user: UserEntity) {
        const token = await this.generateToken(user);
        return {
            access_token: token,
            user,
        };
    }
}
