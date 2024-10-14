import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GiftBoxDto {
    @ApiProperty({ description: 'Name of the giftbox' })
    @IsString()
    @IsOptional()
    name?: string;
}