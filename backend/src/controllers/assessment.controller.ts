import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Patient } from '../models/Patient';
import { Wound } from '../models/Wound';
import { Evaluation } from '../models/Evaluation';
import { AssessmentSection } from '../models/AssessmentSection';

// GET /assessments — cartões de avaliação por paciente (tela "Avaliações").
export async function listAssessments(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const patients = await AppDataSource.getRepository(Patient).find({ where: { user_id: userId }, order: { name: 'ASC' } });

    const data = await Promise.all(patients.map(async (p) => {
      const wound = await AppDataSource.getRepository(Wound).findOne({
        where: { patient_id: p.id }, order: { created_at: 'DESC' },
      });
      let lastEvalDate: Date | null = null;
      if (wound) {
        const lastEval = await AppDataSource.getRepository(Evaluation).findOne({
          where: { wound_id: wound.id }, order: { recorded_at: 'DESC' },
        });
        lastEvalDate = lastEval?.recorded_at || null;
      }
      return {
        id: p.id,
        name: p.name,
        birth_date: p.birth_date,
        care_type: p.care_type,
        status: p.status,
        location: wound?.location || null,
        last_eval: lastEvalDate,
        assessment_status: wound && (wound.status === 'healed' || wound.status === 'closed') ? 'completed' : 'active',
      };
    }));

    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

const sectionRepo = () => AppDataSource.getRepository(AssessmentSection);

// GET /patients/:patientId/wound-assessment
export async function getWoundAssessment(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await sectionRepo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
    });
    const data: Record<string, any> = {};
    for (const row of rows) data[row.section] = row.data;
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// PUT /patients/:patientId/wound-assessment/:section
export async function saveWoundAssessmentSection(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientId, section } = req.params;
    const userId = req.auth!.userId;

    let row = await sectionRepo().findOneBy({ patient_id: patientId, section });
    if (!row) {
      row = sectionRepo().create({ patient_id: patientId, user_id: userId, section, data: req.body });
    } else {
      row.data = { ...row.data, ...req.body };
    }
    await sectionRepo().save(row);
    res.json({ status: 'ok', data: row.data });
  } catch (err) { next(err); }
}
