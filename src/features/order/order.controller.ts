import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Req, Request, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { PageDto, PageOptionsRequestDto } from "../../shared/dto";
import { ParseObjectIdPipe } from "src/pipes/parse-object-id.pipe";
import { UpdatedResponseInterface } from "../../shared/interfaces";
import { OrderDetailsDto } from "./dto/order-details.dto";
import { IOrder } from "./interfaces/order.interface";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller('orders')
export class OrderController {
    constructor(private orderService: OrderService){}

    @UseGuards(JwtAuthGuard)
    @Post('')
    @ApiOperation({ description: 'Add Order'})
    @ApiResponse({ status: 200, description: 'Order added successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    async addOrder(
        @Req() req: any,
        @Body() body: CreateOrderDto,
    ): Promise<any> {
        const user = req.user; // Access the authenticated user data
        return this.orderService.createOrder(user.userId, body, true)
    }

    @UseGuards(JwtAuthGuard) 
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
        @Body() payload: OrderDetailsDto,
        @Req() req: any
    ): Promise<PageDto<IOrder[]>> {
        const user = req.user;
        return this.orderService.fetchAllOrders(user.userId, queryParams, payload)
    }

    @UseGuards(JwtAuthGuard) 
    @Get(':id')
    @ApiOperation({ description: 'Fetch Order details'})
    @ApiResponse({ status: 200, description: 'Order details fetched successfully'})
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Order Id'})
    async fetchOrderDetails(
        @Param('id', ParseObjectIdPipe) id: string,
    ): Promise<IOrder> {
        const order = await this.orderService.fetchOrderDetails(id);
        if(!order) throw new NotFoundException(`Order with id ${id} not found`);
        return order
    }

    @UseGuards(JwtAuthGuard) 
    @Put(':id')
    @ApiOperation({ description: 'Update Order details'})
    @ApiResponse({ status: 200, description: 'Order details updated successfully'})
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Order Id'})
    async updateOrderDetails(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() orderInput: OrderDetailsDto
     ): Promise<IOrder> {
        const order = await this.orderService.updateOrder(id, orderInput);
        if(!order) throw new NotFoundException(`Order with id ${id} not found`);
        return order
    }

    @UseGuards(JwtAuthGuard) 
    @Delete(':id')
    @ApiOperation({ description: 'Delete Order details'})
    @ApiResponse({ status: 200, description: 'Order details deleted successfully'})
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Order Id'})
    async deleteOrderDetails(
        @Param('id', ParseObjectIdPipe) id: string
     ): Promise<UpdatedResponseInterface> {
        const deletedResult = await this.orderService.deleteOrder(id);
        if (deletedResult.matchedCount && deletedResult.matchedCount !== 1) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        if (deletedResult.modifiedCount && deletedResult.modifiedCount !== 1) {
            throw new Error(`Error occured in deleting Order`);
        }
        return deletedResult
    }
}
