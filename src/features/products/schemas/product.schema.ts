import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IProduct } from "../interfaces/product.interface";
import { Document, Types } from "mongoose";
import { UnitTypeEnum } from "../interfaces/product.enum";

@Schema({ collection: 'products'})
export class Product implements IProduct {
    @Prop({ type: Number })
    serial_number: number;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    category: string;

    @Prop({ type: Number })
    rate_in_rs: number;

    @Prop({ type: Number })
    per: number;
    
    @Prop({ type: String, enum: UnitTypeEnum })
    unit_type: UnitTypeEnum;

    @Prop({ type: Number })
    unit_price: number;

    @Prop({ type: Number })
    profit_percentage: number;

    @Prop({ type: Number })
    display_price: number;

    @Prop({ type: String })
    unit_of_sale: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: String })
    image: string;

    @Prop({ type: Date })
    created_dt?: string;
  
    @Prop({ type: Date })
    modified_dt?: string;
  
    @Prop({ type: Date })
    deleted_dt?: string;
}

export type ProductDocument = Document & Product;
export const ProductSchema = SchemaFactory.createForClass(Product)