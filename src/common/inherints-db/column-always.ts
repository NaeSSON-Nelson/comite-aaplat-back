import {Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Estado } from '../../interfaces/enum/enum-entityes';

export abstract  class ColumnsAlways {
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        select:false
      })
      created_at: Date;
    
      @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
        select:false
      })
      updated_at: Date;

      @Column({
        type:'bool',
        default:true,
      })
      isActive: boolean;

      @Column({
        type:"enum",
        enum:Estado,
        default:Estado.ACTIVO
      })
      estado:Estado;
}