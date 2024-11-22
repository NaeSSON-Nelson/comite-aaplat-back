import { IsNumber, IsNumberString, Min, MinLength } from "class-validator";

export class UploadProfileImage {


    @IsNumberString()
    @MinLength(1)
    id:string;


}