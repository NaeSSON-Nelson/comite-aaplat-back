import { IsString, MinLength } from "class-validator";

export class LoginUserDto{
    @IsString() @MinLength(3)
    userName:string;
    @IsString() @MinLength(6)
    password:string;
}