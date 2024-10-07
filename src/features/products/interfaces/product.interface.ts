import { Types } from "mongoose";
import { UnitTypeEnum } from "./product.enum";

export interface IProduct {  
    id?: string[] | Types.ObjectId[],
    serial_number?: number,
    name?: string,
    category?: string,
    rate_in_rs?: number,
    per?:  number,
    unit_type?: UnitTypeEnum,
    unit_price?: number,
    profit_percentage?: number
    display_price?: number,
    unit_of_sale?: string,
    description?: string,
    image?: string,
    created_dt?: string,
    modified_dt?: string,
    deleted_dt?: string
}