import { BadGatewayException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Movie } from '@streaming-platform/data-models';
import { slugify } from '@streaming-platform/utils';
import { BackendStore } from '../backend.store';

interface OmdbMovieResponse {
  Response: 'True' | 'False';
  Error?: string;
  Title?: string;
  Year?: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID?: string;
  Type?: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
}

@Injectable()
export class OmdbService {
  constructor(
    private readonly config: ConfigService,
    private readonly store: BackendStore,
  ) {}

  async importMovie(imdbId: string): Promise<Partial<Movie> & Pick<Movie, 'title'>> {
    const apiKey = this.config.get<string>('OMDB_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('OMDB_API_KEY is not configured for the API app.');
    }

    const url = new URL('https://www.omdbapi.com/');
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('i', imdbId.trim());
    url.searchParams.set('plot', 'short');

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadGatewayException('Failed to fetch movie details from OMDb.');
    }

    const payload = (await response.json()) as OmdbMovieResponse;
    if (payload.Response !== 'True' || !payload.Title) {
      throw new NotFoundException(payload.Error ?? 'Movie not found in OMDb.');
    }

    return {
      imdbId: payload.imdbID,
      title: payload.Title,
      description: payload.Plot && payload.Plot !== 'N/A' ? payload.Plot : '',
      posterUrl: payload.Poster && payload.Poster !== 'N/A' ? payload.Poster : this.posterPlaceholder(payload.Title),
      videoUrl: this.store.defaultVideoUrl(),
      year: this.parseYear(payload.Year),
      duration: this.parseDuration(payload.Runtime),
      director: payload.Director && payload.Director !== 'N/A' ? payload.Director : '',
      cast: this.parseList(payload.Actors),
      categories: this.store.matchCategoryIds(this.parseList(payload.Genre)),
      rating: this.parseRating(payload.imdbRating),
      ticketPrice: this.store.getPlanConfig().defaultTicketPrice,
      status: 'draft',
    };
  }

  private parseYear(value?: string): number {
    const match = value?.match(/\d{4}/);
    return match ? Number(match[0]) : new Date().getUTCFullYear();
  }

  private parseDuration(value?: string): number {
    const match = value?.match(/\d+/);
    return match ? Number(match[0]) : 100;
  }

  private parseRating(value?: string): number {
    const rating = Number.parseFloat(value ?? '');
    return Number.isFinite(rating) ? rating : 0;
  }

  private parseList(value?: string): string[] {
    if (!value || value === 'N/A') {
      return [];
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private posterPlaceholder(title: string): string {
    return `https://placehold.co/600x900/0f172a/f8fafc?text=${encodeURIComponent(slugify(title).replace(/-/g, ' '))}`;
  }
}
