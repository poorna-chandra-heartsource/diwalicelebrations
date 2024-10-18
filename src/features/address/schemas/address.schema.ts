import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IAddress } from "../interfaces/adress.interface";
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'address'})
export class Address implements IAddress {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
    user_id: string;

    @Prop({ type: String, required: true })
    city: string;

    @Prop({ type: String, required: true })
    state: string;

    @Prop({ type: String, required: true })
    pincode: string;

    @Prop({ type: String, min: 4, max:300 })
    addressLine1: string;

    @Prop({ type: String, min: 4, max:300 })
    addressLine2: string;

    @Prop({ type: String, min: 4, max:300 })
    landmark: string; 

    // @Prop({ type: String, enum: AddressTypeEnum })
    // type: AddressTypeEnum;

    @Prop({ type: Date })
    created_dt?: string

    @Prop({ type: Date})
    modified_dt?: string

    @Prop({ type: Date})
    deleted_dt: string
}

export type AddressDocument = Address & Document;
export const AddressSchema = SchemaFactory.createForClass(Address);