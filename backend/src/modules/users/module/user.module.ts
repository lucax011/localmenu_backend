import { Module } from '@nestjs/common';
import { UserService } from '../services/user.services';
import { UserController } from '../controller/user.controller';

@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}