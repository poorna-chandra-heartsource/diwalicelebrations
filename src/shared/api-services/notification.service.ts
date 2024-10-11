import { Injectable, forwardRef, Inject } from "@nestjs/common";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import appConfig from "src/config/app.config";
import servicesConfig from "src/config/services.config";
import { AuthService } from "src/features/auth/auth.service";
import { ProductService } from "src/features/products/product.service";
import { CreateUserDto } from "src/features/user/dto/create-user.dto";

@Injectable({})
export class NotificationService {
    private notificationApiAxiosService: AxiosInstance;
    constructor(
        private readonly productService: ProductService, // Use forwardRef here
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService // Use forwardRef here
    ){
        this.notificationApiAxiosService = axios.create({
            baseURL: servicesConfig().notificationServiceURL
        })
    }

    async getProducts(user: CreateUserDto){
        let products:any = await this.productService.fetchAllProducts({
            page: 0,
            limit: 0
        }, {"id": user.order.orderItems.map(item => item.product_id)});
        if(products && products.data){
            user.order.orderItems.forEach((item:any )=> {
                let targetProduct = products.data.find((product:any) => product.id == item.product_id);
                item['product'] = targetProduct['name']
            });
        }
        return user;
    }

    async userCreationNOrderConfirmationMail(user: any, pwdResetLink?: boolean): Promise<AxiosResponse<any>> {
        try {
            // Fetch products related to the user's order
            let products: any = await this.productService.fetchAllProducts(
                {
                    page: 0,
                    limit: 0
                },
                { "id": user.order.orderItems.map((item: any) => item.product_id) }
            );
    
            // Map product names to order items
            if (products && products.data) {
                user.order.orderItems.forEach((item: any) => {
                    let targetProduct = products.data.find((product: any) => product.id == item.product_id);
                    item['product'] = targetProduct['name'] || null;
                });
            }
    
            // Prepare the mail content
            let mailContent: any = {
                "to": user.email,
                "subject": `Confirmation of Your Inquiry #${user.order?.orderItems[0]?.order_id}`,
                "name": user.full_name,
                "order": user.order,
                "shippingAddress": user.address
            };
    
            // Generate password reset link if required
            if (pwdResetLink) {
                const token = await this.authService.generatePasswordResetToken(user.email);
                mailContent['passwordResetLink'] = `${appConfig().frontendUrl}/reset-password?token=${token}`;
            }
    
            // Only send the email after the token has been added if needed
            return await this.notificationApiAxiosService.post('/email/confirm', mailContent);
        } catch (err) {
            console.log(
                err.response?.data?.errors ||
                err.response?.data ||
                err.response ||
                err
            );
        }
    }
    

    // async orderConfirmationMail(user: CreateUserDto): Promise<AxiosResponse<any>> {
    //     try {
    //         const updatedUser = await this.getProducts(user)
    //         let mailContent = {
    //             "to": updatedUser.email,
    //             "subject": "Order Confirmation",
    //             "name": updatedUser.full_name,
    //             "order": updatedUser.order,
    //             "shippingAddress": updatedUser.address
    //         }
    //         return await this.notificationApiAxiosService.post('/email/confirm', mailContent)
    //     } catch(err) {
    //         console.log(err)
    //     }

    // }

    async signupMail(user: any): Promise<AxiosResponse<any>> {
        try {
            let mailContent = {
                "to": user.email,
                "subject": "User Onboarding",
                "name": user.full_name,
                "order": user.order,
                "shippingAddress": user.address,
                "passwordResetLink": "http://yourapi.com/reset-password"
            }
            console.log(this.notificationApiAxiosService.getUri())
            return await this.notificationApiAxiosService.post('/email/confirm', mailContent)
        } catch(err) {
            console.log(err)
        }

    }

    async passwordResetMail(email: string, resetLink: string): Promise<AxiosResponse<any>> {
        try {            
            const mailOptions = {
                to: email,
                subject: 'Password Reset Request',
                html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                       <a href="${resetLink}">${resetLink}</a>`,
              };

            return await this.notificationApiAxiosService.post('/email/send', mailOptions);
        } catch(err) {
            console.log(
                err.response?.data?.errors ||
                err.response?.data ||
                err.response ||
                err
            )
        }

    }
}