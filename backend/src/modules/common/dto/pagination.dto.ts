import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  page?: number;
  @Min(1)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  limit?: number;
  constructor() {
    this.page = 1;
    this.limit = 10;
  }
}
