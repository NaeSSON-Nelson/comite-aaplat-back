import { Type } from 'class-transformer';
import { IsIn, IsObject, IsOptional, IsString, ValidateNested, IsBooleanString, IsNotEmpty, IsNotEmptyObject } from 'class-validator';



export class QueryExportPerfil {

    @IsBooleanString()
    id:string;

    @IsBooleanString()
    nombrePrimero:string;

    @IsBooleanString()
    nombreSegundo:string;

    @IsBooleanString()
    apellidoPrimero:string;

    @IsBooleanString()
    apellidoSegundo:string;

    @IsBooleanString()
    CI:string;

    @IsBooleanString()
    genero:string;

    @IsBooleanString()
    profesion:string;

    @IsBooleanString()
    fechaNacimiento:string;

    @IsBooleanString()
    tipoPerfil:string;

    @IsBooleanString()
    direccion:string;

    @IsBooleanString()
    contacto:string;

    @IsBooleanString()
    @IsOptional()
    afiliado?:string;
    
    @IsBooleanString()
    @IsOptional()
    isActive?:string;

    @IsBooleanString()
    @IsOptional()
    isAfiliado?:string;

    @IsIn(['ASC', 'DESC'])
    @IsString()
    @IsOptional()
    order?: 'ASC' | 'DESC'; //EL ORDEN QUE VENDRAN
    
    @IsIn(['id', 'nombrePrimero','apellidoPrimero','CI','genero','fechaNacimiento'])
    @IsString()
    @IsOptional()
    sort?:string; // POR EL TIPO DE CAMPO A ORDENAR
}