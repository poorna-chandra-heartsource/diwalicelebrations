import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { IAddress } from "./interfaces/adress.interface";
import { AddressService } from "./address.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { ParseObjectIdPipe } from "src/pipes/parse-object-id.pipe";
import { AddressDetailsDto } from "./dto/address-details.dto";
import { PageDto, PageOptionsRequestDto } from "../../shared/dto";

@Controller('address')
export class AddressController {
    constructor(
        private readonly addressService: AddressService
    ) {}

    @Post('')
    @ApiOperation({ description: 'Add Address details'})
    @ApiResponse({ status: 200, description: 'Address added successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    async createAddress(@Body() payload: CreateAddressDto): Promise<IAddress> {
        return await this.addressService.addUserAddress(payload)
    }

    @Post('fetch')
    @ApiOperation({ description: 'Fetch all address'})
    @ApiResponse({ status: 200, description: 'Address fetched successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiQuery({ name: 'sort_field', type: String, required: false })
    @ApiQuery({ name: 'sort_order', type: String, required: false })
    fetchAllAddress(
        @Query() queryParams: PageOptionsRequestDto,
        @Body() payload: AddressDetailsDto
    ): Promise<PageDto<IAddress[]>> {
        return this.addressService.fetchAllAddress(queryParams, payload)
    }

    @Get(':id')
    @ApiOperation({ description : "Fetch address details" })
    @ApiResponse({ status: 200, description: 'Address fetched successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Address Id'})
    async fetchAddressDetails(
        @Param('id', ParseObjectIdPipe) id: string
        ): Promise<IAddress | Record<string, unknown>> {
        const address = await this.addressService.fetchAddressDetails(id);
        if(!address) throw new NotFoundException(`Address not found`);
        return address;
    }

    @Put('')
    @ApiOperation({ description : "Update address details" })
    @ApiResponse({ status: 200, description: 'Address updated successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiQuery({ name: 'user_id', type: String, description: 'User Id'})
    async updateAddress(
        @Query('user_id', ParseObjectIdPipe) user_id: string, 
        @Body() body: AddressDetailsDto): Promise<IAddress | Record<string, unknown>> {
        const address = await this.addressService.updateUserAddress(user_id, body);
        if(!address) throw new NotFoundException(`Address not found`);
        return address;
    }

    @Delete('')
    @ApiOperation({ description : "Delete address details" })
    @ApiResponse({ status: 200, description: 'Address deleted successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiQuery({ name: 'user_id', type: String, description: 'User Id'})
    async deleteAddress(
        @Query('user_id', ParseObjectIdPipe) user_id: string
    ) {
        const address = await this.addressService.deleteAddress(user_id);
        if(!address) throw new NotFoundException(`Address not found`);
        return address;
    }

}