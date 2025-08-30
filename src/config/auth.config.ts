import { registerAs } from "@nestjs/config";

export default registerAs('auth', () => ({
    jwt_secret: process.env.JWT_SECRET,
    telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN,
}));