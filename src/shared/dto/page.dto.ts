import { ApiProperty } from '@nestjs/swagger';
import { PagePaginationDto } from './page-pagination.dto';

export class PageDto<T> {
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PagePaginationDto })
  readonly pagination: PagePaginationDto;

  constructor(data: T | T[], pagination: PagePaginationDto) {
    this.data = Array.isArray(data) ? data : [data];
    this.pagination = pagination;
  }
}
