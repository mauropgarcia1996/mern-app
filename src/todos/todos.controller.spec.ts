import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTodoDto } from './create-todo.dto';
import { Todo } from './schemas/todo.schema';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

export class TodoModel {
  constructor(private data) {}
  save = jest.fn().mockResolvedValue(this.data);
  static findAll = jest.fn();
  static find = jest.fn();
  static findOne = jest.fn();
  static findById = jest.fn();
  static findByIdAndUpdate = jest.fn();
  static create = jest.fn((todo: CreateTodoDto) =>
    Promise.resolve({ _id: 'todo uuid', ...todo }),
  );
  static update = jest.fn();
}
describe('TodosController', () => {
  let todosController: TodosController;
  let todosService: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [MongooseModule.forRoot('mongodb://localhost')],
      controllers: [TodosController],
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: TodoModel,
        },
      ],
    }).compile();

    todosService = module.get<TodosService>(TodosService);
    todosController = module.get<TodosController>(TodosController);
  });

  it('should find all todos', async () => {
    const todosList = [
      {
        _id: '63a22d3b2cba1137dc2eea52',
        title: 'Limpiar balcon.',
        __v: 0,
      },
      {
        _id: '63a22dcdf66bb3da5b26a096',
        title: 'Ordenar escritorio.',
        __v: 0,
        done: true,
      },
    ];
    TodoModel.find.mockResolvedValueOnce(todosList);
    const todos = await todosController.findAll();
    expect(todos).toEqual(todosList);
  });
  it('should find a todo by id', async () => {
    const todo = {
      _id: '63a22d3b2cba1137dc2eea52',
      title: 'Limpiar balcon.',
      __v: 0,
    };
    TodoModel.findOne.mockResolvedValueOnce(todo);
    TodoModel.findById.mockResolvedValueOnce(todo);
    const todoFound = await todosController.findOne(todo._id);
    expect(todoFound).toEqual(todo);
  });
  it('should create a todo', async () => {
    const newTodoDTO: CreateTodoDto = {
      title: 'Limpiar balcon.',
      done: false,
    };
    const todoCreated = await todosController.create(newTodoDTO);
    expect(todoCreated.title).toBe(newTodoDTO.title);
  });
  it('should update a todo', async () => {
    const todo = {
      _id: '63a22d3b2cba1137dc2eea52',
      title: 'Limpiar balcon.',
      __v: 0,
    };
    const newTodoDTO: CreateTodoDto = {
      title: 'Limpiar balcon.',
      done: false,
    };
    TodoModel.findOne.mockResolvedValueOnce(todo);
    TodoModel.findById.mockResolvedValueOnce(todo);
    TodoModel.findByIdAndUpdate.mockResolvedValueOnce(todo);
    TodoModel.update.mockResolvedValueOnce(todo);
    const todoUpdated = await todosController.update(todo._id, newTodoDTO);
    expect(todoUpdated).toEqual(todo);
  });
});
