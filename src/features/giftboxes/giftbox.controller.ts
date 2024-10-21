import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { GiftBoxService } from "./giftbox.service";
import { IGiftBox } from "./interfaces/giftbox.interface";
import { ParseObjectIdPipe } from "src/pipes/parse-object-id.pipe";

@Controller('/api/giftbox')
export class GiftBoxController {
    constructor(
        private giftboxService: GiftBoxService
    ) {}

    @Get('')
    @ApiOperation({ description: 'Fetch GiftBox details'})
    @ApiResponse({ status: 200, description: 'GiftBox details fetched successfully'})
    @ApiResponse({ status: 404, description: 'GiftBox not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiQuery({ name: 'name', type: String, description: 'GiftBox name'})
    async fetchGiftBoxDetails(
        @Query('name') name: string
    ): Promise<IGiftBox> {
        const giftbox = await this.giftboxService.fetchGiftBoxDetails(name);
        if(!giftbox) throw new NotFoundException(`GiftBox with name ${name} not found`);
        return giftbox
    }
}