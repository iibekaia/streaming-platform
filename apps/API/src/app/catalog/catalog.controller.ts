import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BackendStore } from '../backend.store';
import { MoviesQueryDto, SaveCategoryDto, SaveMovieDto } from './catalog.dto';
import { AdminGuard } from '../auth/admin.guard';
import { SessionGuard } from '../auth/session.guard';
import { OmdbService } from './omdb.service';

@Controller()
export class CatalogController {
  constructor(
    private readonly store: BackendStore,
    private readonly omdbService: OmdbService,
  ) {}

  @Get('movies')
  listMovies(@Query() query: MoviesQueryDto) {
    return this.store.getMovies(query.search, query.categoryIds, query.includeDrafts === 'true');
  }

  @Get('movies/:id')
  getMovie(@Param('id') id: string) {
    return this.store.getMovieById(id);
  }

  @Get('categories')
  listCategories() {
    return this.store.getCategories();
  }

  @UseGuards(SessionGuard, AdminGuard)
  @Post('admin/movies')
  createMovie(@Body() dto: SaveMovieDto) {
    return this.store.upsertMovie(dto);
  }

  @UseGuards(SessionGuard, AdminGuard)
  @Put('admin/movies/:id')
  updateMovie(@Param('id') id: string, @Body() dto: SaveMovieDto) {
    return this.store.upsertMovie({ ...dto, id });
  }

  @UseGuards(SessionGuard, AdminGuard)
  @Delete('admin/movies/:id')
  deleteMovie(@Param('id') id: string) {
    this.store.deleteMovie(id);
    return { ok: true };
  }

  @UseGuards(SessionGuard, AdminGuard)
  @Get('admin/movies/import/imdb/:imdbId')
  importMovie(@Param('imdbId') imdbId: string) {
    return this.omdbService.importMovie(imdbId);
  }

  @UseGuards(SessionGuard, AdminGuard)
  @Post('admin/categories')
  createCategory(@Body() dto: SaveCategoryDto) {
    return this.store.upsertCategory(dto);
  }

  @UseGuards(SessionGuard, AdminGuard)
  @Put('admin/categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: SaveCategoryDto) {
    return this.store.upsertCategory({ ...dto, id });
  }

  @UseGuards(SessionGuard, AdminGuard)
  @Delete('admin/categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.store.deleteCategory(id);
  }
}
