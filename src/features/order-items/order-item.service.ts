import { InjectModel } from "@nestjs/mongoose";
import { PageDto, PageOptionsRequestDto, PagePaginationDto } from "../../shared/dto";
import { IOrderItem } from "./interfaces/order-item.interface";
import { OrderItem, OrderItemDocument } from "./schema/order-item.schema";
import { Model, Types } from "mongoose";
import { CustomPopulateOptionsInterface, SortOrder, UpdatedResponseInterface } from "../../shared/interfaces";
import { AddressService } from "../address/address.service";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";

export class OrderItemService {
    constructor(
        @InjectModel(OrderItem.name) private readonly model: Model<OrderItemDocument>
    ) {}

    async fetchAllOrderItems(pageOptionsRequestDto: PageOptionsRequestDto, OrderItemDetails: IOrderItem): Promise<PageDto<IOrderItem[]>> {
        
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

            const {  order_id } = OrderItemDetails;

            if(order_id) query['order_id'] = Types.ObjectId.isValid(order_id) ? order_id : new Types.ObjectId(order_id);

            const totalRecords = (await this.model.find(query).exec()).length;

            const orderPagination = new PagePaginationDto({pageOptionsRequestDto, totalRecords});

            const sortCriteria: Record<string, 1 | -1 > = { [sort_field] : sort_order.toLowerCase() === SortOrder.Ascending ? 1 : -1 };
            
            const orderResponse: OrderItemDocument[] = await this.model.find(query)
                                                    .sort(sortCriteria)
                                                    .skip(PageOptionsRequestDto.skip(page, limit))
                                                    .limit(limit)
            return new PageDto<OrderItemDocument[]>(orderResponse, orderPagination)
        } catch(err) {
            console.log(`Error fetching order items`)
            return Promise.reject(err)
        }
        
    }

    async fetchOrderItemDetails(id: string | Types.ObjectId): Promise<OrderItemDocument | null> {
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
            console.log(`Error fetching order item`)
            return Promise.reject(error)
        }
    }

    async createOrderItem(order: CreateOrderItemDto): Promise<any> {
        try {
            let orderDocument : OrderItemDocument = new this.model(order)
            await orderDocument.save();
            return orderDocument.toJSON();
        } catch(error) {
            console.log(`Error creating order item`)
            return Promise.reject(error)
        }
    }   

    async createOrderItems(orderItems: CreateOrderItemDto[]): Promise<any> {
        try {
            await this.model.insertMany(orderItems);
        } catch(error) {
            console.log(`Error creating order items`)
            return Promise.reject(error)
        }
    }   

    async updateOrderItem(id: Types.ObjectId | string, order: IOrderItem): Promise<OrderItemDocument> {
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
            console.log(`Error updating order item`)
            return Promise.reject(error)
        }
    }

    async deleteOrderItem(id: Types.ObjectId | string): Promise<UpdatedResponseInterface> {
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
            console.log(`Error deleting order item`)
            return Promise.reject(error)
        }
    }
}