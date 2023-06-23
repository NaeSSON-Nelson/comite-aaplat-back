import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePerfilUsuarioDto {
  @IsString()
  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  codigoPostal?: string;

  @IsString()
  @IsOptional()
  contactos?: string[];

  @IsString() 
  @IsOptional() 
  direccion?:string;


  //TODO: DATOS PARA GEOLOCALICACION
  @IsString() 
  @IsOptional() 
  longitud?:string;

  @IsString() 
  @IsOptional() 
  latitud?:string;

  
}
