import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { hashHelpers } from '../helpers/helpers';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  auth(user: User) {
    // Generate tokens
    const payload = { sub: user.id };

    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findUserByName(username);

    const passwordHash = await hashHelpers.validateHash(
      password,
      user.password,
    );
    if (!passwordHash) {
      throw new UnauthorizedException('Неверное имя пользоваетеля или пароль');
    }
    if (user && passwordHash) {
      const { ...result } = user;
      return result;
    }
    return null;
  }
}
