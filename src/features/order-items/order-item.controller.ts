import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from "@nestjs/common";
import { OrderItemService } from "./order-item.service";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { PageDto, PageOptionsRequestDto } from "../../shared/dto";
import { ParseObjectIdPipe } from "src/pipes/parse-object-id.pipe";
import { UpdatedResponseInterface } from "../../shared/interfaces";
import { OrderItemDetailsDto } from "./dto/order-item-details.dto";
import { IOrderItem } from "./interfaces/order-item.interface";

@Controller('order-items')
export class OrderItemController {
    constructor(private orderItemService: OrderItemService){}

    @Post('')
    @ApiOperation({ description: 'Add Order'})
    @ApiResponse({ status: 200, description: 'Order added successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    async addOrder(
        @Body() body: CreateOrderItemDto
    ): Promise<any> {
        return this.orderItemService.createOrderItem(body)
    }

    @Post('fetch')
    @ApiOperation({ description: 'Fetch Orders'})
    @ApiResponse({ status: 200, description: 'Orders fetched successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiQuery({ name: 'sort_field', type: String, required: false })
    @ApiQuery({ name: 'sort_order', type: String, required: false })
    fetchOrders(
        @Query() queryParams: PageOptionsRequestDto,
        @Body() payload: OrderItemDetailsDto
    ): Promise<PageDto<IOrderItem[]>> {
        return this.orderItemService.fetchAllOrderItems(queryParams, payload)
    }

    @Get(':id')
    @ApiOperation({ description: 'Fetch Order details'})
    @ApiResponse({ status: 200, description: 'Order details fetched successfully'})
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Order Id'})
    async fetchOrderDetails(
        @Param('id', ParseObjectIdPipe) id: string
    ): Promise<IOrderItem> {
        const orderItem = await this.orderItemService.fetchOrderItemDetails(id);
        if(!orderItem) throw new NotFoundException(`Order with id ${id} not found`);
        return orderItem
    }

    @Put(':id')
    @ApiOperation({ description: 'Update Order details'})
    @ApiResponse({ status: 200, description: 'Order details updated successfully'})
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Order Id'})
    async updateOrderDetails(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() orderInput: OrderItemDetailsDto
     ): Promise<IOrderItem> {
        const orderItem = await this.orderItemService.updateOrderItem(id, orderInput);
        if(!orderItem) throw new NotFoundException(`Order with id ${id} not found`);
        return orderItem
    }

    
    @Delete(':id')
    @ApiOperation({ description: 'Delete Order details'})
    @ApiResponse({ status: 200, description: 'Order details deleted successfully'})
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Order Id'})
    async deleteOrderDetails(
        @Param('id', ParseObjectIdPipe) id: string
     ): Promise<UpdatedResponseInterface> {
        const deletedResult = await this.orderItemService.deleteOrderItem(id);
        if (deletedResult.matchedCount && deletedResult.matchedCount !== 1) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        if (deletedResult.modifiedCount && deletedResult.modifiedCount !== 1) {
            throw new Error(`Error occured in deleting Order item`);
        }
        return deletedResult
    }
}
