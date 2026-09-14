import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

@Entity('prescriptions')
@Index(['patient_id'])
@Index(['user_id', 'status'])
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 60 })
  type: string; // Enfermagem, Medicamento, Nutrição, Estomia...

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 20, default: 'active' })
  status: string; // active, completed

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
