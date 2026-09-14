import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Evaluation } from './Evaluation';

@Entity('wound_photos')
@Index(['evaluation_id'])
export class WoundPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  evaluation_id: string;

  @Column({ length: 500 })
  file_path: string;

  @Column({ length: 500, nullable: true })
  thumbnail_path: string;

  @Column({ type: 'smallint', default: 0 })
  sort_order: number;

  @Column({ length: 30, nullable: true })
  angle: string;

  @Column({ type: 'int', nullable: true })
  file_size: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Evaluation, e => e.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;
}
