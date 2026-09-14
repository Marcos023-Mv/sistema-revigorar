import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from './User';

@Entity('patients')
@Index(['user_id'])
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'date' })
  birth_date: Date;

  @Column({ length: 14, nullable: true })
  cpf: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 1, nullable: true })
  gender: string;

  @Column({ type: 'text', nullable: true })
  medical_history: string;

  @Column({ type: 'text', nullable: true })
  comorbidities: string;

  @Column({ type: 'text', nullable: true })
  medications: string;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ length: 255, nullable: true })
  insurance_provider: string;

  @Column({ length: 100, nullable: true })
  insurance_number: string;

  @Column({ length: 30, default: 'active' })
  status: string;

  // Tipo de cuidado principal do paciente (usado nas telas do front-end).
  // Guardado aqui, no paciente, em vez de depender da primeira ferida
  // cadastrada — assim a lista de pacientes mostra o tipo mesmo antes de
  // qualquer avaliação de ferida existir.
  @Column({ length: 20, default: 'ferida' })
  care_type: string; // 'ferida' | 'estomia'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, u => u.patients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany('Wound', 'patient')
  wounds: any[];

  @OneToMany('Appointment', 'patient')
  appointments: any[];
}
