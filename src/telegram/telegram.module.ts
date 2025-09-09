import { InjectBot, NestjsGrammyModule } from "@grammyjs/nestjs";
import { Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TelegramUpdate } from "./telegram.update";
import { UsersModule } from "src/users/users.module";
import { AuthModule } from "src/auth/auth.module";
import { ChannelsModule } from "src/channels/channels.module";
import { Bot, Context } from "grammy";
import { PostModule } from "src/post/post.module";

@Module({
  imports: [
    ConfigModule,
    NestjsGrammyModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>("TELEGRAM_BOT_TOKEN") ?? "error",
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ChannelsModule,
    PostModule,
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule implements OnModuleDestroy {
  constructor(@InjectBot() private readonly bot: Bot<Context>) {}

  async onModuleDestroy() {
    try {
      await this.bot.api.deleteWebhook();
      console.log("Telegram webhook deleted");
    } catch (error) {
      console.error("Error deleting webhook:", error);
    }
  }
}
