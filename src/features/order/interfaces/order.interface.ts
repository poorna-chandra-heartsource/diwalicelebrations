import { Types } from "mongoose";

export interface IOrder {
    user_id?: string | Types.ObjectId;
    total_price?: number
    status?: string;
    created_dt?: string;
    modified_dt?: string;
    deleted_dt?: string;
}