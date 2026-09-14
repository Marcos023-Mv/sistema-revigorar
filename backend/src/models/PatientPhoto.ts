import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

// Registro fotográfico livre do paciente (tela "Fotos"), independente de
// uma avaliação de ferida formal. Para fotos anexadas a uma avaliação
// clínica específica, ver WoundPhoto.
@Entity('patient_photos')
@Index(['patient_id'])
export class PatientPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 500 })
  file_path: string;

  @Column({ type: 'int', nullable: true })
  file_size: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
