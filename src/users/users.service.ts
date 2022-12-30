import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './create-use.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { passwordValidationRegex, usernameValidationRegex } from './constants';

class UpdateUserDto {
  refreshToken: string;
}
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(username: string): Promise<User> {
    return this.userModel.findOne({ username });
  }

  async update(username: string, update): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { username },
      {
        $set: update,
      },
      { new: true },
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Search for a duplicated username
    const user = await this.userModel.findOne({
      username: createUserDto.username,
    });
    if (user) {
      throw new HttpException(
        'Signup failed, invalid username or password.',
        HttpStatus.CONFLICT,
      );
    }
    // Validate fields
    const validFields = await UsersService.validateFields(createUserDto);
    if (validFields) {
      // If not found, hash the password
      const hashedPassword = await UsersService.hashPassword(
        createUserDto.password,
      );
      // Create a new user
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      return createdUser.save();
    } else {
      throw new HttpException(
        'Signup failed, invalid username or password.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  static async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  static async validateFields(createUserDto: CreateUserDto) {
    return (
      UsersService.validatePassword(createUserDto.password) &&
      UsersService.validateUsername(createUserDto.username)
    );
  }

  static validatePassword(password) {
    return passwordValidationRegex.test(password);
  }

  static validateUsername(username) {
    return usernameValidationRegex.test(username);
  }
}
