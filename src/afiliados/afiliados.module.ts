import { Module } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { AfiliadosController } from './afiliados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Afiliado } from './entities/afiliado.entity';
import { Medidor } from './medidores/entities/medidor.entity';
import { MedidoresService } from './medidores/medidores.service';
import { MedidoresController } from './medidores/medidores.controller';
import { LecturaMedidor } from './medidores/entities/lectura-medidor.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [AfiliadosController,MedidoresController],
  providers: [AfiliadosService,MedidoresService],
  imports:[
    TypeOrmModule.forFeature([
      Afiliado,
      Medidor,
      LecturaMedidor
    ]),
    CommonModule,
  ],
  exports:[
    TypeOrmModule,
    AfiliadosService
  ]
})
export class AfiliadosModule {}
