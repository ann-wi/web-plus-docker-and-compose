import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishesService } from '../wishes/wishes.service';
import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishListsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  // Create a new wishlist
  async create(user: User, сreateWishlistDto: CreateWishlistDto) {
    const { itemsId } = сreateWishlistDto;
    const wishes = itemsId.map((id) => {
      return this.wishesService.findOne(id);
    });

    return await Promise.all(wishes).then((items) => {
      const wishlist = this.wishlistsRepository.create({
        ...сreateWishlistDto,
        owner: user,
        items,
      });
      return this.wishlistsRepository.save(wishlist);
    });
  }

  // Find all wishlists
  async findAll() {
    return await this.wishlistsRepository.find({
      relations: ['owner', 'items'],
    });
  }

  // Get wishlist by id
  async findById(id: number) {
    return await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }

  // Update wishlist by id
  async updateOne(
    user: User,
    wishListId: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findById(wishListId);

    if (!wishlist) {
      throw new NotFoundException('Wishlist is not found');
    }
    if (user.id !== wishlist.owner.id) {
      throw new ForbiddenException('You can only update your wishlists');
    }

    const wishes = await this.wishesService.findWishes(
      updateWishlistDto.itemsId,
    );

    return await this.wishlistsRepository.save({
      ...wishlist,
      name: updateWishlistDto.name,
      image: updateWishlistDto.image,
      description: updateWishlistDto.description,
      items: wishes,
    });
  }

  // Delete wishlist by id
  async removeOne(userId: number, wishListId: number) {
    const wishlist = await this.findById(wishListId);

    if (!wishlist) {
      throw new NotFoundException('Wishlist is not found');
    }

    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException('You can only delete your wishlists');
    }

    await this.wishlistsRepository.delete(wishListId);
    return wishlist;
  }
}
