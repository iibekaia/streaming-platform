export type UserRole = 'user' | 'admin';
export type MovieStatus = 'draft' | 'published';
export type UserStatus = 'active' | 'suspended';

export enum SubscriptionPlan {
  STANDARD = 'standard',
  UNLIMITED = 'unlimited',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  deletedAt?: string | null;
}

export interface Movie {
  id: string;
  imdbId?: string;
  title: string;
  description: string;
  posterUrl: string;
  videoUrl: string;
  year: number;
  duration: number;
  director: string;
  cast: string[];
  categories: string[];
  rating: number;
  ticketPrice: number;
  status: MovieStatus;
  featured?: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  movieId: string;
  purchasedAt: string;
}

export interface Plan {
  id: string;
  userId: string;
  type: SubscriptionPlan.UNLIMITED;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
}

export interface SessionInfo {
  sessionToken: string;
  lastValidatedAt: string;
  accessToken?: string;
  invalidatedReason?: string;
}

export interface JwtSessionClaims {
  sub: string;
  role: UserRole;
  sid: string;
  type: 'access';
  user: Omit<User, 'password'>;
  ticketMovieIds: string[];
  activePlan?: Plan | null;
  iat?: number;
  exp?: number;
}

export interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  plan: SubscriptionPlan;
  planExpiresAt?: string | null;
  sessionToken?: string | null;
  createdAt: string;
  lastActive: string;
  status: UserStatus;
}

export interface ActivityItem {
  id: string;
  type: 'purchase' | 'login' | 'session-revoked';
  title: string;
  meta: string;
  createdAt: string;
}

export interface PlanConfig {
  unlimitedMonthlyPrice: number;
  defaultTicketPrice: number;
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeSubscriptions: number;
  totalTicketsSold: number;
  totalRevenue: number;
  signupSeries: Array<{ label: string; value: number }>;
  recentActivity: ActivityItem[];
}

export interface MovieQuery {
  search?: string;
  categoryIds?: string[];
  includeDrafts?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuthSession {
  user: Omit<User, 'password'>;
  tickets: Ticket[];
  activePlan?: Plan | null;
  session: SessionInfo;
}

export interface PurchaseResult {
  tickets: Ticket[];
  activePlan?: Plan | null;
}

export interface AuthTokenResponse {
  accessToken: string;
}
