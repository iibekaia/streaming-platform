import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ActivityItem,
  AnalyticsSummary,
  AuthSession,
  Category,
  Movie,
  PaginatedResponse,
  Plan,
  PlanConfig,
  PurchaseResult,
  Ticket,
  User,
} from '@streaming-platform/data-models';
import { createId, slugify, uniqueStrings } from '@streaming-platform/utils';

const now = new Date('2026-03-12T10:00:00.000Z');
const iso = (daysOffset: number) => new Date(now.getTime() + daysOffset * 86_400_000).toISOString();
const defaultVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
const posterPlaceholder = (title: string) =>
  `https://placehold.co/600x900/e2e8f0/0f172a?text=${encodeURIComponent(title.replace(/\s+/g, ' '))}`;

type SeedMovie = {
  title: string;
  year: number;
  imdbId: string;
  categories: string[];
  rating: number;
  duration: number;
  director: string;
  cast: string[];
  featured?: boolean;
};

const movieSeeds: SeedMovie[] = [
  { title: 'The Shawshank Redemption', year: 1994, imdbId: 'tt0111161', categories: ['cat-drama'], rating: 9.3, duration: 142, director: 'Frank Darabont', cast: ['Tim Robbins', 'Morgan Freeman'], featured: true },
  { title: 'The Godfather', year: 1972, imdbId: 'tt0068646', categories: ['cat-crime', 'cat-drama'], rating: 9.2, duration: 175, director: 'Francis Ford Coppola', cast: ['Marlon Brando', 'Al Pacino'], featured: true },
  { title: 'The Dark Knight', year: 2008, imdbId: 'tt0468569', categories: ['cat-action', 'cat-crime', 'cat-thriller'], rating: 9.0, duration: 152, director: 'Christopher Nolan', cast: ['Christian Bale', 'Heath Ledger'], featured: true },
  { title: 'The Godfather Part II', year: 1974, imdbId: 'tt0071562', categories: ['cat-crime', 'cat-drama'], rating: 9.0, duration: 202, director: 'Francis Ford Coppola', cast: ['Al Pacino', 'Robert De Niro'], featured: true },
  { title: '12 Angry Men', year: 1957, imdbId: 'tt0050083', categories: ['cat-drama'], rating: 9.0, duration: 96, director: 'Sidney Lumet', cast: ['Henry Fonda', 'Lee J. Cobb'], featured: true },
  { title: "Schindler's List", year: 1993, imdbId: 'tt0108052', categories: ['cat-drama'], rating: 9.0, duration: 195, director: 'Steven Spielberg', cast: ['Liam Neeson', 'Ralph Fiennes'] },
  { title: 'The Lord of the Rings: The Return of the King', year: 2003, imdbId: 'tt0167260', categories: ['cat-adventure', 'cat-fantasy'], rating: 9.0, duration: 201, director: 'Peter Jackson', cast: ['Elijah Wood', 'Viggo Mortensen'] },
  { title: 'Pulp Fiction', year: 1994, imdbId: 'tt0110912', categories: ['cat-crime', 'cat-drama'], rating: 8.9, duration: 154, director: 'Quentin Tarantino', cast: ['John Travolta', 'Samuel L. Jackson'] },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, imdbId: 'tt0120737', categories: ['cat-adventure', 'cat-fantasy'], rating: 8.9, duration: 178, director: 'Peter Jackson', cast: ['Elijah Wood', 'Ian McKellen'] },
  { title: 'The Good, the Bad and the Ugly', year: 1966, imdbId: 'tt0060196', categories: ['cat-drama'], rating: 8.8, duration: 178, director: 'Sergio Leone', cast: ['Clint Eastwood', 'Eli Wallach'] },
  { title: 'Forrest Gump', year: 1994, imdbId: 'tt0109830', categories: ['cat-drama'], rating: 8.8, duration: 142, director: 'Robert Zemeckis', cast: ['Tom Hanks', 'Robin Wright'] },
  { title: 'Fight Club', year: 1999, imdbId: 'tt0137523', categories: ['cat-drama', 'cat-thriller'], rating: 8.8, duration: 139, director: 'David Fincher', cast: ['Brad Pitt', 'Edward Norton'] },
  { title: 'The Lord of the Rings: The Two Towers', year: 2002, imdbId: 'tt0167261', categories: ['cat-adventure', 'cat-fantasy'], rating: 8.8, duration: 179, director: 'Peter Jackson', cast: ['Elijah Wood', 'Ian McKellen'] },
  { title: 'Inception', year: 2010, imdbId: 'tt1375666', categories: ['cat-action', 'cat-sci-fi', 'cat-thriller'], rating: 8.8, duration: 148, director: 'Christopher Nolan', cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'] },
  { title: 'Star Wars: Episode V - The Empire Strikes Back', year: 1980, imdbId: 'tt0080684', categories: ['cat-action', 'cat-adventure', 'cat-sci-fi'], rating: 8.7, duration: 124, director: 'Irvin Kershner', cast: ['Mark Hamill', 'Harrison Ford'] },
  { title: 'The Matrix', year: 1999, imdbId: 'tt0133093', categories: ['cat-action', 'cat-sci-fi'], rating: 8.7, duration: 136, director: 'The Wachowskis', cast: ['Keanu Reeves', 'Laurence Fishburne'] },
  { title: 'Goodfellas', year: 1990, imdbId: 'tt0099685', categories: ['cat-crime', 'cat-drama'], rating: 8.7, duration: 145, director: 'Martin Scorsese', cast: ['Robert De Niro', 'Ray Liotta'] },
  { title: "One Flew Over the Cuckoo's Nest", year: 1975, imdbId: 'tt0073486', categories: ['cat-drama'], rating: 8.7, duration: 133, director: 'Milos Forman', cast: ['Jack Nicholson', 'Louise Fletcher'] },
  { title: 'Se7en', year: 1995, imdbId: 'tt0114369', categories: ['cat-crime', 'cat-thriller'], rating: 8.6, duration: 127, director: 'David Fincher', cast: ['Brad Pitt', 'Morgan Freeman'] },
  { title: 'Interstellar', year: 2014, imdbId: 'tt0816692', categories: ['cat-adventure', 'cat-drama', 'cat-sci-fi'], rating: 8.7, duration: 169, director: 'Christopher Nolan', cast: ['Matthew McConaughey', 'Anne Hathaway'] },
  { title: 'Seven Samurai', year: 1954, imdbId: 'tt0047478', categories: ['cat-action', 'cat-drama'], rating: 8.6, duration: 207, director: 'Akira Kurosawa', cast: ['Toshiro Mifune', 'Takashi Shimura'] },
  { title: 'The Silence of the Lambs', year: 1991, imdbId: 'tt0102926', categories: ['cat-crime', 'cat-thriller'], rating: 8.6, duration: 118, director: 'Jonathan Demme', cast: ['Jodie Foster', 'Anthony Hopkins'] },
  { title: 'Saving Private Ryan', year: 1998, imdbId: 'tt0120815', categories: ['cat-action', 'cat-drama'], rating: 8.6, duration: 169, director: 'Steven Spielberg', cast: ['Tom Hanks', 'Matt Damon'] },
  { title: 'City of God', year: 2002, imdbId: 'tt0317248', categories: ['cat-crime', 'cat-drama'], rating: 8.6, duration: 130, director: 'Fernando Meirelles', cast: ['Alexandre Rodrigues', 'Leandro Firmino'] },
  { title: 'Life Is Beautiful', year: 1997, imdbId: 'tt0118799', categories: ['cat-drama'], rating: 8.6, duration: 116, director: 'Roberto Benigni', cast: ['Roberto Benigni', 'Nicoletta Braschi'] },
  { title: 'The Green Mile', year: 1999, imdbId: 'tt0120689', categories: ['cat-drama', 'cat-fantasy'], rating: 8.6, duration: 189, director: 'Frank Darabont', cast: ['Tom Hanks', 'Michael Clarke Duncan'] },
  { title: 'Terminator 2: Judgment Day', year: 1991, imdbId: 'tt0103064', categories: ['cat-action', 'cat-sci-fi'], rating: 8.6, duration: 137, director: 'James Cameron', cast: ['Arnold Schwarzenegger', 'Linda Hamilton'] },
  { title: 'Star Wars: Episode IV - A New Hope', year: 1977, imdbId: 'tt0076759', categories: ['cat-action', 'cat-adventure', 'cat-sci-fi'], rating: 8.6, duration: 121, director: 'George Lucas', cast: ['Mark Hamill', 'Harrison Ford'] },
  { title: 'Back to the Future', year: 1985, imdbId: 'tt0088763', categories: ['cat-adventure', 'cat-sci-fi'], rating: 8.5, duration: 116, director: 'Robert Zemeckis', cast: ['Michael J. Fox', 'Christopher Lloyd'] },
  { title: 'Spirited Away', year: 2001, imdbId: 'tt0245429', categories: ['cat-animation', 'cat-adventure', 'cat-fantasy'], rating: 8.6, duration: 125, director: 'Hayao Miyazaki', cast: ['Rumi Hiiragi', 'Miyu Irino'] },
  { title: 'The Pianist', year: 2002, imdbId: 'tt0253474', categories: ['cat-drama'], rating: 8.5, duration: 150, director: 'Roman Polanski', cast: ['Adrien Brody', 'Thomas Kretschmann'] },
  { title: 'Parasite', year: 2019, imdbId: 'tt6751668', categories: ['cat-drama', 'cat-thriller'], rating: 8.5, duration: 132, director: 'Bong Joon Ho', cast: ['Song Kang-ho', 'Lee Sun-kyun'] },
  { title: 'Psycho', year: 1960, imdbId: 'tt0054215', categories: ['cat-thriller'], rating: 8.5, duration: 109, director: 'Alfred Hitchcock', cast: ['Anthony Perkins', 'Janet Leigh'] },
  { title: 'Gladiator', year: 2000, imdbId: 'tt0172495', categories: ['cat-action', 'cat-drama'], rating: 8.5, duration: 155, director: 'Ridley Scott', cast: ['Russell Crowe', 'Joaquin Phoenix'] },
  { title: 'Leon: The Professional', year: 1994, imdbId: 'tt0110413', categories: ['cat-action', 'cat-crime', 'cat-drama'], rating: 8.5, duration: 110, director: 'Luc Besson', cast: ['Jean Reno', 'Natalie Portman'] },
  { title: 'The Lion King', year: 1994, imdbId: 'tt0110357', categories: ['cat-animation', 'cat-adventure', 'cat-drama'], rating: 8.5, duration: 88, director: 'Roger Allers', cast: ['Matthew Broderick', 'Jeremy Irons'] },
  { title: 'Whiplash', year: 2014, imdbId: 'tt2582802', categories: ['cat-drama'], rating: 8.5, duration: 106, director: 'Damien Chazelle', cast: ['Miles Teller', 'J.K. Simmons'] },
  { title: 'The Prestige', year: 2006, imdbId: 'tt0482571', categories: ['cat-drama', 'cat-thriller'], rating: 8.5, duration: 130, director: 'Christopher Nolan', cast: ['Christian Bale', 'Hugh Jackman'] },
  { title: 'The Departed', year: 2006, imdbId: 'tt0407887', categories: ['cat-crime', 'cat-drama', 'cat-thriller'], rating: 8.5, duration: 151, director: 'Martin Scorsese', cast: ['Leonardo DiCaprio', 'Matt Damon'] },
  { title: 'Casablanca', year: 1942, imdbId: 'tt0034583', categories: ['cat-drama'], rating: 8.5, duration: 102, director: 'Michael Curtiz', cast: ['Humphrey Bogart', 'Ingrid Bergman'] },
  { title: 'Alien', year: 1979, imdbId: 'tt0078748', categories: ['cat-sci-fi', 'cat-thriller'], rating: 8.5, duration: 117, director: 'Ridley Scott', cast: ['Sigourney Weaver', 'Tom Skerritt'] },
  { title: 'Apocalypse Now', year: 1979, imdbId: 'tt0078788', categories: ['cat-drama'], rating: 8.4, duration: 147, director: 'Francis Ford Coppola', cast: ['Martin Sheen', 'Marlon Brando'] },
  { title: 'Memento', year: 2000, imdbId: 'tt0209144', categories: ['cat-thriller'], rating: 8.4, duration: 113, director: 'Christopher Nolan', cast: ['Guy Pearce', 'Carrie-Anne Moss'] },
  { title: 'Raiders of the Lost Ark', year: 1981, imdbId: 'tt0082971', categories: ['cat-action', 'cat-adventure'], rating: 8.4, duration: 115, director: 'Steven Spielberg', cast: ['Harrison Ford', 'Karen Allen'] },
  { title: 'Django Unchained', year: 2012, imdbId: 'tt1853728', categories: ['cat-drama'], rating: 8.5, duration: 165, director: 'Quentin Tarantino', cast: ['Jamie Foxx', 'Christoph Waltz'] },
  { title: 'The Shining', year: 1980, imdbId: 'tt0081505', categories: ['cat-thriller'], rating: 8.4, duration: 146, director: 'Stanley Kubrick', cast: ['Jack Nicholson', 'Shelley Duvall'] },
  { title: 'WALL-E', year: 2008, imdbId: 'tt0910970', categories: ['cat-animation', 'cat-adventure', 'cat-sci-fi'], rating: 8.4, duration: 98, director: 'Andrew Stanton', cast: ['Ben Burtt', 'Elissa Knight'] },
  { title: 'Avengers: Endgame', year: 2019, imdbId: 'tt4154796', categories: ['cat-action', 'cat-adventure', 'cat-sci-fi'], rating: 8.4, duration: 181, director: 'Anthony Russo', cast: ['Robert Downey Jr.', 'Chris Evans'] },
  { title: 'The Usual Suspects', year: 1995, imdbId: 'tt0114814', categories: ['cat-crime', 'cat-thriller'], rating: 8.5, duration: 106, director: 'Bryan Singer', cast: ['Kevin Spacey', 'Gabriel Byrne'] },
  { title: 'The Truman Show', year: 1998, imdbId: 'tt0120382', categories: ['cat-drama', 'cat-sci-fi'], rating: 8.2, duration: 103, director: 'Peter Weir', cast: ['Jim Carrey', 'Laura Linney'] },
];

const buildSeedMovie = (movie: SeedMovie): Movie => ({
  id: `movie-${slugify(movie.title)}`,
  imdbId: movie.imdbId,
  title: movie.title,
  description: `${movie.title} is part of the curated IMDb seed catalog. Open it in the dashboard to refresh the full metadata from OMDb using its IMDb id.`,
  posterUrl: posterPlaceholder(movie.title),
  videoUrl: defaultVideoUrl,
  year: movie.year,
  duration: movie.duration,
  director: movie.director,
  cast: movie.cast,
  categories: movie.categories,
  rating: movie.rating,
  ticketPrice: 8,
  status: 'published',
  featured: movie.featured ?? false,
});

@Injectable()
export class BackendStore {
  private readonly refreshSessions = new Map<string, { userId: string; refreshId: string }>();
  private categories: Category[] = [
    { id: 'cat-action', name: 'Action', slug: 'action', color: '#ef4444', description: 'Fast and high-impact stories' },
    { id: 'cat-adventure', name: 'Adventure', slug: 'adventure', color: '#f59e0b', description: 'Expansive journeys and quests' },
    { id: 'cat-animation', name: 'Animation', slug: 'animation', color: '#06b6d4', description: 'Animated features for all ages' },
    { id: 'cat-crime', name: 'Crime', slug: 'crime', color: '#334155', description: 'Underworld sagas and investigations' },
    { id: 'cat-drama', name: 'Drama', slug: 'drama', color: '#7c3aed', description: 'Character-driven films' },
    { id: 'cat-fantasy', name: 'Fantasy', slug: 'fantasy', color: '#8b5cf6', description: 'Epic worlds and mythic stakes' },
    { id: 'cat-sci-fi', name: 'Sci-Fi', slug: 'sci-fi', color: '#4f46e5', description: 'World-bending stories' },
    { id: 'cat-thriller', name: 'Thriller', slug: 'thriller', color: '#0f172a', description: 'High-tension picks' },
  ];

  private movies: Movie[] = movieSeeds.map(buildSeedMovie);

  private users: User[] = [
    {
      id: 'user-ava',
      email: 'ava@example.com',
      password: 'Password123!',
      displayName: 'Ava Bennett',
      role: 'user',
      plan: 'unlimited',
      planExpiresAt: iso(20),
      sessionToken: null,
      createdAt: iso(-40),
      lastActive: iso(-1),
      status: 'active',
    },
    {
      id: 'admin-jules',
      email: 'admin@example.com',
      password: 'Admin123!',
      displayName: 'Jules Mercer',
      role: 'admin',
      plan: 'free',
      planExpiresAt: null,
      sessionToken: null,
      createdAt: iso(-150),
      lastActive: iso(0),
      status: 'active',
    },
  ];

  private tickets: Ticket[] = [{ id: 'ticket-1', userId: 'user-ava', movieId: 'movie-the-dark-knight', purchasedAt: iso(-10) }];
  private plans: Plan[] = [{ id: 'plan-ava', userId: 'user-ava', type: 'unlimited', startedAt: iso(-10), expiresAt: iso(20), status: 'active' }];
  private planConfig: PlanConfig = { unlimitedMonthlyPrice: 19, defaultTicketPrice: 8 };
  private activity: ActivityItem[] = [
    { id: 'act-1', type: 'purchase', title: 'UNLIMITED purchased', meta: 'Ava Bennett', createdAt: iso(-2) },
    { id: 'act-2', type: 'login', title: 'Admin sign-in', meta: 'Jules Mercer', createdAt: iso(-1) },
  ];

  getSanitizedUser(user: User): Omit<User, 'password'> {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  authenticate(email: string, password: string, role?: User['role']): AuthSession | null {
    const user = this.users.find(
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
    user.sessionToken = sessionToken;
    user.lastActive = new Date().toISOString();
    this.activity.unshift({
      id: createId('act'),
      type: 'login',
      title: 'Successful sign-in',
      meta: user.displayName,
      createdAt: new Date().toISOString(),
    });

    return this.createSession(user);
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
    this.users.unshift(user);
    return this.authenticate(email, password, 'user')!;
  }

  validateSession(sessionToken: string): AuthSession | null {
    const user = this.users.find((item) => item.sessionToken === sessionToken);
    return user ? this.createSession(user) : null;
  }

  validateRefreshSession(sessionToken: string, refreshId: string): AuthSession | null {
    const refreshSession = this.refreshSessions.get(sessionToken);
    if (!refreshSession || refreshSession.refreshId !== refreshId) {
      return null;
    }
    return this.validateSession(sessionToken);
  }

  rotateRefreshSession(sessionToken: string): string | null {
    const refreshSession = this.refreshSessions.get(sessionToken);
    if (!refreshSession) {
      return null;
    }
    const refreshId = createId('refresh');
    this.refreshSessions.set(sessionToken, { ...refreshSession, refreshId });
    return refreshId;
  }

  getRefreshId(sessionToken: string): string | null {
    return this.refreshSessions.get(sessionToken)?.refreshId ?? null;
  }

  startRefreshSession(userId: string, sessionToken: string): string {
    const refreshId = createId('refresh');
    this.refreshSessions.set(sessionToken, { userId, refreshId });
    return refreshId;
  }

  logout(sessionToken: string): void {
    const user = this.users.find((item) => item.sessionToken === sessionToken);
    if (user) {
      user.sessionToken = null;
    }
    this.refreshSessions.delete(sessionToken);
  }

  changePassword(sessionToken: string, currentPassword: string, nextPassword: string): void {
    const user = this.users.find((item) => item.sessionToken === sessionToken);
    if (!user || user.password !== currentPassword) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    user.password = nextPassword;
    user.lastActive = new Date().toISOString();
  }

  getMovies(search?: string, categoryIds?: string[], includeDrafts = false, page = 1, pageSize = 12): PaginatedResponse<Movie> {
    const filtered = this.movies.filter((movie) => {
      if (!includeDrafts && movie.status !== 'published') {
        return false;
      }
      if (search && !movie.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (categoryIds?.length && !categoryIds.every((id) => movie.categories.includes(id))) {
        return false;
      }
      return true;
    });

    return this.paginate(filtered, page, pageSize);
  }

  getMovieById(id: string): Movie | undefined {
    return this.movies.find((movie) => movie.id === id);
  }

  getCategories(page = 1, pageSize = 50): PaginatedResponse<Category & { movieCount: number }> {
    const items = this.categories.map((category) => ({
      ...category,
      movieCount: this.movies.filter((movie) => movie.categories.includes(category.id)).length,
    }));

    return this.paginate(items, page, pageSize);
  }

  buyTicket(userId: string, movieId: string): PurchaseResult {
    const ticket: Ticket = { id: createId('ticket'), userId, movieId, purchasedAt: new Date().toISOString() };
    this.tickets.unshift(ticket);
    const movie = this.movies.find((item) => item.id === movieId);
    const user = this.users.find((item) => item.id === userId);
    if (movie && user) {
      this.activity.unshift({
        id: createId('act'),
        type: 'purchase',
        title: `Ticket purchased for ${movie.title}`,
        meta: user.displayName,
        createdAt: new Date().toISOString(),
      });
    }
    return this.entitlements(userId);
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
    this.plans = [plan, ...this.plans.filter((item) => item.userId !== userId)];
    this.users = this.users.map((user) => (user.id === userId ? { ...user, plan: 'unlimited', planExpiresAt: plan.expiresAt } : user));
    return this.entitlements(userId);
  }

  listUsers(page = 1, pageSize = 10): PaginatedResponse<Omit<User, 'password'>> {
    const users = this.users.map((user) => this.getSanitizedUser(user));
    return this.paginate(users, page, pageSize);
  }

  revokeSession(userId: string): void {
    const user = this.users.find((item) => item.id === userId);
    if (user?.sessionToken) {
      this.refreshSessions.delete(user.sessionToken);
    }
    this.users = this.users.map((item) => (item.id === userId ? { ...item, sessionToken: null } : item));
  }

  toggleUserStatus(userId: string): void {
    this.users = this.users.map((user) =>
      user.id === userId ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' } : user,
    );
  }

  getPlanConfig(): PlanConfig {
    return this.planConfig;
  }

  defaultVideoUrl(): string {
    return defaultVideoUrl;
  }

  updatePlanConfig(config: PlanConfig): PlanConfig {
    this.planConfig = config;
    return this.planConfig;
  }

  upsertMovie(movie: Partial<Movie> & Pick<Movie, 'title'>): Movie {
    const nextMovie: Movie = {
      id: movie.id ?? createId('movie'),
      imdbId: movie.imdbId?.trim() || undefined,
      title: movie.title,
      description: movie.description ?? '',
      posterUrl: movie.posterUrl ?? posterPlaceholder(movie.title),
      videoUrl: movie.videoUrl ?? defaultVideoUrl,
      year: movie.year ?? now.getUTCFullYear(),
      duration: movie.duration ?? 100,
      director: movie.director ?? '',
      cast: movie.cast ?? [],
      categories: movie.categories ?? [],
      rating: movie.rating ?? 0,
      ticketPrice: movie.ticketPrice ?? this.planConfig.defaultTicketPrice,
      status: movie.status ?? 'draft',
      featured: movie.featured ?? false,
    };
    const existing = this.movies.find((item) => item.id === nextMovie.id);
    this.movies = existing ? this.movies.map((item) => (item.id === nextMovie.id ? { ...existing, ...nextMovie } : item)) : [nextMovie, ...this.movies];
    return nextMovie;
  }

  deleteMovie(movieId: string): void {
    this.movies = this.movies.filter((movie) => movie.id !== movieId);
    this.tickets = this.tickets.filter((ticket) => ticket.movieId !== movieId);
  }

  upsertCategory(category: Partial<Category> & Pick<Category, 'name'>): Category {
    const nextCategory: Category = {
      id: category.id ?? createId('category'),
      name: category.name,
      slug: category.slug ?? slugify(category.name),
      description: category.description,
      color: category.color || '#4f46e5',
      icon: category.icon,
      deletedAt: null,
    };
    const existing = this.categories.find((item) => item.id === nextCategory.id);
    this.categories = existing
      ? this.categories.map((item) => (item.id === nextCategory.id ? { ...existing, ...nextCategory } : item))
      : [nextCategory, ...this.categories];
    return nextCategory;
  }

  deleteCategory(categoryId: string): { softDeleted: boolean } {
    const linked = this.movies.some((movie) => movie.categories.includes(categoryId));
    if (linked) {
      this.categories = this.categories.map((category) =>
        category.id === categoryId ? { ...category, deletedAt: new Date().toISOString() } : category,
      );
      return { softDeleted: true };
    }
    this.categories = this.categories.filter((category) => category.id !== categoryId);
    return { softDeleted: false };
  }

  analytics(): AnalyticsSummary {
    const activeSubscriptions = this.plans.filter((plan) => plan.status === 'active').length;
    const totalRevenue =
      this.tickets.reduce((sum, ticket) => {
        const movie = this.movies.find((item) => item.id === ticket.movieId);
        return sum + (movie?.ticketPrice ?? this.planConfig.defaultTicketPrice);
      }, 0) + activeSubscriptions * this.planConfig.unlimitedMonthlyPrice;

    return {
      totalUsers: this.users.filter((user) => user.role === 'user').length,
      activeSubscriptions,
      totalTicketsSold: this.tickets.length,
      totalRevenue,
      signupSeries: [
        { label: 'W1', value: 4 },
        { label: 'W2', value: 7 },
        { label: 'W3', value: 5 },
        { label: 'W4', value: 9 },
      ],
      recentActivity: this.activity.slice(0, 10),
    };
  }

  normalizeCast(value: string[] | string): string[] {
    return Array.isArray(value) ? value : uniqueStrings(value.split(','));
  }

  matchCategoryIds(genres: string[]): string[] {
    const genreMap: Record<string, string> = {
      action: 'cat-action',
      adventure: 'cat-adventure',
      animation: 'cat-animation',
      crime: 'cat-crime',
      drama: 'cat-drama',
      fantasy: 'cat-fantasy',
      'science fiction': 'cat-sci-fi',
      'sci-fi': 'cat-sci-fi',
      thriller: 'cat-thriller',
    };

    return uniqueStrings(
      genres
        .map((genre) => genreMap[genre.trim().toLowerCase()])
        .filter((value): value is string => Boolean(value)),
    );
  }

  private entitlements(userId: string): PurchaseResult {
    return {
      tickets: this.tickets.filter((ticket) => ticket.userId === userId),
      activePlan: this.plans.find((plan) => plan.userId === userId && plan.status === 'active') ?? null,
    };
  }

  private createSession(user: User): AuthSession {
    return {
      user: this.getSanitizedUser(user),
      tickets: this.tickets.filter((ticket) => ticket.userId === user.id),
      activePlan: this.plans.find((plan) => plan.userId === user.id && plan.status === 'active') ?? null,
      session: {
        sessionToken: user.sessionToken!,
        lastValidatedAt: new Date().toISOString(),
      },
    };
  }

  private paginate<T>(items: T[], page = 1, pageSize = 12): PaginatedResponse<T> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const start = (safePage - 1) * safePageSize;

    return {
      items: items.slice(start, start + safePageSize),
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages,
    };
  }
}
