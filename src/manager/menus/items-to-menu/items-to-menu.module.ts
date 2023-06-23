import { Module } from '@nestjs/common';
import { ItemsToMenuService } from './items-to-menu.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemToMenu } from './entities/item-to-menu.entity';

@Module({
  providers: [ItemsToMenuService],
  imports:[
    TypeOrmModule.forFeature([
      ItemToMenu
    ])
  ],
  exports:[
    TypeOrmModule,
    ItemsToMenuService
  ]
})
export class ItemsToMenuModule {}
