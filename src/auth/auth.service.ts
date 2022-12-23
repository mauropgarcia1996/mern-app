import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const passwordMatch = user
      ? await bcrypt.compare(pass, user.password)
      : null;
    if (user && passwordMatch) {
      const { ...result } = user;
      return result;
    }
    throw new HttpException(
      'Login failed, invalid username or password.',
      HttpStatus.CONFLICT,
    );
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyToken(token: string) {
    try {
      const decoded = await this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new HttpException(
        'Authorization failed, invalid token.',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
