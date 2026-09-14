import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

@Entity('wounds')
@Index(['patient_id'])
export class Wound {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 60 })
  etiology: string; // pressure, vascular, diabetic, surgical, traumatic, other

  @Column({ length: 255 })
  location: string;

  @Column({ length: 10, nullable: true })
  laterality: string; // left, right, bilateral, center

  @Column({ type: 'jsonb', nullable: true })
  body_map: any; // { region, x, y }

  @Column({ length: 30, default: 'active' })
  status: string; // active, healing, healed, closed

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  initial_length_cm: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  initial_width_cm: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  initial_depth_cm: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  onset_date: Date;

  @Column({ type: 'date', nullable: true })
  healed_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Patient, p => p.wounds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToMany('Evaluation', 'wound')
  evaluations: any[];
}
