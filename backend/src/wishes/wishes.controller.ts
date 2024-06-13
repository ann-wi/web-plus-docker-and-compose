import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  // Create a new wish
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() createWishDto: CreateWishDto) {
    return await this.wishesService.create(req.user, createWishDto);
  }

  // Get the last 40 wishes
  @Get('last')
  async findLastWishes() {
    return await this.wishesService.lastWishes();
  }

  // Get the last top 20 wishes
  @Get('top')
  async findTopWishes() {
    return await this.wishesService.topWishes();
  }

  // Get wish by id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.wishesService.findOne(+id);
  }

  // Upadte wish by id
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateOne(
    @Req() req,
    @Param('id') wishId: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return await this.wishesService.updateOne(
      +wishId,
      updateWishDto,
      req.user.id,
    );
  }

  // Delete wish by id
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') wishId: string) {
    return await this.wishesService.removeOne(+wishId, req.user.id);
  }

  // Copy wish
  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copyWish(@Req() req, @Param('id') wishId: string) {
    return await this.wishesService.copyWish(+wishId, req.user);
  }
}
