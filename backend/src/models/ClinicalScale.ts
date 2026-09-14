import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Evaluation } from './Evaluation';

@Entity('clinical_scales')
@Index(['evaluation_id'])
export class ClinicalScale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  evaluation_id: string;

  @Column({ length: 30 })
  scale_type: string; // PUSH, RESVECH, Braden, Wagner, SACS, TIMERS

  @Column({ type: 'smallint' })
  total_score: number;

  @Column({ length: 60, nullable: true })
  risk_level: string; // e.g. "alto risco", "grau 2"

  @Column({ type: 'jsonb', nullable: true })
  items: any; // individual item scores per scale

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Evaluation, e => e.scales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;
}
