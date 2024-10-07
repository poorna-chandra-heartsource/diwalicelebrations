import { forwardRef, Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./schema/order.schema";
import { OrderService } from "./order.service";
import { OrderItemModule } from "../order-items/order-item.module";
import { UserModule } from "../user/user.module";
import { SharedModule } from "src/shared/shared.module";
import { UserService } from "../user/user.service";

@Module({
    imports: [
        MongooseModule.forFeature([ { name: Order.name, schema: OrderSchema }]),
        OrderItemModule,
        SharedModule,
        forwardRef(() => UserModule)
    ],
    controllers: [ OrderController ],
    providers: [ OrderService ],
    exports: [ OrderService ]
})
export class OrderModule {

}