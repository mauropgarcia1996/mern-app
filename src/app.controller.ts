import { Controller, Request, Post, UseGuards, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { RefreshTokenGuard } from './auth/refresh-token.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(req.user);
    this.authService.storeTokensInCookie(res, tokens);
    res.status(200).send({ message: 'ok ' });
    return;
  }

  @Post('auth/verify')
  async verify(@Request() req) {
    return this.authService.verifyToken(req.body.token);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('auth/refresh')
  async refreshTokens(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const username = req.body.username;
    const refreshToken = req.cookies.refresh_token;
    const tokens = await this.authService.refreshTokens(username, refreshToken);
    this.authService.storeTokensInCookie(res, tokens);
    res.status(200).send({ message: 'ok ' });
    return;
  }
}
