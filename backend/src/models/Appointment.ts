import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './User';
import { Patient } from './Patient';

@Entity('appointments')
@Index(['user_id', 'scheduled_at'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  patient_id: string;

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @Column({ type: 'smallint', default: 60 })
  duration_min: number;

  @Column({ length: 30, default: 'scheduled' })
  status: string; // scheduled, confirmed, completed, cancelled, no_show

  @Column({ length: 30, default: 'clinic' })
  location_type: string; // clinic, home, telehealth

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 60, nullable: true })
  procedure_type: string; // evaluation, dressing_change, laser, stomia, follow_up

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, u => u.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Patient, p => p.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
