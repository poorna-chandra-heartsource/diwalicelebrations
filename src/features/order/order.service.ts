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
import { decrypt } from '../../shared/util';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { Response } from 'express'; 

@Injectable({})
export class OrderService {
    constructor(
        @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
        private readonly orderItemService: OrderItemService,
        private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService // Use forwardRef here
    ) {}

    async fetchAllOrders(user_id:string | Types.ObjectId, pageOptionsRequestDto: PageOptionsRequestDto, orderDetails: IOrder): Promise<PageDto<IOrder[]>> {
        
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

            const {  total_price } = orderDetails;

            if(user_id) query['user_id'] = new Types.ObjectId(user_id);
            if(total_price) query['total_price'] = total_price;

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

    async listOrders(start_dt: Date, end_dt: Date): Promise<any> {
        try {
            // Convert the input strings to valid Date objects
            let query: any = {
                "created_dt": { $gte: start_dt, $lte: end_dt }
            };
            const aggregate: any = [
                {
                    $match: query
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
                    $lookup: {
                        from: 'users',  // Lookup user details
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: '$userDetails'  // Unwind the user details
                },
                {
                    $lookup: {
                        from: 'address',  // Lookup address details
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'addressDetails'
                    }
                },
                {
                    $unwind: { path: '$addressDetails', preserveNullAndEmptyArrays: true } // Unwind address details (optional)
                },
                {
                    $group: {
                        _id: '$_id',
                        user_id: { $first: '$user_id' },
                        total_price: { $first: '$total_price' },
                        created_dt: { $first: '$created_dt' },
                        orderItems: { $push: '$orderItems' },
                        userDetails: { $first: '$userDetails' },
                        addressDetails: { $first: '$addressDetails' }
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
                        created_dt: 1,
                        'userDetails.full_name': 1,  // Keep the user's full name
                        'userDetails.email': 1,  // Keep the user's email
                        'userDetails.mobile': 1,  // Keep the user's mobile
                        'addressDetails.city': 1,  // Keep the address details
                        'addressDetails.state': 1,
                        'addressDetails.pincode': 1,
                        'addressDetails.addressLine1': 1,
                        'addressDetails.addressLine2': 1,
                        'addressDetails.landmark': 1
                    }
                }
            ];
    
            let orderDetails = await this.model.aggregate(aggregate).exec();
    
            // Decrypt the user and address details
            orderDetails = orderDetails.map(order => {
                order.userDetails.full_name = decrypt(order.userDetails.full_name);
                order.userDetails.email = decrypt(order.userDetails.email);
                order.userDetails.mobile = decrypt(order.userDetails.mobile);
    
                if (order.addressDetails) {
                    order.addressDetails.city = decrypt(order.addressDetails.city);
                    order.addressDetails.state = decrypt(order.addressDetails.state);
                    order.addressDetails.pincode = decrypt(order.addressDetails.pincode);
                    order.addressDetails.addressLine1 = decrypt(order.addressDetails.addressLine1);
                    if (order.addressDetails.addressLine2) {
                        order.addressDetails.addressLine2 = decrypt(order.addressDetails.addressLine2);
                    }
                    if (order.addressDetails.landmark) {
                        order.addressDetails.landmark = decrypt(order.addressDetails.landmark);
                    }
                }
    
                return order;
            });
    
            return orderDetails.length > 0 ? orderDetails : null;
        } catch (err) {
            console.log(`Error fetching orders: ${err}`);
            return Promise.reject(err);
        }
    }
    
    async listOrdersAndGeneratePDF(start_dt: Date, end_dt: Date, res: Response): Promise<void> {
        try {
            // Aggregate query to fetch orders
            let query: any = {
                "created_dt": { $gte: start_dt, $lte: end_dt }
            };
    
            const aggregate: any = [
                { $match: query },
                {
                    $lookup: {
                        from: 'order-items',
                        localField: '_id',
                        foreignField: 'order_id',
                        as: 'orderItems'
                    }
                },
                { $unwind: '$orderItems' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'orderItems.product_id',
                        foreignField: '_id',
                        as: 'productInfo'
                    }
                },
                { $unwind: '$productInfo' },
                {
                    $addFields: {
                        'orderItems.productName': '$productInfo.name'  // Add the product name to orderItems
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $lookup: {
                        from: 'address',
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'addressDetails'
                    }
                },
                { $unwind: { path: '$addressDetails', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: '$_id',
                        user_id: { $first: '$user_id' },
                        total_price: { $first: '$total_price' },
                        status: { $first: '$status' },
                        created_dt: { $first: '$created_dt' },
                        orderItems: { $push: '$orderItems' },
                        userDetails: { $first: '$userDetails' },
                        addressDetails: { $first: '$addressDetails' }
                    }
                },
                {
                    $project: {
                        'orderItems.product_id': 1,
                        'orderItems.productName': 1,
                        'orderItems.price': 1,
                        'orderItems.quantity': 1,
                        'orderItems.created_dt': 1,
                        user_id: 1,
                        total_price: 1,
                        status: 1,
                        created_dt: 1,
                        'userDetails.full_name': 1,
                        'userDetails.email': 1,
                        'userDetails.mobile': 1,
                        'addressDetails.city': 1,
                        'addressDetails.state': 1,
                        'addressDetails.pincode': 1,
                        'addressDetails.addressLine1': 1,
                        'addressDetails.addressLine2': 1,
                        'addressDetails.landmark': 1
                    }
                }
            ];
    
            let orderDetails = await this.model.aggregate(aggregate).exec();
    
            // Decrypt the user and address details
            orderDetails = orderDetails.map(order => {
                order.userDetails.full_name = decrypt(order.userDetails.full_name);
                order.userDetails.email = decrypt(order.userDetails.email);
                order.userDetails.mobile = decrypt(order.userDetails.mobile);
    
                if (order.addressDetails) {
                    order.addressDetails.city = decrypt(order.addressDetails.city);
                    order.addressDetails.state = decrypt(order.addressDetails.state);
                    order.addressDetails.pincode = decrypt(order.addressDetails.pincode);
                    order.addressDetails.addressLine1 = decrypt(order.addressDetails.addressLine1);
                    if (order.addressDetails.addressLine2) {
                        order.addressDetails.addressLine2 = decrypt(order.addressDetails.addressLine2);
                    }
                    if (order.addressDetails.landmark) {
                        order.addressDetails.landmark = decrypt(order.addressDetails.landmark);
                    }
                }
    
                return order;
            });
    
            // Create a PDF document
            const doc = new PDFDocument();
    
            // Set the response headers to indicate a file download
            res.setHeader('Content-Disposition', 'attachment; filename=orders.pdf');
            res.setHeader('Content-Type', 'application/pdf');
    
            // Pipe the PDF document to the response
            doc.pipe(res);
    
            // Add content to the PDF
            doc.fontSize(18).text('Order Details', { align: 'center' });
            doc.moveDown(1);
    
            orderDetails.forEach((order, index) => {
                doc.fontSize(14).text(`${index + 1}. Order ID: ${order._id}`, { underline: true });
                doc.fontSize(12).text(`Name: ${order.userDetails.full_name}`);
                doc.text(`Email: ${order.userDetails.email}`);
                doc.text(`Mobile: ${order.userDetails.mobile}`);
                doc.text(`City: ${order.addressDetails.city}`);
                doc.text(`State: ${order.addressDetails.state}`);
                doc.text(`Pincode: ${order.addressDetails.pincode}`);
                doc.text(`Address Line 1: ${order.addressDetails.addressLine1}`);
                if (order.addressDetails.addressLine2) {
                    doc.text(`Address Line 2: ${order.addressDetails.addressLine2}`);
                }
                if (order.addressDetails.landmark) {
                    doc.text(`Landmark: ${order.addressDetails.landmark}`);
                }
                doc.moveDown(1);
                doc.text('Product Details:', { underline: true });
                doc.moveDown(1);

                // Create an ordered list for product details
                order.orderItems.forEach((item: any, index: number) => {
                    doc.fontSize(12).text(`${index + 1}. ${item.productName} - Price: ${item.price.toFixed(2)} - Quantity: ${item.quantity}`);
                });

                // Move down for total price
                doc.moveDown(1);
                // Total Price
                doc.fontSize(12).text(`Total Price: ${order.total_price.toFixed(2)}`);
                doc.moveDown(2); // Extra space between orders
            });
    
            // Finalize the PDF and end the stream
            doc.end();
        } catch (err) {
            console.error(`Error fetching orders and generating PDF: ${err}`);
            res.status(500).send('Internal Server Error'); // Return error response
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