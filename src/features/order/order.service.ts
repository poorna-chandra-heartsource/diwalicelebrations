import { InjectModel } from "@nestjs/mongoose";
import { PageDto, PageOptionsRequestDto, PagePaginationDto } from "../../shared/dto";
import { IOrder } from "./interfaces/order.interface";
import { Order, OrderDocument } from "./schema/order.schema";
import { Model, Types } from "mongoose";
import { CustomPopulateOptionsInterface, SortOrder, UpdatedResponseInterface } from "../../shared/interfaces";
import { AddressService } from "../address/address.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderItemService } from "../order-items/order-item.service";
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { NotificationService } from "src/shared/api-services/notification.service";
import { UserService } from "../user/user.service";
import { UserDocument } from "../user/schema/user.schema";

@Injectable({})
export class OrderService {
    constructor(
        @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
        private readonly orderItemService: OrderItemService,
        private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService // Use forwardRef here
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

            if(user_id) query['user_id'] = new Types.ObjectId(user_id);
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
            const orderId = typeof id === 'string' ? new Types.ObjectId(id) : id;
    
            const aggregate: any = [
                {
                    $match: {
                        '_id': orderId,
                        'deleted_dt': null,
                    }
                },
                {
                    $lookup: {
                        from: 'order-items',
                        localField: '_id',
                        foreignField: 'order_id',
                        as: 'orderItems'
                    }
                },
                {
                    $unwind: '$orderItems'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'orderItems.product_id',
                        foreignField: '_id',
                        as: 'productInfo'
                    }
                },
                {
                    $unwind: '$productInfo'
                },
                {
                    $addFields: {
                        'orderItems.productName': '$productInfo.name'  // Add the product name to orderItems
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        user_id: { $first: '$user_id' },
                        total_price: { $first: '$total_price' },
                        status: { $first: '$status' },
                        created_dt: { $first: '$created_dt' },
                        orderItems: { $push: '$orderItems' }
                    }
                },
                {
                    $project: {
                        'orderItems.product_id': 1, // Keep other orderItem fields
                        'orderItems.productName': 1,  // Keep the added product name
                        'orderItems.price': 1,
                        'orderItems.quantity': 1,
                        'orderItems.created_dt': 1,
                        user_id: 1,
                        total_price: 1,
                        status: 1,
                        created_dt: 1
                    }
                }
            ];
    
            let orderDetails = await this.model
                .aggregate(aggregate)
                .exec();
    
            return orderDetails.length > 0 ? orderDetails[0] : null;
        } catch (error) {
            console.log(`Error fetching order`, error);
            return Promise.reject(error);
        }
    }
    
    

    // bNotify is a boolean check to stop calling notificationService twice when this method is called from user service
    async createOrder(user_id: string | Types.ObjectId, order: CreateOrderDto, bNotify: boolean): Promise<any> {
        try {
            let user: any = await this.userService.fetchUserDetails(user_id);
            order.user_id = new Types.ObjectId(user_id);
            let orderDocument : OrderDocument = new this.model(order)
            await orderDocument.save();
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
            if(bNotify) {
                user['address'] = user?.user_address[0];
                user['order'] = order;
                delete user.user_address;
                await this.notificationService.userCreationNOrderConfirmationMail(user, false)
            } 
            return {
                "success": true,
                "data":"Order created successfully"
            };
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