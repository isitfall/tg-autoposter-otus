import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: any, @Request() req) {
    return await this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req) {
    return await this.postsService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.postsService.findOne(+id, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.postsService.remove(+id, req.user.userId);
    return { message: 'Post deleted successfully' };
  }
}