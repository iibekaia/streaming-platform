import { Request } from 'express';
import { Plan, User } from '@streaming-platform/data-models';

export interface SessionRequest extends Request {
  currentUser?: Omit<User, 'password'>;
  sessionToken?: string;
  refreshToken?: string;
  csrfToken?: string;
}

export interface AccessTokenPayload {
  sub: string;
  role: User['role'];
  sid: string;
  type: 'access';
  user: Omit<User, 'password'>;
  ticketMovieIds: string[];
  activePlan?: Plan | null;
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  rid: string;
  type: 'refresh';
}
