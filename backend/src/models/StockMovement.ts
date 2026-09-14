import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { StockItem } from './StockItem';

@Entity('stock_movements')
@Index(['item_id'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  item_id: string;

  @Column({ length: 10 })
  direction: string; // in, out

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @Column({ length: 255, nullable: true })
  reason: string;

  @Column('uuid', { nullable: true })
  evaluation_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => StockItem, s => s.movements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: StockItem;
}
