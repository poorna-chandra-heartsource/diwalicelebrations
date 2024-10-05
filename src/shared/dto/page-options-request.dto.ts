import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SortOrder } from '../interfaces/sort-order.enum';


export class PageOptionsRequestDto {
  @ApiProperty({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @ApiProperty({ minimum: 1, maximum: 200, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  readonly limit: number = 10;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  readonly sort_field?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsEnum(SortOrder)
  readonly sort_order?: SortOrder;

  public static skip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
