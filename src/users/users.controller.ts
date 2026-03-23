import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUser(id);
  }
}