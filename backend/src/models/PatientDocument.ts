import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

@Entity('patient_documents')
@Index(['patient_id'])
export class PatientDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 255 })
  name: string;

  // Pode ficar vazio quando o documento é criado apenas com metadados
  // (nome), sem um arquivo real anexado ainda.
  @Column({ length: 500, nullable: true })
  file_path: string;

  @Column({ type: 'int', nullable: true })
  file_size: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
