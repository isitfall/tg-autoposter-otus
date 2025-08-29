import { registerAs } from "@nestjs/config";

export default registerAs('auth', () => ({
    jwt_sercret: process.env.JWT_SECRET,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    google_callback_url: process.env.GOOGLE_CALLBACK_URL,
}));