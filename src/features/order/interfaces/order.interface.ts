import { Types } from "mongoose";

export interface IOrder {
    total_price?: number
    status?: string;
    created_dt?: string;
    modified_dt?: string;
    deleted_dt?: string;
}