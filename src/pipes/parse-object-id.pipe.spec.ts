import { BadRequestException } from '@nestjs/common';
import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe Suite', () => {
  it('should return a valid object id', () => {
    const id = '6536e39b09c8420054853bce';
    const oid = new ParseObjectIdPipe().transform(id);
    expect(oid.toString()).toBe(id);
  });

  it('should throw an exception when input is not valid', () => {
    const pipe = new ParseObjectIdPipe();
    expect(() => pipe.transform('foo bar')).toThrow(BadRequestException);
  });
});
