import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { User } from './models/User';
import { Patient } from './models/Patient';
import { Wound } from './models/Wound';
import { Evaluation } from './models/Evaluation';
import { Appointment } from './models/Appointment';
import { FinancialRecord } from './models/FinancialRecord';
import { StockItem } from './models/StockItem';
import { StockMovement } from './models/StockMovement';
import logger from './utils/logger';

async function test() {
  await AppDataSource.initialize();
  logger.info('✓ DB conectado');

  // 1. Criar usuário
  const userRepo = AppDataSource.getRepository(User);
  const user = new User();
  user.full_name = 'Dra. Ana Silva';
  user.email = 'ana.test@revigorar.com';
  user.phone = '85999991234';
  user.professional_license = 'COREN-CE 123456';
  user.specialization = 'Estomaterapia';
  await user.setPassword('Senha@123');
  await userRepo.save(user);
  logger.info(`✓ Usuário criado: ${user.id}`);

  // Verificar senha
  const valid = await user.checkPassword('Senha@123');
  logger.info(`✓ Senha validada: ${valid}`);

  // 2. Criar paciente
  const patientRepo = AppDataSource.getRepository(Patient);
  const patient = patientRepo.create({
    user_id: user.id,
    name: 'Maria Santos Silva',
    birth_date: '1959-03-15' as any,
    gender: 'F',
    phone: '85988887777',
    comorbidities: 'Diabetes tipo 2, Hipertensão',
    medications: 'Metformina 850mg, Losartana 50mg',
  });
  await patientRepo.save(patient);
  logger.info(`✓ Paciente criado: ${patient.id} - ${patient.name}`);

  // 3. Criar ferida
  const woundRepo = AppDataSource.getRepository(Wound);
  const wound = woundRepo.create({
    patient_id: patient.id,
    user_id: user.id,
    etiology: 'pressure',
    location: 'Sacro',
    laterality: 'center',
    body_map: { region: 'sacrum', x: 150, y: 280 },
    initial_length_cm: 8.0,
    initial_width_cm: 6.0,
    initial_depth_cm: 1.5,
    description: 'Úlcera por pressão estágio III',
    onset_date: '2026-07-20' as any,
  });
  await woundRepo.save(wound);
  logger.info(`✓ Ferida criada: ${wound.id} - ${wound.etiology} em ${wound.location}`);

  // 4. Criar avaliação
  const evalRepo = AppDataSource.getRepository(Evaluation);
  const ev = evalRepo.create({
    wound_id: wound.id,
    user_id: user.id,
    description: 'Leito com predomínio de granulação, esfacelo superficial em quadrante inferior. Sem sinais de infecção.',
    length_cm: 6.5,
    width_cm: 4.8,
    area_cm2: 6.5 * 4.8,
    granulation_pct: 65,
    slough_pct: 18,
    necrosis_pct: 7,
    epithelialization_pct: 10,
    exudate_level: 1,
    exudate_type: 'serous',
    dressing_used: 'Espuma Mepilex Border Sacrum',
  });
  await evalRepo.save(ev);
  logger.info(`✓ Avaliação criada: ${ev.id} - Área: ${ev.area_cm2}cm²`);

  // 5. Criar agendamento
  const apptRepo = AppDataSource.getRepository(Appointment);
  const appt = apptRepo.create({
    user_id: user.id,
    patient_id: patient.id,
    scheduled_at: new Date('2026-09-15T14:00:00'),
    duration_min: 45,
    status: 'confirmed',
    location_type: 'home',
    procedure_type: 'dressing_change',
    notes: 'Levar espuma Mepilex extra',
  });
  await apptRepo.save(appt);
  logger.info(`✓ Agendamento criado: ${appt.id} - ${appt.scheduled_at}`);

  // 6. Criar registro financeiro
  const finRepo = AppDataSource.getRepository(FinancialRecord);
  const income = finRepo.create({
    user_id: user.id,
    type: 'income',
    category: 'consultation',
    amount: 350.00,
    description: 'Atendimento domiciliar - Maria Santos',
    payment_method: 'pix',
    recorded_date: '2026-09-12' as any,
    patient_id: patient.id,
  });
  await finRepo.save(income);
  logger.info(`✓ Financeiro criado: R$ ${income.amount} - ${income.category}`);

  // 7. Criar item de estoque
  const stockRepo = AppDataSource.getRepository(StockItem);
  const item = stockRepo.create({
    user_id: user.id,
    name: 'Espuma Mepilex Border 10x10cm',
    unit: 'un',
    quantity: 12,
    min_quantity: 5,
    expiry_date: '2027-06-30' as any,
    unit_cost: 45.90,
    category: 'dressing',
  });
  await stockRepo.save(item);
  logger.info(`✓ Estoque criado: ${item.name} - ${item.quantity} ${item.unit}`);

  // 8. Criar movimentação de estoque
  const movRepo = AppDataSource.getRepository(StockMovement);
  const mov = movRepo.create({
    item_id: item.id,
    direction: 'out',
    quantity: 1,
    reason: 'Uso em atendimento - Maria Santos',
    evaluation_id: ev.id,
  });
  await movRepo.save(mov);
  item.quantity = parseFloat(String(item.quantity)) - 1;
  await stockRepo.save(item);
  logger.info(`✓ Movimentação: -1 ${item.unit} → Estoque atual: ${item.quantity}`);

  // RESUMO
  logger.info('');
  logger.info('══════════════════════════════════════════');
  logger.info('  REVIGORAR — Teste de integração OK! ✓');
  logger.info('══════════════════════════════════════════');
  logger.info('');
  logger.info(`  Usuário:      ${user.full_name} (${user.email})`);
  logger.info(`  Paciente:     ${patient.name}`);
  logger.info(`  Ferida:       ${wound.etiology} — ${wound.location}`);
  logger.info(`  Avaliação:    ${ev.granulation_pct}% gran, ${ev.slough_pct}% esf, ${ev.area_cm2}cm²`);
  logger.info(`  Agenda:       ${appt.scheduled_at} (${appt.location_type})`);
  logger.info(`  Financeiro:   R$ ${income.amount} (${income.payment_method})`);
  logger.info(`  Estoque:      ${item.name}: ${item.quantity}/${item.min_quantity} ${item.unit}`);
  logger.info('');

  // Contar registros em cada tabela
  const counts = await Promise.all([
    userRepo.count(),
    patientRepo.count(),
    woundRepo.count(),
    evalRepo.count(),
    apptRepo.count(),
    finRepo.count(),
    stockRepo.count(),
    movRepo.count(),
  ]);
  const tables = ['users','patients','wounds','evaluations','appointments','financial','stock_items','stock_movements'];
  logger.info('  Registros no banco:');
  tables.forEach((t, i) => logger.info(`    ${t}: ${counts[i]}`));

  await AppDataSource.destroy();
  process.exit(0);
}

test().catch(err => {
  logger.error('Erro no teste:', err);
  process.exit(1);
});
