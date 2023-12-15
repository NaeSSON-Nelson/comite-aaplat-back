import { UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export function RefreshToken(){
    return applyDecorators(
        // ItemMenuProtected(...items),
        UseGuards(AuthGuard('jwt-refresh'))
    )
}