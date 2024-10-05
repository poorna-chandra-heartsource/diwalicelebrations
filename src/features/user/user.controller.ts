import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { PageDto, PageOptionsRequestDto } from "../../shared/dto";
import { ParseObjectIdPipe } from "src/pipes/parse-object-id.pipe";
import { UpdatedResponseInterface } from "../../shared/interfaces";
import { UserDetailsDto } from "./dto/user-details.dto";
import { IUser } from "./interfaces/user.interface";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller('users')
export class UserController {
    constructor(private userService: UserService){}

    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('')
    @ApiOperation({ description: 'Add User'})
    @ApiResponse({ status: 200, description: 'User added successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    async addUser(
        @Body() body: CreateUserDto
    ): Promise<any> {
        return this.userService.createUser(body)
    }

    @Post('fetch')
    @ApiOperation({ description: 'Fetch Users'})
    @ApiResponse({ status: 200, description: 'Users fetched successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiQuery({ name: 'sort_field', type: String, required: false })
    @ApiQuery({ name: 'sort_order', type: String, required: false })
    fetchUsers(
        @Query() queryParams: PageOptionsRequestDto,
        @Body() payload: UserDetailsDto
    ): Promise<PageDto<IUser[]>> {
        return this.userService.fetchAllUsers(queryParams, payload)
    }

    @Get(':id')
    @ApiOperation({ description: 'Fetch User details'})
    @ApiResponse({ status: 200, description: 'User details fetched successfully'})
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'User Id'})
    async fetchUserDetails(
        @Param('id', ParseObjectIdPipe) id: string
    ): Promise<IUser> {
        const user = await this.userService.fetchUserDetails(id);
        if(!user) throw new NotFoundException(`User with id ${id} not found`);
        return user
    }

    @Put(':id')
    @ApiOperation({ description: 'Update User details'})
    @ApiResponse({ status: 200, description: 'User details updated successfully'})
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'User Id'})
    async updateUserDetails(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() userInput: UserDetailsDto
     ): Promise<IUser> {
        const user = await this.userService.updateUser(id, userInput);
        if(!user) throw new NotFoundException(`User with id ${id} not found`);
        return user
    }

    @Delete(':id')
    @ApiOperation({ description: 'Delete User details'})
    @ApiResponse({ status: 200, description: 'User details deleted successfully'})
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiParam({ name: 'id', type: String, description: 'User Id'})
    async deleteUserDetails(
        @Param('id', ParseObjectIdPipe) id: string
     ): Promise<UpdatedResponseInterface> {
        const deletedResult = await this.userService.deleteUser(id);
        if (deletedResult.matchedCount && deletedResult.matchedCount !== 1) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        if (deletedResult.modifiedCount && deletedResult.modifiedCount !== 1) {
            throw new Error(`Error occured in deleting User`);
        }
        return deletedResult
    }
}
