import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config'
import {TypeOrmModule} from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module';
import { SeedsModule } from './seeds/seeds.module';
import { ManagerModule } from './manager/manager.module';
import { MedidoresModule } from './medidores-agua/medidores.module';
import { PagosDeServicioModule } from './pagos-de-servicio/pagos-de-servicio.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type:     'postgres',
      host:     process.env.DB_HOST,
      port:     +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,

      autoLoadEntities:true,
      synchronize:true //PARA PRODUCCION EN false
    }
    ),
    ScheduleModule.forRoot(),
    ManagerModule,
    AuthModule,
    SeedsModule,
    MedidoresModule,
    PagosDeServicioModule,
  ],
})
export class AppModule {}
