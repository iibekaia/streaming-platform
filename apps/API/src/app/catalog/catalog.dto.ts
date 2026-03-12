import { IsArray, IsBooleanString, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Movie } from '@streaming-platform/data-models';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class MoviesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').filter(Boolean) : []))
  categoryIds?: string[];

  @IsOptional()
  @IsBooleanString()
  includeDrafts?: string;
}

export class SaveMovieDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  imdbId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @Type(() => Number)
  @IsInt()
  year!: number;

  @Type(() => Number)
  @IsInt()
  duration!: number;

  @IsOptional()
  @IsString()
  director?: string;

  @IsArray()
  cast!: string[];

  @IsArray()
  categories!: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  rating!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ticketPrice!: number;

  @IsIn(['draft', 'published'])
  status!: Movie['status'];
}

export class SaveCategoryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
