import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUsertDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { hashHelpers } from '../helpers/helpers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create new user
  async create(сreateUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: сreateUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email is already registered');
    }

    const user = this.userRepository.create(сreateUserDto);
    const { password, ...result } = user;
    const hash = await hashHelpers.createHash(password);
    return await this.userRepository.save({ password: hash, ...result });
  }

  // Find all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Find user by id
  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  // Find user by rname
  async findUserByName(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  // Find user by email
  async findUserByEmail(query: string): Promise<User[]> {
    const user = await this.userRepository.find({
      where: [{ email: query }],
    });
    if (!user) {
      throw new NotFoundException(`Пользователь c email ${query} не найден`);
    }
    return user;
  }

  // Find user by email and name
  async findQuery(query): Promise<User[]> {
    const user = await this.userRepository.find({
      where: [{ email: query }, { username: query }],
    });
    if (user.length > 0) {
      return user;
    } else return undefined;
  }

  // Upadte user data
  async updateOne(userId: number, updateUsertDto: UpdateUsertDto) {
    const user = await this.findUserById(userId);

    if (updateUsertDto.username && updateUsertDto.username !== user.username) {
      const username = await this.findQuery(updateUsertDto.username);

      if (username) {
        throw new BadRequestException('User with this name already exists');
      }
    }

    if (updateUsertDto.email && updateUsertDto.email !== user.email) {
      const useremail = await this.findQuery(updateUsertDto.email);

      if (useremail) {
        throw new BadRequestException('User with this email already exists');
      }
    }

    if (updateUsertDto.password) {
      const hash = await hashHelpers.createHash(updateUsertDto.password);
      const newUser = await this.userRepository.update(userId, {
        ...updateUsertDto,
        password: hash,
        updatedAt: new Date(),
      });
      return newUser;
    } else {
      return await this.userRepository.update(userId, {
        ...updateUsertDto,
        updatedAt: new Date(),
      });
    }
  }

  // Find user wishes
  async findUserWishes(id: number): Promise<Wish[]> {
    const wishes = await this.wishRepository.find({
      where: { owner: { id } },
    });
    if (!wishes) {
      throw new NotFoundException('No wishes found');
    }
    return wishes;
  }

  // Find users by name and email
  async findMany({ query }: FindUserDto): Promise<User[]> {
    const user = await this.userRepository.find({
      where: [{ username: query }, { email: query }],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Delete user
  async removeOne(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
