import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { IOrder } from "../interfaces/order.interface";
import { OrderStatus } from "../interfaces/order.enum";

@Schema({ collection: 'orders' })
export class Order implements IOrder {
    @Prop({ type: Types.ObjectId, required: true })
    user_id: string;

    @Prop({ type: Number, required: true })
    total_price: number;

    @Prop({ type: String, enum: OrderStatus })
    status: string;

    @Prop({ type: Date })
    created_dt?: string;
  
    @Prop({ type: Date })
    modified_dt?: string;
  
    @Prop({ type: Date })
    deleted_dt?: string;
}

export type OrderDocument = Document & Order ;
export const OrderSchema = SchemaFactory.createForClass(Order);