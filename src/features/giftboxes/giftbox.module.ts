import { Module } from "@nestjs/common";
import { GiftBoxController } from "./giftbox.controller";
import { GiftBoxService } from "./giftbox.service";
import { MongooseModule } from "@nestjs/mongoose";
import { GiftBox, GiftBoxSchema } from "./schemas/giftbox.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: GiftBox.name, schema: GiftBoxSchema }
        ]),
    ],
    controllers: [ GiftBoxController ],
    providers: [ GiftBoxService ],
    exports: [ GiftBoxService ]
})
export class GiftBoxModule {}