import { IsArray, IsNumber, IsString, Validate } from "class-validator";
import { IsArrayStringNumberValidator } from "../custom-validator/Is-array-string-validator";

export class QueryMultasIds{
    @IsString()
    @Validate(IsArrayStringNumberValidator)
    multas:string;
}