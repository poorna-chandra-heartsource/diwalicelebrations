import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { IUser } from "../interfaces/user.interface";

@Schema({ collection: 'users' })
export class User implements IUser {
    @Prop({ type: String, required: true})
    full_name: string;

    @Prop({ type: String })
    email: string;

    @Prop({ type: String })
    password: string;

    @Prop({ type: String, required: true, unique: true })
    mobile: string;

    @Prop({ type: String })
    resetToken?: string;
    
    @Prop({ type: Date })
    resetTokenExpires?: Date;

    @Prop({ type: Date })
    created_dt: string;
  
    @Prop({ type: Date })
    modified_dt: string;
  
    @Prop({ type: Date })
    deleted_dt: string;
}

export type UserDocument = Document & User ;
export const UserSchema = SchemaFactory.createForClass(User);