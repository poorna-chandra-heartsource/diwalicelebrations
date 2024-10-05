import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { IOrderItem } from "../interfaces/order-item.interface";

@Schema({ collection: 'order-items' })
export class OrderItem implements IOrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Order' })
    order_id: string;

    @Prop({ type: Types.ObjectId, ref: 'Product' })
    product_id: string;

    @Prop({ type: Number, required: true })
    price: number;

    @Prop({ type: Number })
    quantity: number;

    @Prop({ type: Date })
    created_dt?: string;
  
    @Prop({ type: Date })
    modified_dt?: string;
  
    @Prop({ type: Date })
    deleted_dt?: string;
}

export type OrderItemDocument = Document & OrderItem ;
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);