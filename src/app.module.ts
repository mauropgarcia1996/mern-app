import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './categories/entities/category.entity';

const MongooseConfig = MongooseModule.forRoot(process.env.MONGO_URI);

const TypeOrmConfig = TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.POSTGRES_URI,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Category],
  synchronize: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseConfig,
    TypeOrmConfig,
    AuthModule,
    UsersModule,
    TodosModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
