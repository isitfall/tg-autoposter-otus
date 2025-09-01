import { registerAs } from "@nestjs/config";
import { APP_CONSTANTS } from '../constants/app.constants';

export default registerAs('database', () => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || APP_CONSTANTS.DATABASE.DEFAULT_PORT,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'tg_autoposter',
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false && process.env.NODE_ENV !== 'production',
}));