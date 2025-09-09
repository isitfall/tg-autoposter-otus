import { Module } from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "src/entities/channel.entity";
import { User } from "src/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Channel, User])],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
