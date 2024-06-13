import {
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UsersService } from './users.service';
import { UpdateUsertDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { User } from './entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Find my profile
  @Get('me')
  async findMe(@Req() req): Promise<User> {
    return await this.usersService.findUserById(req.user.id);
  }

  // Change my profile
  @Patch('me')
  async updateOne(@Req() req, @Body() updateUsertDto: UpdateUsertDto) {
    return await this.usersService.updateOne(req.user.id, updateUsertDto);
  }

  // Find my wishes
  @Get('me/wishes')
  async findMyWishes(@Req() req): Promise<Wish[]> {
    return await this.usersService.findUserWishes(req.user.id);
  }

  // Find username
  @Get(':username')
  async findByUserName(@Param('username') username: string): Promise<User> {
    const user = await this.usersService.findUserByName(username);
    return user;
  }

  // Find users wishes
  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string): Promise<Wish[]> {
    const user = await this.usersService.findUserByName(username);
    return await this.usersService.findUserWishes(user.id);
  }

  // Find user by email
  @Post('find')
  async findByMany(@Body() findUsertDto: FindUserDto): Promise<User[]> {
    return await this.usersService.findMany(findUsertDto);
  }
}
