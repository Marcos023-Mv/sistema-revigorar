import { DataSource } from 'typeorm';
import { env } from './env';

import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { Wound } from '../models/Wound';
import { Evaluation } from '../models/Evaluation';
import { WoundPhoto } from '../models/WoundPhoto';
import { ClinicalScale } from '../models/ClinicalScale';
import { FinancialRecord } from '../models/FinancialRecord';
import { Appointment } from '../models/Appointment';
import { StockItem } from '../models/StockItem';
import { StockMovement } from '../models/StockMovement';
import { Specialty } from '../models/Specialty';
import { Prescription } from '../models/Prescription';
import { PatientPhoto } from '../models/PatientPhoto';
import { PatientDocument } from '../models/PatientDocument';
import { MonitoringMessage } from '../models/MonitoringMessage';
import { AssessmentSection } from '../models/AssessmentSection';
import { Institution } from '../models/Institution';
import { Integration } from '../models/Integration';
import { BackupLog } from '../models/BackupLog';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  synchronize: env.isDev,
  logging: env.isDev ? ['error', 'warn'] : ['error'],
  entities: [
    User,
    Patient,
    Wound,
    Evaluation,
    WoundPhoto,
    ClinicalScale,
    FinancialRecord,
    Appointment,
    StockItem,
    StockMovement,
    Specialty,
    Prescription,
    PatientPhoto,
    PatientDocument,
    MonitoringMessage,
    AssessmentSection,
    Institution,
    Integration,
    BackupLog,
  ],
  migrations: [__dirname + '/../database/migrations/*.ts'],
});
