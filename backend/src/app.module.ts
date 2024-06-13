import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { WishesModule } from './wishes/wishes.module';
import { OffersModule } from './offers/offers.module';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    WishlistsModule,
    WishesModule,
    OffersModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
