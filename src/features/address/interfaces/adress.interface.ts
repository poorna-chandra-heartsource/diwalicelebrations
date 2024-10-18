import { Types } from "mongoose";

export interface IAddress {
    user_id?: string | Types.ObjectId,
    city: string,
    state: string,
    pincode: string,
    addressLine1: string,
    addressLine2: string,
    landmark: string,
    created_dt?: string,
    modified_dt?: string,
    deleted_dt?: string
}