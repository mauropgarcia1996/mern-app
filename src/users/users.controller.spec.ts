import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './create-use.dto';
import { User } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
class UserModel {
  constructor(private data) {}
  save = jest.fn().mockResolvedValue(this.data);
  static findOne = jest.fn();
  static create = jest.fn((user: CreateUserDto) =>
    Promise.resolve({ _id: 'user uuid', ...user }),
  );
}
describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: UserModel,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should create an user', async () => {
    const newUserDTO: CreateUserDto = {
      username: 'test',
      password: 'Test123!',
    };
    const userCreated = await controller.create(newUserDTO);
    expect(userCreated.username).toBe(newUserDTO.username);
  });
  it('should throw an error if username is already taken', async () => {
    const newUserDTO: CreateUserDto = {
      username: 'test',
      password: 'Test123!',
    };
    UserModel.findOne.mockResolvedValueOnce(newUserDTO);
    await expect(controller.create(newUserDTO)).rejects.toThrow();
  });
  it('should throw an error if password is invalid', async () => {
    const newUserDTO: CreateUserDto = {
      username: 'test',
      password: 'test',
    };
    await expect(controller.create(newUserDTO)).rejects.toThrow();
  });
});
