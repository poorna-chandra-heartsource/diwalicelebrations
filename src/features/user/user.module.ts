import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/user.schema";
import { UserService } from "./user.service";
import { AddressModule } from "../address/address.module";
import { OrderModule } from "../order/order.module";

@Module({
    imports: [
        MongooseModule.forFeature([ { name: User.name, schema: UserSchema }]),
        AddressModule,
        OrderModule
    ],
    controllers: [ UserController ],
    providers: [ UserService ],
    exports: [ UserService ]
})
export class UserModule {

}