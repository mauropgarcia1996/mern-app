import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { User } from './users/schemas/user.schema';
import { UsersService } from './users/users.service';

describe('AppController', () => {
  let app: INestApplication;
  let appController: AppController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        AuthService,
        {
          provide: 'AuthServiceName',
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
        JwtService,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    await app.init();

    appController = moduleFixture.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should test if it works"', () => {
      expect(1).toBe(1);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
