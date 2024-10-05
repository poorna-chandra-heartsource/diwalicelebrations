import { Module } from "@nestjs/common";
import { OrderItemController } from "./order-item.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderItem, OrderItemSchema } from "./schema/order-item.schema";
import { OrderItemService } from "./order-item.service";

@Module({
    imports: [
        MongooseModule.forFeature([ { name: OrderItem.name, schema: OrderItemSchema }])
    ],
    controllers: [ OrderItemController ],
    providers: [ OrderItemService ],
    exports: [ OrderItemService ]
})
export class OrderItemModule {

}