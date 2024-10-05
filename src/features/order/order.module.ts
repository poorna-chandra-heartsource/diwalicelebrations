import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./schema/order.schema";
import { OrderService } from "./order.service";
import { OrderItemModule } from "../order-items/order-item.module";

@Module({
    imports: [
        MongooseModule.forFeature([ { name: Order.name, schema: OrderSchema }]),
        OrderItemModule
    ],
    controllers: [ OrderController ],
    providers: [ OrderService ],
    exports: [ OrderService ]
})
export class OrderModule {

}