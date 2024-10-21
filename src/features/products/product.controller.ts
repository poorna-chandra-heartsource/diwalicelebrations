import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { ProductDto } from "./dto/product.dto";
import { ProductService } from "./product.service";
import { IProduct } from "./interfaces/product.interface";
import { PageDto, PageOptionsRequestDto } from "../../shared/dto";
import { ProductDetailsDto } from "./dto/product-details.dto";
import { ParseObjectIdPipe } from "src/pipes/parse-object-id.pipe";
import { UpdatedResponseInterface } from "../../shared/interfaces";

@Controller('/api/products')
export class ProductController {
    constructor(
        private productService: ProductService
    ) {}

    @Post('')
    @ApiOperation({ description: 'Add Product'})
    @ApiResponse({ status: 200, description: 'Product added successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    async addProduct(
        @Body() body: ProductDto
    ): Promise<any> {
        return this.productService.createProduct(body);
    }

    @Post('fetch')
    @ApiOperation({ description: 'Fetch Products'})
    @ApiResponse({ status: 200, description: 'Products fetched successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiQuery({ name: 'sort_field', type: String, required: false })
    @ApiQuery({ name: 'sort_order', type: String, required: false })
    fetchProducts(
        @Query() queryParams: PageOptionsRequestDto,
        @Body() payload: ProductDetailsDto
    ): Promise<PageDto<IProduct[]>> {
        return this.productService.fetchAllProducts(queryParams, payload)
    }

    @Get('categories')
    @ApiOperation({ description: 'Fetch Products Categories'})
    @ApiResponse({ status: 200, description: 'Product categories fetched successfully'})
    @ApiResponse({ status: 404, description: 'Product categories not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    async fetchProductsCategories(): Promise<IProduct> {
        const product = await this.productService.fetchProductsCategories();
        if(!product) throw new NotFoundException(`Product categories not found`);
        return product
    }

    @Get(':id')
    @ApiOperation({ description: 'Fetch Product details'})
    @ApiResponse({ status: 200, description: 'Product details fetched successfully'})
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Product Id'})
    async fetchProductDetails(
        @Param('id', ParseObjectIdPipe) id: string
    ): Promise<IProduct> {
        const product = await this.productService.fetchProductDetails(id);
        if(!product) throw new NotFoundException(`Product with id ${id} not found`);
        return product
    }

    @Put(':id')
    @ApiOperation({ description: 'Update Product details'})
    @ApiResponse({ status: 200, description: 'Product details updated successfully'})
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Product Id'})
    async updateProductDetails(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() productInput: ProductDetailsDto
     ): Promise<IProduct> {
        const product = await this.productService.updateProductDetails(id, productInput);
        if(!product) throw new NotFoundException(`Product with id ${id} not found`);
        return product
    }

    
    @Delete(':id')
    @ApiOperation({ description: 'Delete Product details'})
    @ApiResponse({ status: 200, description: 'Product details deleted successfully'})
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'Product Id'})
    async deleteProductDetails(
        @Param('id', ParseObjectIdPipe) id: string
     ): Promise<UpdatedResponseInterface> {
        const deletedResult = await this.productService.deleteProduct(id);
        if (deletedResult.matchedCount && deletedResult.matchedCount !== 1) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }
        if (deletedResult.modifiedCount && deletedResult.modifiedCount !== 1) {
            throw new Error(`Error occured in deleting Product`);
        }
        return deletedResult
    }
}