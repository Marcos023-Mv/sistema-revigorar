import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './User';

@Entity('financial_records')
@Index(['user_id', 'recorded_date'])
export class FinancialRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 20 })
  type: string; // income, expense

  @Column({ length: 60 })
  category: string; // consultation, materials, rent, transport, other

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 30, nullable: true })
  payment_method: string; // cash, pix, credit, debit, transfer

  @Column({ length: 20, default: 'completed' })
  status: string; // pending, completed, cancelled

  @Column({ type: 'date' })
  recorded_date: Date;

  @Column('uuid', { nullable: true })
  patient_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, u => u.financial_records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
