import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IAddress } from "./interfaces/adress.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Address, AddressDocument } from "./schemas/address.schema";
import { Model, Types } from "mongoose";
import { ErrorConstants } from "../../shared/constants/error.constants";
import { CustomPopulateOptionsInterface, SortOrder } from "../../shared/interfaces";
import { PageDto, PageOptionsRequestDto, PagePaginationDto } from "../../shared/dto";
import { UserService } from "../user/user.service";

@Injectable()
export class AddressService {
    constructor(
        @InjectModel(Address.name) private readonly model: Model<AddressDocument>
    ) {}

    async addUserAddress(addressInput: IAddress): Promise<any> {
        try {
            addressInput.user_id = new Types.ObjectId(addressInput.user_id)
            const address: AddressDocument = new this.model(addressInput);
            await address.save()
            return address.toJSON();
        } catch(error) {
            console.log(`Error creating user address`);
            return Promise.reject(error)
        }

    }

    async fetchAllAddress(
        pageOptionsRequestDto: PageOptionsRequestDto, 
        addressInput: IAddress
    ): Promise<PageDto<AddressDocument[]>> {
        try {
            const { user_id, city, state, pincode, landmark } = addressInput;
            const query: any = {
                deleted_dt: { $eq: null }
            };
            const {
                page,
                limit = 10,
                sort_field = 'created_dt',
                sort_order = SortOrder.Ascending,
              } = pageOptionsRequestDto;

            if (user_id) query.user_id = new Types.ObjectId(user_id);
            if (city) query.city = city;
            if(state) query.state = state;
            if(pincode) query.pincode = pincode;
            if(landmark) query.landmark = landmark;

            const totalRecords = (await this.model.find(query).exec()).length;

            const sortCriteria: Record<string, 1 | -1> = {
                [sort_field]: sort_order.toLowerCase() === SortOrder.Ascending ? 1 : -1   
            }

            const addressResponse: AddressDocument[] = await this.model.find(query)
                                            .sort(sortCriteria)
                                            .skip(PageOptionsRequestDto.skip(page, limit))
                                            .limit(limit * 1);

            const addressPagination = new PagePaginationDto({pageOptionsRequestDto, totalRecords})
            return new PageDto<AddressDocument[]>(addressResponse, addressPagination);
        } catch(error) {
            console.log(`Error fetching the address list ${error}`) ;
            return Promise.reject(error)
        }
    }

    async fetchAddressDetails(address_id: string | Types.ObjectId): Promise<AddressDocument | null> {
        try {
            const query: any = {
                _id: address_id,
                deleted_dt: { $eq : null }
             };

            return await this.model.findOne(query).exec()
        }
        catch(error) {
            console.log(`Error fetching address details`)
            return Promise.reject(error)
        }
    }

    async updateUserAddress(userId:string | Types.ObjectId, addressInput: IAddress): Promise<AddressDocument | Record<string, unknown>> {
        try {
            let query = {
            'user_id': userId,
            '$or': [
                {'deleted_dt': {
                    '$exists': false
                }},
                {'deleted_dt': null }
             ]
            }
            addressInput.modified_dt = new Date().toISOString();
            return await this.model.findOneAndUpdate(query, {$set: addressInput}, { new: true }).exec();
        } catch(error) {
            console.log(`Error creating user address`);
            return Promise.reject(error)
        }
    }

    async deleteUserAddress(userId:string | Types.ObjectId): Promise<AddressDocument | Record<string, unknown>> {
        try {
            let query = {
                'user_id': userId
            }
            return await this.model.findOneAndDelete(query).exec(); 
        } catch(error) {
            console.log(`Error deleting user address`);
            return Promise.reject(error)
        }
    }

    async deleteAddress(userId:string | Types.ObjectId): Promise<AddressDocument | Record<string, unknown>> {
        try {
            let query = {
                'user_id': userId,
                '$or': [
                    {'deleted_dt': {
                        '$exists': false
                    }},
                    {'deleted_dt': null }
                ]
            }
            return await this.model.findOneAndUpdate(query, {$set: {'deleted_dt': new Date().toISOString()}}, { new: true }).exec(); 
        } catch(error) {
            console.log(`Error deleting user address`);
            return Promise.reject(error)
        }
    }
}