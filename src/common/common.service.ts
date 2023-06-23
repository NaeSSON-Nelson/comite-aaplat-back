import { Injectable, InternalServerErrorException,BadRequestException } from '@nestjs/common';

@Injectable()
export class CommonService {
    

    handbleDbErrors(error): never {
        //ERROR DE LLAVE DUPLICADA
        if (error.code === '23505')
          throw new BadRequestException({
            OK:false,
            msg: 'Se esta intentado registrar un nombre duplicado',
            details: error.detail,
          });
        else  if (error.code === '23503')
          throw new BadRequestException({
            OK:false,
            msg: 'Se esta registrando un registro valor que no existe',
            details: error.detail,
          }); 
          
        console.log(error);
        throw new InternalServerErrorException('Check server logs');
      }
}
