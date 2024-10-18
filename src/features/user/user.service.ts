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
import { encrypt, decrypt } from '../../shared/util';

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

            if (result.length === 0) return null;

            // Assuming result[0] is the user document
            const user = result[0];
    
            // Decrypting user fields
            user.full_name = decrypt(user.full_name);
            user.email = decrypt(user.email); // Decrypt email
            user.mobile = decrypt(user.mobile); // Decrypt phone
    
            // Decrypting user addresses if present
            if (user.user_address && user.user_address.length > 0) {
                user.user_address = user.user_address.map((address: any) => {
                    return {
                        ...address,
                        // Decrypt any address fields if necessary
                        city: decrypt(address.city),
                        pincode: decrypt(address.pincode),
                        state: decrypt(address.state),
                        addressLine1: decrypt(address.addressLine1),
                        addressLine2: address.addressLine2 ? decrypt(address.addressLine2) : null, // Conditional decryption
                        landmark: address.landmark ? decrypt(address.landmark) : null // Conditional decryption
                    };
                });
            }
    
            return user;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return Promise.reject(error);
        }
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        try {
            // Encrypt the email before checking for existing user
            const encryptedEmail = encrypt(email);
            let user = await this.model.findOne({ email: encryptedEmail }).lean().exec();
            // Decrypt the encrypted fields
            const decryptedEmail = decrypt(user.email);
            const decryptedPhone = decrypt(user.mobile);
            const decryptedFullName = decrypt(user.full_name);

            // Return the user data with decrypted fields
            return {
                ...user,
                email: decryptedEmail,
                mobile: decryptedPhone,
                full_name: decryptedFullName,
                };
        } catch (error) {
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

    // Fetch User PII and decrypt fields
    // async getUserPIIData(userId: string) {
    //     const user = await this.model.findById(userId);

    //     if (!user) {
    //         throw new NotFoundException(`User with ID ${userId} not found`);
    //     }

    //     // Decrypt the encrypted fields
    //     const decryptedEmail = decrypt(user.email);
    //     const decryptedPhone = decrypt(user.phone);
    //     const decryptedAddress = decrypt(user.address);

    //     // Return the user data with decrypted fields
    //     return {
    //         ...user.toObject(),
    //         email: decryptedEmail,
    //         phone: decryptedPhone,
    //         address: decryptedAddress,
    //     };
    // }

    
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
            const encryptedEmail = encrypt(email);
            await this.model.updateOne({ email: encryptedEmail }, {
                resetToken: token,
                resetTokenExpires: expiration,
            });
        }
        catch (error) {
            console.error('Error fetching user details:', error);
            return Promise.reject(error);
        }
    }
    async createUser(user: CreateUserDto): Promise<UserDocument | Record<string, any>> {
        try {
            // Encrypt sensitive fields (email, phone, address) before saving
            const encryptedUserData = {
                ...user,
                full_name: encrypt(user.full_name),
                email: encrypt(user.email),
                mobile: user.mobile ? encrypt(user.mobile) : null,
                address: user.address ? {
                    city: encrypt(user.address.city),
                    state: encrypt(user.address.state),
                    pincode: encrypt(user.address.pincode.toString()), // Ensure pincode is a string for encryption
                    addressLine1: encrypt(user.address.addressLine1),
                    addressLine2: user.address.addressLine2 ? encrypt(user.address.addressLine2) : null,
                    landmark: user.address.landmark ? encrypt(user.address.landmark) : null,
                } : null,
            };
            const userRecord: any = await this.model.findOne({ email: encryptedUserData.email, deleted_dt: null });
            if (!userRecord) {

                // Create new user document with encrypted data
                const userDocument: UserDocument = new this.model(encryptedUserData);

                // Save user to the database
                const savedUser: UserDocument = await userDocument.save();

                // Convert saved user to plain JSON
                let newUser = savedUser.toJSON();
                // Add user address
                if (user.address) {
                    try {
                        await this.addressService.addUserAddress({ user_id: newUser._id, ...encryptedUserData.address });
                    } catch (error) {
                        // Rollback user creation if address creation fails
                        await this.model.findByIdAndDelete(newUser._id);
                        throw new HttpException("Failed to create user address. User creation rolled back.", HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
                // Add user order
                if (user.order) {
                    try {
                        await this.orderService.createOrder(newUser._id, user.order, false);
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
            const userDetails: any = await this.fetchUserDetails(userRecord._id)
            if (user.address && (!userDetails.user_address || userDetails.user_address?.length <= 0)) {
                try {
                    await this.addressService.addUserAddress({ user_id: userRecord._id, ...encryptedUserData.address });
                } catch (error) {
                    throw new HttpException("Failed to create user address.", HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            // Add user order
            if (user.order) {
                try {
                    await this.orderService.createOrder(userRecord._id, user.order, false);
                } catch (error) {
                    throw new HttpException("Failed to create order.", HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            // send mail for confirming order 
            await this.notificationService.userCreationNOrderConfirmationMail(user, false)
            return {
                "success": true,
                "data": "Order created successfully"
            };
        } catch (error) {
            console.log(`Error creating user`)
            return Promise.reject(error)
        }
    }

    async signupUser(user: SignUpDto): Promise<UserDocument> {
        try {
            // Check if user already exists by email or mobile
            const existingUser = await this.model.findOne({
                deleted_dt: null,
                '$or': [
                    { mobile: user.mobile },
                    { email: user.email }
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

    // async resetPassword(email: string): Promise<UserDocument> {
    //     try {
    //         let query: any = {
    //             'email': email,
    //             '$or': [
    //                 {
    //                     'deleted_dt': null,
    //                 },
    //                 {
    //                     'deleted_dt': {
    //                         '$exists': false
    //                     },
    //                 }
    //             ]

    //         };
    //         let userRecord = await this.model.findOne(query).exec();
    //     } catch (error) {
    //         console.log(`Error resetting password`)
    //         return Promise.reject(error)
    //     }
    // }

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