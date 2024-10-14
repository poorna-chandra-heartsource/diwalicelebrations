import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IGiftBox } from "../interfaces/giftbox.interface";
import { Document, Types } from "mongoose";

@Schema({ collection: 'giftboxes'})
export class GiftBox implements IGiftBox {
    @Prop({ type: String })
    name: string;

    @Prop({ type: Date })
    created_dt?: string;
  
    @Prop({ type: Date })
    modified_dt?: string;
  
    @Prop({ type: Date })
    deleted_dt?: string;
}

export type GiftBoxDocument = Document & GiftBox;
export const GiftBoxSchema = SchemaFactory.createForClass(GiftBox)