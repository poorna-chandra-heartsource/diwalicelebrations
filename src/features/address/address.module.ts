import { Module } from "@nestjs/common";
import { AddressController } from "./adress.controller";
import { AddressService } from "./address.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Address, AddressSchema } from "./schemas/address.schema";

@Module({
    controllers: [ AddressController ],
    imports: [  MongooseModule.forFeature([{name: Address.name, schema: AddressSchema }])],
    providers: [ AddressService ],
    exports: [ AddressService ]
})
export class AddressModule {}