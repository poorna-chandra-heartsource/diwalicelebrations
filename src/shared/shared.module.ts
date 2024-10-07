import {  Module } from "@nestjs/common";
import { NotificationService } from "./api-services/notification.service";
import { ProductService } from "src/features/products/product.service";
import { ProductModule } from "src/features/products/product.module";

@Module({
    imports: [ProductModule ],
    providers: [ NotificationService ],
    exports: [ NotificationService ]
})
export class SharedModule {

}