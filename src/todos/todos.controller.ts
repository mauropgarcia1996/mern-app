import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTodoDto } from './create-todo.dto';
import { TodosService } from './todos.service';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(@Query('status') status: string) {
    return this.todosService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTodoDto) {
    return this.todosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: CreateTodoDto) {
    return this.todosService.update(id, body);
  }
}
