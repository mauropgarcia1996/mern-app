import { Body, Controller, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './create-use.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @Patch()
  async update(@Body() data: any) {
    return this.usersService.update(data.username, data.user);
  }
}
