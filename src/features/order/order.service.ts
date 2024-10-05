import { InjectModel } from "@nestjs/mongoose";
import { PageDto, PageOptionsRequestDto, PagePaginationDto } from "../../shared/dto";
import { IOrder } from "./interfaces/order.interface";
import { Order, OrderDocument } from "./schema/order.schema";
import { Model, Types } from "mongoose";
import { CustomPopulateOptionsInterface, SortOrder, UpdatedResponseInterface } from "../../shared/interfaces";
import { AddressService } from "../address/address.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderItemService } from "../order-items/order-item.service";
import { HttpException, HttpStatus } from "@nestjs/common";

export class OrderService {
    constructor(
        @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
        private readonly orderItemService: OrderItemService
    ) {}

    async fetchAllOrders(pageOptionsRequestDto: PageOptionsRequestDto, orderDetails: IOrder): Promise<PageDto<IOrder[]>> {
        
        try {
            let query: any = {
                'deleted_dt': null
            };
            const {
                page,
                limit = 10,
                sort_field = 'created_dt',
                sort_order = SortOrder.Ascending,
            } = pageOptionsRequestDto;

            const {  user_id, status } = orderDetails;

            if(user_id) query['user_id'] = user_id;
            if(status) query['status'] = status;

            const totalRecords = (await this.model.find(query).exec()).length;

            const orderPagination = new PagePaginationDto({pageOptionsRequestDto, totalRecords});

            const sortCriteria: Record<string, 1 | -1 > = { [sort_field] : sort_order.toLowerCase() === SortOrder.Ascending ? 1 : -1 };
            
            const orderResponse: OrderDocument[] = await this.model.find(query)
                                                    .sort(sortCriteria)
                                                    .skip(PageOptionsRequestDto.skip(page, limit))
                                                    .limit(limit)
            return new PageDto<OrderDocument[]>(orderResponse, orderPagination)
        } catch(err) {
            console.log(`Error fetching orders`)
            return Promise.reject(err)
        }
        
    }

    async fetchOrderDetails(id: string | Types.ObjectId): Promise<OrderDocument | null> {
        try {
            const query: any = {
                '_id': id,
                'deleted_dt': null,
            }
            return await this.model
                .findOne(query)
                .lean()
                .exec()
        } catch(error) {
            console.log(`Error fetching order`)
            return Promise.reject(error)
        }
    }

    async createOrder(order: CreateOrderDto): Promise<any> {
        try {
            order.user_id = new Types.ObjectId(order.user_id);
            let orderDocument : OrderDocument = new this.model(order)
            const savedOrder: OrderDocument = await orderDocument.save();
            let newOrder = orderDocument.toJSON();

            if (order.orderItems) {
                try {
                    order.orderItems.forEach((orderItem: any) => {
                        orderItem['order_id'] = newOrder._id;
                        orderItem['product_id'] = new Types.ObjectId(orderItem.product_id);
                    })
                    await this.orderItemService.createOrderItems(order.orderItems);
                    
                } catch (error) {
                    // Rollback user creation if address creation fails
                    await this.model.findByIdAndDelete(newOrder._id);
                    throw new HttpException("Failed to create order items. order creation rolled back.", HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            return savedOrder;
        } catch(error) {
            console.log(`Error creating order`)
            return Promise.reject(error)
        }
    }   

    async updateOrder(id: Types.ObjectId | string, order: IOrder): Promise<OrderDocument> {
        try {
            let query: any = {
                '_id': id,
                '$or': [
                    {
                        'deleted_dt': null,
                    },
                    {
                        'deleted_dt': {
                            '$exists': false
                        },
                    }
                ]
                
            };

            order.modified_dt = new Date().toISOString();

            return await this.model.findOneAndUpdate(query, { $set: order}, { new: true}).exec();
        } catch(error) {
            console.log(`Error updating order`)
            return Promise.reject(error)
        }
    }

    async deleteOrder(id: Types.ObjectId | string): Promise<UpdatedResponseInterface> {
        try {
            let query: any = {
                '_id': id,
                '$or': [
                    {'deleted_dt': {
                        '$exists': false
                    }},
                    {'deleted_dt': null }
                ]
            }
    
            return await this.model.updateOne(query, { $set: {'deleted_dt': new Date().toISOString()}}).exec();
        } catch(error) {
            console.log(`Error deleting order`)
            return Promise.reject(error)
        }
    }
}