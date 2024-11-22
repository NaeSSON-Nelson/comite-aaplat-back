import { IsArray, IsEmpty, IsNotEmpty, IsNumber,ArrayUnique, IsString, Matches, MinLength, Min } from "class-validator";

export class PagosServicesDto {


    @IsNumber({allowNaN:false,allowInfinity:false})
    @IsNotEmpty()
    perfilId:number;
    // @IsString()
    // @IsNotEmpty()
    // @Matches(/^[a-zA-ZñÑ\sáéíóúÁÉÍÓÚüÜ]*$/gm,{
    //     message:'EL CAMPO CONTIENE CARACTERES INVALIDOS'
    // })
    // @MinLength(3)
    // titular:string;
    // @IsString()
    // @MinLength(3)
    // @IsNotEmpty()
    // ciTitular:string;
    /*
    * AÑADIR DESPUES LOS COMPROBANTES POR PAGAR ADICIONALES, AÑADIENDO A LA ENTIDAD LA COLUMNA TIPOTARIFA = 'PRINCIPAL' || 'ADICIONAL'
    * DE ACUERDO A AL TIPO SE REGISTRARA EL COMPROBANTE POR PAGAR O COMPROBANTE ADICIONAL
    */
   @IsArray()
   @IsNumber({allowNaN:false,allowInfinity:false},{each:true,})
   @IsNotEmpty({each:true})
   @ArrayUnique({
   })
    comprobantes:number[];
   @IsArray()
   @IsNumber({allowNaN:false,allowInfinity:false},{each:true,})
   @IsNotEmpty({each:true})
   @ArrayUnique({
   })
    multas:number[];
}
