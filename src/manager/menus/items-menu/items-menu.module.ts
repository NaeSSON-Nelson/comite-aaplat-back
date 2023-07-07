import { Module } from '@nestjs/common';
import { ItemsMenuService } from './items-menu.service';
import { ItemsMenuController } from './items-menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsToMenuModule } from '../items-to-menu/items-to-menu.module';
import { CommonModule } from '../../../common/common.module';
import { ItemMenu } from './entities/item-menu.entity';
import { AuthModule } from '../../../auth/auth.module';

@Module({
  providers: [ItemsMenuService],
  controllers: [ItemsMenuController],
  imports:[
    TypeOrmModule.forFeature([
      ItemMenu,
    ]),
    ItemsToMenuModule,
    CommonModule,
    AuthModule,
  ],
  exports:[
    TypeOrmModule,
    ItemsMenuService
  ]
})
export class ItemsMenuModule {}
