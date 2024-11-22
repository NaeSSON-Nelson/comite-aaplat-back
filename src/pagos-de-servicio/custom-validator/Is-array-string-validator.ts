import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({name:'IsArrayString',async:false})
@Injectable()
export class IsArrayStringNumberValidator implements ValidatorConstraintInterface {
    validate(value: string, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
        try {
            
            const parse = JSON.parse(value);
            for(const val of parse){
                if(!Number.isInteger(val)){
                    return false;
                }
            }
            return true;
        } catch (error) {
            return false;
        }
    }
    defaultMessage?(validationArguments?: ValidationArguments): string {
        return 'The String is not a Array string'
    }

    
}