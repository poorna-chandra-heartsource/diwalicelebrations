import { InjectModel } from "@nestjs/mongoose";
import { PageDto, PageOptionsRequestDto, PagePaginationDto } from "../../shared/dto";
import { IUser } from "./interfaces/user.interface";
import { User, UserDocument } from "./schema/user.schema";
import { Model, Types } from "mongoose";
import { CustomPopulateOptionsInterface, SortOrder, UpdatedResponseInterface } from "../../shared/interfaces";
import { AddressService } from "../address/address.service";
import { ConflictException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ErrorConstants } from "../../shared/constants/error.constants";
import { IAddress } from "../address/interfaces/adress.interface";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { SignUpDto } from "../auth/dto/signup.dto";
import { OrderService } from "../order/order.service";
import { NotificationService } from "src/shared/api-services/notification.service";

@Injectable({})
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly model: Model<UserDocument>,
        private readonly addressService: AddressService,
        private readonly orderService: OrderService,
        private readonly notificationService: NotificationService
    ) { }

    async fetchAllUsers(pageOptionsRequestDto: PageOptionsRequestDto, userDetails: IUser): Promise<PageDto<IUser[]>> {

        try {
            let query: any = {
                'deleted_dt': null
            };
            const {
                page,
                limit = 10,
                sort_field = 'created_dt',
                sort_order = SortOrder.Ascending,
            } = pageOptionsRequestDto;

            const { full_name, email, mobile } = userDetails;

            if (full_name) query['full_name'] = full_name;
            if (email) query['email'] = email;
            if (mobile) query['mobile'] = mobile;

            const totalRecords = (await this.model.find(query).exec()).length;

            const userPagination = new PagePaginationDto({ pageOptionsRequestDto, totalRecords });

            const sortCriteria: Record<string, 1 | -1> = { [sort_field]: sort_order.toLowerCase() === SortOrder.Ascending ? 1 : -1 };

            const userResponse: UserDocument[] = await this.model.find(query)
                .sort(sortCriteria)
                .skip(PageOptionsRequestDto.skip(page, limit))
                .limit(limit)
                .select(['-password']); // Exclude the password field
            return new PageDto<UserDocument[]>(userResponse, userPagination)
        } catch (err) {
            console.log(`Error fetching users`)
            return Promise.reject(err)
        }

    }

    async fetchUserDetails(id: string | Types.ObjectId): Promise<UserDocument | null> {
        try {
            const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;

            const result = await this.model.aggregate([
                {
                    $match: {
                        _id: objectId,
                        deleted_dt: null
                    }
                },
                {
                    $lookup: {
                        from: 'address',
                        let: { userId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$user_id', '$$userId'] }, // Compare user_id with user _id
                                            {
                                                $or: [
                                                    // $ifNull: This ensures that if deleted_dt is missing (i.e., not present in the document), it will be treated as null.
                                                    // Condition: It checks if deleted_dt is either null or an empty string (''), ensuring that addresses without deleted_dt are included.
                                                    { $eq: [{ $ifNull: ['$deleted_dt', null] }, null] }, // Handle missing deleted_dt as null
                                                    { $eq: ['$deleted_dt', ''] }    // or deleted_dt is an empty string
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'user_address'
                    }
                },
                {
                    $project: {
                        password: 0
                    }
                }
            ]).exec();

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return Promise.reject(error);
        }
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        try {
            return await this.model.findOne({ email }).lean().exec();
        } catch (error) {
            console.error('Error fetching user details:', error);
            return Promise.reject(error);
        }
    }

    async findByResetToken(token: string): Promise<UserDocument | undefined> {
        try {
            return this.model.findOne({ resetToken: token });
        } catch (error) {
            console.error('Error fetching user details:', error);
            return Promise.reject(error);
        }
    }

    async updateUserResetToken(email: string, token: string, expiration: Date): Promise<void> {
        try {
            await this.model.updateOne({email}, {
            resetToken: token,
            resetTokenExpires: expiration,
            });
        }
        catch (error) {
            console.error('Error fetching user details:', error);
            return Promise.reject(error);
        }
    }

    async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
        try {
            const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : new HttpException(ErrorConstants.INVALID_OBJECT_ID, HttpStatus.BAD_REQUEST);
            return await this.model.findOne({ '_id': objectId, 'deleted_dt': null }).lean().exec();
        } catch (error) {
            console.error('Error fetching user details:', error);
            return Promise.reject(error);
        }
    }

    async createUser(user: CreateUserDto): Promise<UserDocument | Record<string, any>> {
        try {
            // Check if user already exists
            const userRecord: any = await this.model.findOne({ email: user.email, deleted_dt: null });
            if (!userRecord) {
                // Create new user document
                const userDocument: UserDocument = new this.model(user);

                // Save user to the database
                const savedUser: UserDocument = await userDocument.save();

                // Convert saved user to plain JSON
                let newUser = savedUser.toJSON();
                // Add user address
                if (user.address) {
                    try {
                        await this.addressService.addUserAddress({ user_id: newUser._id, ...user.address });
                    } catch (error) {
                        // Rollback user creation if address creation fails
                        await this.model.findByIdAndDelete(newUser._id);
                        throw new HttpException("Failed to create user address. User creation rolled back.", HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
                // Add user order
                if (user.order) {
                    try {
                        await this.orderService.createOrder({ user_id: newUser._id, ...user.order }, false);
                    } catch (error) {
                        // Rollback user and address creation if subscription creation fails
                        await this.model.findByIdAndDelete(newUser._id);
                        if (user.address) {
                            await this.addressService.deleteUserAddress(newUser._id);  // Rollback address as well
                        }
                        throw new HttpException("Failed to create order. User creation rolled back.", HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
                await this.notificationService.userCreationNOrderConfirmationMail(user, true);
                return savedUser;
            }
            const userDetails:any  = await this.fetchUserDetails(userRecord._id)
            if (user.address && (!userDetails.user_address || userDetails.user_address?.length <= 0 )) {
                try {
                    await this.addressService.addUserAddress({ user_id: userRecord._id, ...user.address });
                } catch (error) {
                    throw new HttpException("Failed to create user address.", HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            // Add user order
            if (user.order) {
                try {
                    await this.orderService.createOrder({ user_id: userRecord._id, ...user.order }, false);
                } catch (error) {
                    throw new HttpException("Failed to create order.", HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            // send mail for confirming order 
            await this.notificationService.userCreationNOrderConfirmationMail(user, false)
            return {
                "success": true,
                "data":"Order created successfully"
            };
        } catch (error) {
            console.log(`Error creating user`)
            return Promise.reject(error)
        }
    }

    async signupUser(user: SignUpDto): Promise<UserDocument> {
        try {
            // Check if user already exists by email or mobile
            const existingUser  = await this.model.findOne({ 
                deleted_dt: null,
                '$or': [
                    { mobile: user.mobile }, 
                    {email: user.email }
                ]
             });

            // Throw appropriate error if either mobile or email already exists
            if (existingUser && existingUser.mobile === user.mobile) {
                throw new HttpException(ErrorConstants.USER_MOBILE_EXISTS, HttpStatus.BAD_REQUEST);
            }
            if (existingUser && existingUser.email === user.email) {
                throw new HttpException(ErrorConstants.USER_EMAIL_EXISTS, HttpStatus.BAD_REQUEST);
            }


            // Create new user document
            const userDocument: UserDocument = new this.model(user);

            if (userDocument.password) userDocument.password = await bcrypt.hash(userDocument.password, 10);

            // Save user to the database
            const savedUser: UserDocument = await userDocument.save();

             // Convert the saved user to a plain object and remove the password field
            const userWithoutPassword = savedUser.toObject({
                versionKey: false,        // Optional: Removes the __v field if needed
                transform: (doc, ret) => {
                    delete ret.password;  // Exclude password from the response
                    return ret;
                }
            });

            return userWithoutPassword;
        } catch (error) {
            console.log(`Error creating user`)
            return Promise.reject(error)
        }
    }

    async resetPassword(email: string): Promise<UserDocument> {
        try {
            let query: any = {
                'email': email,
                '$or': [
                    {
                        'deleted_dt': null,
                    },
                    {
                        'deleted_dt': {
                            '$exists': false
                        },
                    }
                ]

            };
            let userRecord = await this.model.findOne(query).exec();
        } catch (error) {
            console.log(`Error resetting password`)
            return Promise.reject(error)
        }
    }

    async updateUser(id: Types.ObjectId | string, user: IUser): Promise<UserDocument> {
        try {
            let query: any = {
                '_id': id,
                '$or': [
                    {
                        'deleted_dt': null,
                    },
                    {
                        'deleted_dt': {
                            '$exists': false
                        },
                    }
                ]

            };
            if (user.password) user.password = await bcrypt.hash(user.password, 10)
            user.modified_dt = new Date().toISOString();

            return await this.model.findOneAndUpdate(query, { $set: user }, { new: true })
                .select('-password') // Exclude the password field
                .exec();
        } catch (error) {
            console.log(`Error updating user`)
            return Promise.reject(error)
        }
    }

    async deleteUser(id: Types.ObjectId | string): Promise<UpdatedResponseInterface> {
        try {
            let query: any = {
                '_id': id,
                '$or': [
                    {
                        'deleted_dt': {
                            '$exists': false
                        }
                    },
                    { 'deleted_dt': null }
                ]
            }
            await this.addressService.deleteUserAddress(id);
            return await this.model.updateOne(query, { $set: { 'deleted_dt': new Date().toISOString() } }).exec();
        } catch (error) {
            console.log(`Error deleting user`)
            return Promise.reject(error)
        }
    }
}