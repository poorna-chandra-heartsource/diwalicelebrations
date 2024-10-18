import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument } from "./schemas/product.schema";
import { Model, SchemaTypes, Types } from "mongoose";
import { IProduct } from "./interfaces/product.interface";
import { PageDto, PageOptionsRequestDto, PagePaginationDto } from "../../shared/dto";
import { SortOrder } from "../../shared/interfaces/sort-order.enum";
import { CustomPopulateOptionsInterface, UpdatedResponseInterface } from "../../shared/interfaces";
import { ProductDto } from "./dto/product.dto";
import appConfig from "src/config/app.config";

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private readonly model: Model<ProductDocument>
    ) {}

    async createProduct(body: IProduct): Promise<ProductDocument | Record<string , unknown>> {
        try {
            let product: ProductDocument = new this.model(body);
            await product.save();
            return product.toJSON();
        } catch(error) {
            console.log(`Error creating the product ${error}`) ;
            return Promise.reject(error)
        }
    }

    async fetchAllProducts(
        pageOptionsRequestDto: PageOptionsRequestDto, 
        productInput: IProduct
    ): Promise<PageDto<ProductDocument[]>> {
        try {
            const { id, name, category, rate_in_rs, unit_type, display_price } = productInput;
            const query: any = {
                deleted_dt: { $eq: null }
            };
            const {
                page,
                limit = 10,
                sort_field = 'created_dt',
                sort_order = SortOrder.Ascending,
              } = pageOptionsRequestDto;

            if(id){
                id.forEach(item => item = new Types.ObjectId(item));
                query['_id'] = {'$in':  id}
            }
            if (name) query.name = name;
            if (category) query.category = category;
            if(rate_in_rs) query.rate_in_rs = rate_in_rs;
            if(display_price) query.rate_in_rs = display_price;
            if(unit_type) query.unit_type = unit_type;

            const totalRecords = (await this.model.find(query).exec()).length;

            const productPagination = new PagePaginationDto({pageOptionsRequestDto, totalRecords});
            
            const sortCriteria: Record<string, 1 | -1> = {
                [sort_field]: sort_order.toLowerCase() === SortOrder.Ascending ? 1 : -1   
            }

            const productsResponse: ProductDocument[] = await this.model.find(query)
                                            .sort(sortCriteria)
                                            .skip(PageOptionsRequestDto.skip(page, limit))
                                            .limit(limit * 1);

            
            return new PageDto<ProductDocument[]>(productsResponse, productPagination);
        } catch(error) {
            console.log(`Error fetching the products list ${error}`) ;
            return Promise.reject(error)
        }
    }

    async fetchProductDetails(product_id: string | Types.ObjectId): Promise<ProductDocument | null> {
        try {
           const query: any = {
                    "_id": product_id,
                    "deleted_dt" : null
                }          

           return await this.model.findOne(query).exec();
        }
        catch(error) {
            console.log(`Error fetching product details`)
            return Promise.reject(error)
        }
    }

    async fetchProductsCategories(): Promise<any | null> {
        try {   

                return await this.model.aggregate([
                    {
                        $match: { "deleted_dt" : null } 
                    },
                    {
                      $group: {
                        _id: "$category",        // Group by the category field
                        productCount: { $sum: 1 } // Count the number of products in each category
                      }
                    },
                    {
                      $project: {
                        _id: 0,                    // Exclude the _id field
                        product_category: "$_id",  // Rename _id to product_category
                        productCount: 1            // Include the productCount field
                      }
                    },
                    {
                      $sort: { product_category: 1 }  // Optional: Sort by product count in descending order
                    }
                  ]);
                  
        }
        catch(error) {
            console.log(`Error fetching product details`)
            return Promise.reject(error)
        }
    }

    async updateProductDetails(product_id: string | Types.ObjectId, payload: IProduct ): Promise<ProductDocument | Record<string, unknown>> {
        try {
            let query: any = {
                    '_id': product_id,
                    '$or': [
                        {'deleted_dt': {
                            '$exists': false
                        }},
                        {'deleted_dt': null }
                    ]
                }
            payload.modified_dt = new Date().toISOString();

            return await this.model.findOneAndUpdate(query, { $set : payload }, { new: true}).exec();
        } catch(error) {
            console.log(`Error updating product`)
            return Promise.reject(error)
        }
    }

    async deleteProduct(product_id: string | Types.ObjectId): Promise<UpdatedResponseInterface> {
        try {
            let query: any = {
                '_id': product_id,
                '$or': [
                    {'deleted_dt': {
                        '$exists': false
                    }},
                    {'deleted_dt': null }
                ]
            }
    
            return await this.model.updateOne(query, { $set : { 'deleted_dt': new Date().toISOString() } }).exec();
        } catch(error) {
            console.log(`Error deleting product`)
            return Promise.reject(error)
        }

    }

    async deleteUserProducts(user_id: string | Types.ObjectId): Promise<UpdatedResponseInterface> {
        try {
            let query: any = {
                'user_id': user_id,
                '$or': [
                    {'deleted_dt': {
                        '$exists': false
                    }},
                    {'deleted_dt': null }
                ]
            }
    
            return await this.model.updateMany(query, { $set : { 'deleted_dt': new Date().toISOString() } }).exec();
        } catch(error) {
            console.log(`Error deleting user products`)
            return Promise.reject(error)
        }

    }
 }