import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  // Create a wish
  async create(owner: User, createWishDto: CreateWishDto): Promise<Wish> {
    const wish = await this.wishRepository.create({ ...createWishDto, owner });

    return this.wishRepository.save(wish);
  }

  // Find wish by id
  async findOne(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: { offers: true, owner: true },
    });
    if (!wish) {
      throw new NotFoundException('Wish is not found');
    }
    return wish;
  }

  // Find all wishes
  async findAll(): Promise<Wish[]> {
    return await this.wishRepository.find();
  }

  // Find wishes
  async findWishes(item): Promise<Wish[]> {
    return await this.wishRepository.findBy(item);
  }

  // Update wish
  async updateOne(
    wishId: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ) {
    const wish = await this.findOne(wishId);

    if (!wish) {
      throw new NotFoundException('Wish is not found');
    }

    if (userId !== wish.owner.id) {
      throw new ForbiddenException('You can only update your wishes');
    }

    if (wish.raised && updateWishDto.price > 0) {
      throw new ForbiddenException(
        'You cannot update price since you already have offers',
      );
    }

    return await this.wishRepository.update(wishId, {
      ...updateWishDto,
      updatedAt: new Date(),
    });
  }

  // Delete wish
  async removeOne(wishId: number, userId: number) {
    const wish = await this.findOne(wishId);

    if (!wish) {
      throw new NotFoundException('Wish is not found');
    }
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('You can only delete your wishes');
    }
    return await this.wishRepository.delete(wishId);
  }

  // Copy wish
  async copyWish(wishId: number, user: User) {
    const wish = await this.findOne(wishId);

    if (wish.owner.id === user.id) {
      throw new ConflictException('You already copied this wish');
    }

    if (!wish) {
      throw new NotFoundException('Wish is not found');
    }

    if (user.id === wish.owner.id) {
      throw new ForbiddenException('You cannot copy your wishes');
    }

    await this.wishRepository.update(wishId, {
      copied: (wish.copied = wish.copied + 1),
    });

    await this.create(user, {
      ...wish,
      raised: 0,
    });
  }

  // Find the last 40 wishes
  async lastWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
    });
  }

  // Get the last top 20 wishes
  async topWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
    });
  }

  async find(arg: any) {
    return await this.wishRepository.find(arg);
  }
}
