import { IsArray, IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePerfilUsuarioDto {


  @IsString()
  @IsOptional()
  nombreUsuario?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  codigoPostal?: string;

  @IsString({each:true})
  @IsArray()
  @IsOptional()
  contactos?: string[];

  @IsString() 
  @IsOptional() 
  direccion?:string;
  
  @IsInt()
  @Min(0) 
  @IsOptional() 
  estado?:number;


  //TODO: DATOS PARA GEOLOCALICACION
  @IsString() 
  @IsOptional() 
  longitud?:string;

  @IsString() 
  @IsOptional() 
  latitud?:string;

  
}
