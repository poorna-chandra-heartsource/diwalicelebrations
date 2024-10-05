import { ApiProperty } from '@nestjs/swagger';
import { PagePaginationParametersInterface } from '../interfaces';

export class PagePaginationDto {
  @ApiProperty()
  readonly totalRecords: number;

  @ApiProperty()
  readonly totalPages: number;

  @ApiProperty()
  readonly previousPage: number;

  @ApiProperty()
  readonly currentPage: number;

  @ApiProperty()
  readonly nextPage: number;

  constructor({
    pageOptionsRequestDto,
    totalRecords,
  }: PagePaginationParametersInterface) {
    this.totalRecords = totalRecords;
    this.totalPages = Math.ceil(
      this.totalRecords / pageOptionsRequestDto.limit,
    );
    this.currentPage = pageOptionsRequestDto.page * 1;
    this.previousPage = this.currentPage > 1 ? this.currentPage - 1 : null;
    this.nextPage =
      this.currentPage < this.totalPages ? this.currentPage + 1 : null;
  }
}
