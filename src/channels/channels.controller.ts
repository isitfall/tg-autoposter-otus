import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  async create(@Body() createChannelDto: any, @Request() req) {
    return await this.channelsService.create({
      ...createChannelDto,
      userId: req.user.userId,
    });
  }

  @Get()
  async findAll(@Request() req) {
    return await this.channelsService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.channelsService.findOne(+id, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.channelsService.remove(+id, req.user.userId);
    return { message: 'Channel deleted successfully' };
  }
}