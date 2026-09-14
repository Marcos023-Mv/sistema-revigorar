import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

// Guarda, em jsonb, os campos de cada seção do formulário livre de
// "Avaliação da ferida" (Dados gerais, Avaliação da ferida, Características,
// Escalas clínicas, Condutas). O formulário do front-end é dinâmico
// (FormData → chave/valor), então persistimos como documento em vez de
// colunas fixas.
@Entity('assessment_sections')
@Index(['patient_id', 'section'], { unique: true })
export class AssessmentSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 60 })
  section: string; // 'Dados gerais', 'Avaliação da ferida', ...

  @Column({ type: 'jsonb' })
  data: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
