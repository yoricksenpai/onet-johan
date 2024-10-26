import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { ProductsController } from './products/products.controller';
import { AuthController } from './auth/auth.controller';
import { UsersService } from './users/users.service';
import { ProductsService } from './products/products.service';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [],
  controllers: [AppController, UsersController, ProductsController, AuthController],
  providers: [AppService, UsersService, ProductsService, AuthService],
})
export class AppModule {}
