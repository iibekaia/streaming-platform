import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthTokenResponse } from '@streaming-platform/data-models';
import { BackendStore } from '../backend.store';
import { CsrfGuard } from './csrf.guard';
import { ChangePasswordDto, LoginDto, RegisterDto } from './auth.dto';
import { RefreshGuard } from './refresh.guard';
import { SessionGuard } from './session.guard';
import { SessionRequest } from './session.types';
import { TokenService } from './token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly store: BackendStore,
    private readonly tokens: TokenService,
  ) {}

  private get cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }

  private setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
    const cookieOptions = this.cookieOptions;
    response.cookie('sp_csrf', crypto.randomUUID(), {
      httpOnly: false,
      sameSite: 'strict',
      secure: cookieOptions.secure,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    response.cookie('sp_access', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    response.cookie('sp_refresh', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response): AuthTokenResponse {
    const session = this.store.authenticate(dto.identifier, dto.password, dto.role);
    if (!session) {
      throw new UnauthorizedException('Invalid credentials or account access.');
    }

    const refreshId = this.store.startRefreshSession(session.user.id, session.session.sessionToken);
    const tokenPair = this.tokens.createTokenPair(session, refreshId);
    this.setAuthCookies(response, tokenPair.accessToken, tokenPair.refreshToken);
    return { accessToken: tokenPair.accessToken };
  }

  @Post('register')
  register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response): AuthTokenResponse {
    const session = this.store.register(dto.displayName, dto.email, dto.password);
    const refreshId = this.store.startRefreshSession(session.user.id, session.session.sessionToken);
    const tokenPair = this.tokens.createTokenPair(session, refreshId);
    this.setAuthCookies(response, tokenPair.accessToken, tokenPair.refreshToken);
    return { accessToken: tokenPair.accessToken };
  }

  @Get('validate-session')
  @UseGuards(SessionGuard)
  validate(@Req() request: SessionRequest, @Res({ passthrough: true }) response: Response): AuthTokenResponse {
    const session = this.store.validateSession(request.sessionToken!);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }
    const accessToken = this.tokens.createAccessToken(session);
    const refreshId = this.store.getRefreshId(request.sessionToken!);
    if (refreshId) {
      const refreshToken = this.tokens.createRefreshToken(session.user.id, request.sessionToken!, refreshId);
      this.setAuthCookies(response, accessToken, refreshToken);
    } else {
      response.cookie('sp_access', accessToken, {
        ...this.cookieOptions,
        maxAge: 15 * 60 * 1000,
      });
    }
    return { accessToken };
  }

  @Post('refresh')
  @UseGuards(CsrfGuard, RefreshGuard)
  refresh(@Req() request: SessionRequest, @Res({ passthrough: true }) response: Response) {
    const session = this.store.validateSession(request.sessionToken!);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }
    const refreshId = this.store.rotateRefreshSession(request.sessionToken!);
    if (!refreshId) {
      throw new UnauthorizedException('Refresh token expired');
    }
    const tokenPair = this.tokens.createTokenPair(session, refreshId);
    this.setAuthCookies(response, tokenPair.accessToken, tokenPair.refreshToken);
    return {
      accessToken: tokenPair.accessToken,
    };
  }

  @Post('logout')
  @UseGuards(CsrfGuard, SessionGuard)
  logout(@Req() request: SessionRequest, @Res({ passthrough: true }) response: Response) {
    this.store.logout(request.sessionToken!);
    response.clearCookie('sp_access', { path: '/' });
    response.clearCookie('sp_refresh', { path: '/' });
    response.clearCookie('sp_csrf', { path: '/' });
    return { ok: true };
  }

  @Post('change-password')
  @UseGuards(CsrfGuard, SessionGuard)
  changePassword(@Req() request: SessionRequest, @Body() dto: ChangePasswordDto) {
    this.store.changePassword(request.sessionToken!, dto.currentPassword, dto.nextPassword);
    return { ok: true };
  }
}
