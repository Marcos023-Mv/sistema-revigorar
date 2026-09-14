import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { Wound } from './Wound';

@Entity('evaluations')
@Index(['wound_id'])
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  wound_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  length_cm: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  width_cm: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  depth_cm: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  area_cm2: number;

  // Wound bed composition (%)
  @Column({ type: 'smallint', default: 0 })
  granulation_pct: number;

  @Column({ type: 'smallint', default: 0 })
  slough_pct: number;

  @Column({ type: 'smallint', default: 0 })
  necrosis_pct: number;

  @Column({ type: 'smallint', default: 0 })
  epithelialization_pct: number;

  @Column({ type: 'smallint', default: 0 })
  exudate_level: number; // 0=none 1=scant 2=moderate 3=heavy

  @Column({ length: 30, nullable: true })
  exudate_type: string; // serous, sanguineous, purulent, mixed

  @Column({ type: 'boolean', default: false })
  has_odor: boolean;

  @Column({ type: 'boolean', default: false })
  signs_infection: boolean;

  @Column({ type: 'text', nullable: true })
  wound_border: string;

  @Column({ type: 'text', nullable: true })
  periwound_skin: string;

  @Column({ type: 'text', nullable: true })
  dressing_used: string;

  @Column({ type: 'text', nullable: true })
  clinical_notes: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  recorded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Wound, w => w.evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wound_id' })
  wound: Wound;

  @OneToMany('WoundPhoto', 'evaluation')
  photos: any[];

  @OneToMany('ClinicalScale', 'evaluation')
  scales: any[];
}
