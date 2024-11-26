import { IsNumber, IsEnum, IsOptional, IsString, MinLength, MaxLength, Min, } from 'class-validator';
import { IsValidName } from 'src/common/class-validators-personal/IsNameValid';
import { MetodoPago, Monedas } from "src/interfaces/enum/enum-entityes";

export class RegistrarPagoAfiliacionPresencialDto{
    @IsNumber()
    perfilId:number;
    @IsEnum(MetodoPago)
    metodoPago:MetodoPago;
    @IsNumber()
    montoRecibido:number;
    @IsEnum(Monedas)
    monedaRecibido:Monedas;
}

export class RegistrarPagoAfiliacionDepositoDto{
    @IsNumber()
    perfilId:number;
    @IsEnum(MetodoPago)
    metodoPago:MetodoPago;
    @IsString()
    @MinLength(10)
    @MaxLength(50)
    entidad:string;
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    nroRecibo:string;
    @MinLength(5)
    @MaxLength(90)
    @IsValidName()
    remitente:string;
    @MinLength(2)
    @MaxLength(15)
    nroCuenta:string;
    @IsNumber()
    @Min(0)
    montoRecibido:number;
    @IsEnum(Monedas)
    monedaRecibido:Monedas;

}