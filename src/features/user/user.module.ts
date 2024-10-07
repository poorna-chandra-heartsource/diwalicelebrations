import { forwardRef, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/user.schema";
import { UserService } from "./user.service";
import { AddressModule } from "../address/address.module";
import { OrderModule } from "../order/order.module";
import { ProductModule } from "../products/product.module";
import { SharedModule } from "src/shared/shared.module";

@Module({
    imports: [
        MongooseModule.forFeature([ { name: User.name, schema: UserSchema }]),
        AddressModule,        
        ProductModule,
        SharedModule,
        forwardRef(() => OrderModule)
    ],
    controllers: [ UserController ],
    providers: [ UserService ],
    exports: [ UserService ]
})
export class UserModule {

}