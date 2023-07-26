import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator((data,ctx:ExecutionContext)=>{

    const req = ctx.switchToHttp().getRequest();
    const usuario = req.user;
    // console.log(req);
    if(!usuario) throw new InternalServerErrorException(`User not found`);

    return data?usuario[data]:usuario;
});