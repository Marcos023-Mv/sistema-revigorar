import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from './User';

@Entity('stock_items')
@Index(['user_id'])
export class StockItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 10 })
  unit: string; // un, cm, ml, g

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  min_quantity: number;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  unit_cost: number;

  @Column({ length: 60, nullable: true })
  category: string; // dressing, medication, equipment, consumable

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, u => u.stock_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany('StockMovement', 'item')
  movements: any[];
}
