import { Module } from '@nestjs/common';
import { MedidoresController } from './medidores.controller';
import { MedidoresService } from './medidores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medidor } from './entities/medidor.entity';
import { LecturaMedidor } from './entities/lectura-medidor.entity';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [MedidoresController],
  providers: [MedidoresService],
  imports: [
    TypeOrmModule.forFeature([Medidor, LecturaMedidor]),
    AuthModule,
    CommonModule,
  ],
  exports: [TypeOrmModule, MedidoresService],
})
export class MedidoresModule {}
