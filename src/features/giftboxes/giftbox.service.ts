import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GiftBox, GiftBoxDocument } from "./schemas/giftbox.schema";
import { Model } from "mongoose";

@Injectable()
export class GiftBoxService {
    constructor(
        @InjectModel(GiftBox.name) private readonly model: Model<GiftBoxDocument>
    ) {}

    async fetchGiftBoxDetails(name: string): Promise<GiftBoxDocument | null> {
        try {
           const query: any = {
                    "name": name,
                    "deleted_dt" : null
                }          

           return await this.model.findOne(query).exec();
        }
        catch(error) {
            console.log(`Error fetching giftbox details`)
            return Promise.reject(error)
        }
    }
 }