import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTodoDto } from './create-todo.dto';
import { Todo, TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async findAll(status: string): Promise<Todo[]> {
    if (status === 'done') {
      return this.todoModel.find({ done: true });
    } else if (status === 'incompleted') {
      return this.todoModel.find({ done: false });
    }
    return this.todoModel.find();
  }

  async findOne(id: string): Promise<Todo> {
    return this.todoModel.findById(id);
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const createdTodo = new this.todoModel(createTodoDto);
    return createdTodo.save();
  }

  async update(id: string, createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoModel.findByIdAndUpdate(id, createTodoDto);
  }
}
