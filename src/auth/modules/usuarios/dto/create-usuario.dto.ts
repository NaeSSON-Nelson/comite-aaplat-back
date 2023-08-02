import { IsArray, IsEmail, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Estado } from 'src/interfaces/enum/enum-entityes';

export class CreateUsuarioDto {
  @IsArray()
  @IsInt({ each: true })
  roles: number[];

  @IsString()
  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsEnum(Estado)
  @IsOptional()
  estado?: Estado;
}
