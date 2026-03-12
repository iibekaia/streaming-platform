import { Injectable, signal } from '@angular/core';
import {
  ActivityItem,
  AnalyticsSummary,
  AuthSession,
  Category,
  Movie,
  Plan,
  PlanConfig,
  PurchaseResult,
  Ticket,
  User,
} from '@streaming-platform/data-models';
import { createId, slugify, uniqueStrings } from '@streaming-platform/utils';

const now = new Date('2026-03-12T10:00:00.000Z');
const iso = (daysOffset: number) => new Date(now.getTime() + daysOffset * 86_400_000).toISOString();

@Injectable({ providedIn: 'root' })
export class MockBackendStore {
  readonly categories = signal<Category[]>([
    { id: 'cat-sci-fi', name: 'Sci-Fi', slug: 'sci-fi', color: '#4f46e5', description: 'World-bending stories' },
    { id: 'cat-thriller', name: 'Thriller', slug: 'thriller', color: '#0f172a', description: 'High-tension picks' },
    { id: 'cat-drama', name: 'Drama', slug: 'drama', color: '#7c3aed', description: 'Character-driven films' },
    { id: 'cat-doc', name: 'Documentary', slug: 'documentary', color: '#14b8a6', description: 'Real stories, deeply told' },
  ]);

  readonly movies = signal<Movie[]>([
    {
      id: 'movie-neon-horizon',
      title: 'Neon Horizon',
      description: 'A suspended city races to decode a signal before daylight collapses its power grid.',
      posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      year: 2025,
      duration: 124,
      director: 'Mila Renshaw',
      cast: ['Talia Brooks', 'Samir Hale', 'Ivo Chen'],
      categories: ['cat-sci-fi', 'cat-thriller'],
      rating: 8.6,
      ticketPrice: 9,
      status: 'published',
      featured: true,
    },
    {
      id: 'movie-glass-archive',
      title: 'Glass Archive',
      description: 'An archivist finds her own future hidden inside a museum restoration project.',
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      year: 2024,
      duration: 108,
      director: 'Ruben Vale',
      cast: ['Aisha Moon', 'Leo Grant'],
      categories: ['cat-drama', 'cat-thriller'],
      rating: 7.9,
      ticketPrice: 7,
      status: 'published',
    },
    {
      id: 'movie-silent-current',
      title: 'Silent Current',
      description: 'A marine biologist traces a vanished fleet through decades of underwater recordings.',
      posterUrl: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      year: 2023,
      duration: 92,
      director: 'Nora Feld',
      cast: ['Irene West', 'Marco Silva'],
      categories: ['cat-doc'],
      rating: 8.2,
      ticketPrice: 6,
      status: 'published',
    },
    {
      id: 'movie-paper-crown',
      title: 'Paper Crown',
      description: 'A playwright returns to her hometown to stage the story nobody wants remembered.',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      year: 2026,
      duration: 117,
      director: 'Elena Rossi',
      cast: ['Jonah Price', 'Rina Okafor'],
      categories: ['cat-drama'],
      rating: 7.4,
      ticketPrice: 8,
      status: 'draft',
    },
  ]);

  readonly users = signal<User[]>([
    {
      id: crypto.randomUUID(),
      email: 'ava@example.com',
      password: 'Password123!',
      displayName: 'Ava Bennett',
      role: 'user',
      plan: 'unlimited',
      planExpiresAt: iso(20),
      sessionToken: 'session-ava',
      createdAt: iso(-40),
      lastActive: iso(-1),
      status: 'active',
    },
    {
      id: crypto.randomUUID(),
      email: 'imeda@example.com',
      password: '12345678',
      displayName: 'Imeda Bekaia',
      role: 'user',
      plan: 'free',
      planExpiresAt: iso(20),
      sessionToken: 'session-ava',
      createdAt: iso(-40),
      lastActive: iso(-1),
      status: 'active',
    },
    {
      id: crypto.randomUUID(),
      email: 'admin@example.com',
      password: 'Admin123!',
      displayName: 'Jules Mercer',
      role: 'admin',
      plan: 'free',
      planExpiresAt: null,
      sessionToken: 'session-admin',
      createdAt: iso(-150),
      lastActive: iso(0),
      status: 'active',
    },
  ]);

  readonly tickets = signal<Ticket[]>([
    { id: 'ticket-1', userId: 'user-ava', movieId: 'movie-glass-archive', purchasedAt: iso(-10) },
  ]);

  readonly plans = signal<Plan[]>([
    {
      id: 'plan-ava',
      userId: 'user-ava',
      type: 'unlimited',
      startedAt: iso(-10),
      expiresAt: iso(20),
      status: 'active',
    },
  ]);

  readonly planConfig = signal<PlanConfig>({
    unlimitedMonthlyPrice: 19,
    defaultTicketPrice: 8,
  });

  readonly activity = signal<ActivityItem[]>([
    { id: 'act-1', type: 'purchase', title: 'UNLIMITED purchased', meta: 'Ava Bennett', createdAt: iso(-2) },
    { id: 'act-2', type: 'login', title: 'Admin sign-in', meta: 'Jules Mercer', createdAt: iso(-1) },
  ]);

  readonly activeSessionToken = signal<string | null>(null);

  listPublishedMovies(): Movie[] {
    return this.movies().filter((movie) => movie.status === 'published');
  }

  getSanitizedUser(user: User): Omit<User, 'password'> {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  authenticate(email: string, password: string, role?: User['role']): AuthSession | null {
    const user = this
      .users()
      .find(
        (item) =>
          item.email.toLowerCase() === email.toLowerCase() &&
          item.password === password &&
          item.status === 'active' &&
          (!role || item.role === role),
      );

    if (!user) {
      return null;
    }

    const sessionToken = createId('session');
    const updatedUser = { ...user, sessionToken, lastActive: new Date().toISOString() };
    this.users.update((users) => users.map((item) => (item.id === user.id ? updatedUser : item)));
    this.activeSessionToken.set(sessionToken);
    this.activity.update((items) => [
      { id: createId('act'), type: 'login', title: 'Successful sign-in', meta: updatedUser.displayName, createdAt: new Date().toISOString() },
      ...items,
    ]);

    const activePlan = this.plans().find((plan) => plan.userId === user.id && plan.status === 'active') ?? null;
    const tickets = this.tickets().filter((ticket) => ticket.userId === user.id);
    return {
      user: this.getSanitizedUser(updatedUser),
      tickets,
      activePlan,
      session: { sessionToken, lastValidatedAt: new Date().toISOString() },
    };
  }

  register(displayName: string, email: string, password: string): AuthSession {
    const user: User = {
      id: createId('user'),
      email,
      password,
      displayName,
      role: 'user',
      plan: 'free',
      planExpiresAt: null,
      sessionToken: null,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
    };
    this.users.update((users) => [user, ...users]);
    return this.authenticate(email, password, 'user')!;
  }

  validateSession(): AuthSession | null {
    const token = this.activeSessionToken();
    if (!token) {
      return null;
    }

    const user = this.users().find((item) => item.sessionToken === token);
    if (!user) {
      return null;
    }

    return {
      user: this.getSanitizedUser(user),
      tickets: this.tickets().filter((ticket) => ticket.userId === user.id),
      activePlan: this.plans().find((plan) => plan.userId === user.id && plan.status === 'active') ?? null,
      session: { sessionToken: token, lastValidatedAt: new Date().toISOString() },
    };
  }

  logout(): void {
    this.activeSessionToken.set(null);
  }

  buyTicket(userId: string, movieId: string): PurchaseResult {
    const ticket: Ticket = { id: createId('ticket'), userId, movieId, purchasedAt: new Date().toISOString() };
    this.tickets.update((tickets) => [ticket, ...tickets]);
    const movie = this.movies().find((item) => item.id === movieId);
    const user = this.users().find((item) => item.id === userId);
    if (movie && user) {
      this.activity.update((items) => [
        {
          id: createId('act'),
          type: 'purchase',
          title: `Ticket purchased for ${movie.title}`,
          meta: user.displayName,
          createdAt: new Date().toISOString(),
        },
        ...items,
      ]);
    }
    return {
      tickets: this.tickets().filter((ticketItem) => ticketItem.userId === userId),
      activePlan: this.plans().find((plan) => plan.userId === userId && plan.status === 'active') ?? null,
    };
  }

  buyUnlimited(userId: string): PurchaseResult {
    const plan: Plan = {
      id: createId('plan'),
      userId,
      type: 'unlimited',
      startedAt: new Date().toISOString(),
      expiresAt: iso(30),
      status: 'active',
    };
    this.plans.update((plans) => [plan, ...plans.filter((item) => item.userId !== userId)]);
    this.users.update((users) =>
      users.map((user) =>
        user.id === userId ? { ...user, plan: 'unlimited', planExpiresAt: plan.expiresAt } : user,
      ),
    );
    return {
      tickets: this.tickets().filter((ticket) => ticket.userId === userId),
      activePlan: plan,
    };
  }

  revokeSession(userId: string): void {
    this.users.update((users) =>
      users.map((user) => (user.id === userId ? { ...user, sessionToken: null } : user)),
    );
    this.activeSessionToken.set(null);
  }

  upsertMovie(movie: Partial<Movie> & Pick<Movie, 'title'>): Movie {
    const nextMovie: Movie = {
      id: movie.id ?? createId('movie'),
      description: movie.description ?? '',
      posterUrl: movie.posterUrl ?? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      videoUrl: movie.videoUrl ?? 'https://www.w3schools.com/html/mov_bbb.mp4',
      year: movie.year ?? now.getUTCFullYear(),
      duration: movie.duration ?? 100,
      director: movie.director ?? '',
      cast: movie.cast ?? [],
      categories: movie.categories ?? [],
      rating: movie.rating ?? 0,
      ticketPrice: movie.ticketPrice ?? this.planConfig().defaultTicketPrice,
      status: movie.status ?? 'draft',
      featured: movie.featured ?? false,
      title: movie.title,
    };
    this.movies.update((movies) => {
      const existing = movies.find((item) => item.id === nextMovie.id);
      return existing ? movies.map((item) => (item.id === nextMovie.id ? { ...existing, ...nextMovie } : item)) : [nextMovie, ...movies];
    });
    return nextMovie;
  }

  deleteMovie(movieId: string): void {
    this.movies.update((movies) => movies.filter((movie) => movie.id !== movieId));
    this.tickets.update((tickets) => tickets.filter((ticket) => ticket.movieId !== movieId));
  }

  upsertCategory(category: Partial<Category> & Pick<Category, 'name'>): Category {
    const nextCategory: Category = {
      id: category.id ?? createId('category'),
      slug: category.slug ?? slugify(category.name),
      description: category.description,
      color: category.color || '#4f46e5',
      icon: category.icon,
      deletedAt: null,
      name: category.name,
    };
    this.categories.update((categories) => {
      const existing = categories.find((item) => item.id === nextCategory.id);
      return existing
        ? categories.map((item) => (item.id === nextCategory.id ? { ...existing, ...nextCategory } : item))
        : [nextCategory, ...categories];
    });
    return nextCategory;
  }

  deleteCategory(categoryId: string): { softDeleted: boolean } {
    const linked = this.movies().some((movie) => movie.categories.includes(categoryId));
    if (linked) {
      this.categories.update((categories) =>
        categories.map((category) =>
          category.id === categoryId ? { ...category, deletedAt: new Date().toISOString() } : category,
        ),
      );
      return { softDeleted: true };
    }

    this.categories.update((categories) => categories.filter((category) => category.id !== categoryId));
    return { softDeleted: false };
  }

  toggleUserStatus(userId: string): void {
    this.users.update((users) =>
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
          : user,
      ),
    );
  }

  updatePlanConfig(config: PlanConfig): void {
    this.planConfig.set(config);
  }

  analytics(): AnalyticsSummary {
    const tickets = this.tickets();
    const activeSubscriptions = this.plans().filter((plan) => plan.status === 'active').length;
    const totalRevenue =
      tickets.reduce((sum, ticket) => {
        const movie = this.movies().find((item) => item.id === ticket.movieId);
        return sum + (movie?.ticketPrice ?? this.planConfig().defaultTicketPrice);
      }, 0) + activeSubscriptions * this.planConfig().unlimitedMonthlyPrice;

    return {
      totalUsers: this.users().filter((user) => user.role === 'user').length,
      activeSubscriptions,
      totalTicketsSold: tickets.length,
      totalRevenue,
      signupSeries: [
        { label: 'W1', value: 4 },
        { label: 'W2', value: 7 },
        { label: 'W3', value: 5 },
        { label: 'W4', value: 9 },
      ],
      recentActivity: this.activity().slice(0, 10),
    };
  }

  movieCountByCategory(categoryId: string): number {
    return this.movies().filter((movie) => movie.categories.includes(categoryId)).length;
  }

  normalizeCast(value: string): string[] {
    return uniqueStrings(value.split(','));
  }
}
