import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

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
    const { accessToken, refreshToken } = await this.getTokens(
      user._doc._id,
      user._doc.username,
    );
    await this.updateRefreshToken(user._doc.username, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  storeTokensInCookie(res: Response, tokens) {
    res.cookie('access_token', tokens.accessToken, {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
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

  async updateRefreshToken(username: string, refreshToken: string) {
    try {
      const updated = await this.usersService.update(username, {
        refreshToken,
      });
      return updated;
    } catch (error) {
      throw new HttpException(
        'Authorization failed, could not refresh token.',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(username: string, refreshToken: string) {
    const user = await this.usersService.findOne(username);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    const refreshTokenMatches = user.refreshToken === refreshToken;
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }
    const tokens = await this.getTokens(user._id, user.username);
    await this.updateRefreshToken(user.username, tokens.refreshToken);
    return tokens;
  }
}
