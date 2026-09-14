import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

@Entity('monitoring_messages')
@Index(['patient_id'])
export class MonitoringMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 10 })
  from_actor: string; // 'patient' | 'nurse'

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'boolean', default: false })
  has_photo: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
