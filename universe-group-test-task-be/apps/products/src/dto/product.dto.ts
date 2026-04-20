import { IsString, IsNotEmpty, IsNumber, IsPositive, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;
}

export class PaginationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;
}
