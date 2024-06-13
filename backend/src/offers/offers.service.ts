import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishesService } from '../wishes/wishes.service';
import { Offer } from '../offers/entities/offer.entity';
import { User } from '../users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto) {
    const wish = await this.wishesService.findOne(createOfferDto.itemId);

    if (!wish) {
      throw new NotFoundException('Wish is not found');
    }
    if (user.id === wish.owner.id) {
      throw new ForbiddenException('You added this wish and cannot chip in');
    }

    const sum = Number(wish.raised) + Number(createOfferDto.amount);
    if (+sum > wish.price) {
      throw new ForbiddenException('Money for the wish are already saved');
    }

    await this.wishesService.updateOne(
      wish.id,
      { raised: +sum },
      wish.owner.id,
    );

    return this.offerRepository.save({ ...createOfferDto, user, item: wish });
  }

  async findAll() {
    const offers = await this.offerRepository.find({
      relations: { user: true, item: true },
    });
    if (offers.length === 0) {
      throw new NotFoundException('No offer yet');
    }
    return offers;
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.find({
      where: { id },
      relations: { user: true, item: true },
    });
    if (offer.length === 0) {
      throw new NotFoundException('Offer is not found');
    }
    return offer;
  }

  async removeOne(id: number) {
    await this.offerRepository.delete(id);
  }
}
