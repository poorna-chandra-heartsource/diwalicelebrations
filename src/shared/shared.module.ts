import {  forwardRef, Module } from "@nestjs/common";
import { NotificationService } from "./api-services/notification.service";
import { ProductService } from "src/features/products/product.service";
import { ProductModule } from "src/features/products/product.module";
import { AuthModule } from "src/features/auth/auth.module";

@Module({
    imports: [
        ProductModule,
        forwardRef(() => AuthModule )
     ],
    providers: [ NotificationService ],
    exports: [ NotificationService ]
})
export class SharedModule {

}