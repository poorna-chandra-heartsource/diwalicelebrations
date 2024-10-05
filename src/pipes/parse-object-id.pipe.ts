import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { Types } from 'mongoose';
import { ErrorConstants } from "../shared/constants/error.constants";

export class ParseObjectIdPipe implements PipeTransform {
    transform(value: any): Types.ObjectId {
        if(!Types.ObjectId.isValid(value)) {
            throw new BadRequestException(ErrorConstants.INVALID_OBJECT_ID)
        }
        return new Types.ObjectId(value);
    }
}
