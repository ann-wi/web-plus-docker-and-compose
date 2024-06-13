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
import { WishListsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@UseGuards(JwtAuthGuard)
@Controller('wishlistlists')
export class WishListsController {
  constructor(private readonly wishListsService: WishListsService) {}

  // Create new wishlist
  @Post()
  async create(@Req() req, @Body() createWishlistDto: CreateWishlistDto) {
    try {
      return await this.wishListsService.create(req.user, createWishlistDto);
    } catch (err) {
      console.log(err);
    }
  }

  // Get all wishlists
  @Get()
  async findAll() {
    return this.wishListsService.findAll();
  }

  // Get wishlist by id
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.wishListsService.findById(+id);
  }

  // Update wishlist by id
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') wishlistId: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return await this.wishListsService.updateOne(
      req.user,
      +wishlistId,
      updateWishlistDto,
    );
  }

  // Delete wishlist by id
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    return await this.wishListsService.removeOne(req.user.id, +id);
  }
}
