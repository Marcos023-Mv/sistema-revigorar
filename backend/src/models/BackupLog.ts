import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('backup_logs')
@Index(['user_id'])
export class BackupLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 30, default: 'completed' })
  status: string;

  @Column({ length: 500, nullable: true })
  file_path: string;

  @CreateDateColumn()
  created_at: Date;
}
