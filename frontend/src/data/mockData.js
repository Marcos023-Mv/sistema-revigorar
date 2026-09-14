export const CURRENT_USER = {
  name: 'Ana Silva',
  role: 'Enfermeira',
  initials: 'AS',
}

export const PATIENTS = [
  { id: 1, name: 'Maria Santos', age: 67, type: 'Ferida', status: 'Ativo', lastEval: '12/09/2025' },
  { id: 2, name: 'João Almeida', age: 82, type: 'Estomia', status: 'Ativo', lastEval: '11/09/2025' },
  { id: 3, name: 'Carla Souza', age: 54, type: 'Ferida', status: 'Ativo', lastEval: '10/09/2025' },
  { id: 4, name: 'Antônio Lima', age: 76, type: 'Estomia', status: 'Ativo', lastEval: '09/09/2025' },
  { id: 5, name: 'Beatriz Rocha', age: 68, type: 'Ferida', status: 'Ativo', lastEval: '08/09/2025' },
  { id: 6, name: 'Roberto Dias', age: 71, type: 'Estomia', status: 'Ativo', lastEval: '07/09/2025' },
  { id: 7, name: 'Luciana Alves', age: 59, type: 'Ferida', status: 'Ativo', lastEval: '06/09/2025' },
]

export const UPCOMING = [
  { name: 'Maria Santos', detail: 'Ferida | 09:00', status: 'Confirmado' },
  { name: 'João Almeida', detail: 'Estomia | 10:30', status: 'Confirmado' },
  { name: 'Carla Souza', detail: 'Ferida | 14:00', status: 'Pendente' },
]

export const WEEKLY_SERIES = [30, 34, 32, 38, 41, 39, 48]
export const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export const DISTRIBUTION = [
  { label: 'Feridas', value: 45, color: 'var(--color-primary)' },
  { label: 'Estomias', value: 30, color: 'var(--color-primary-light)' },
  { label: 'Outros', value: 25, color: 'var(--color-accent-soft)' },
]

export const PATIENT_DOCUMENTS = [
  { name: 'Termo de consentimento.pdf', date: '02/08/2025', size: '210 KB' },
  { name: 'Laudo fotográfico - agosto.pdf', date: '28/08/2025', size: '1,4 MB' },
  { name: 'Receituário - hidrogel.pdf', date: '05/09/2025', size: '96 KB' },
  { name: 'Encaminhamento médico.pdf', date: '10/09/2025', size: '150 KB' },
]

export const PATIENT_RECORDS = [
  { date: '12/09/2025', type: 'Avaliação clínica', professional: 'Ana Silva', description: 'Avaliação de ferida em membro inferior direito.' },
  { date: '05/09/2025', type: 'Evolução fotográfica', professional: 'Ana Silva', description: 'Registro fotográfico de acompanhamento.' },
  { date: '28/08/2025', type: 'Prescrição', professional: 'Ana Silva', description: 'Troca de cobertura com hidrogel.' },
  { date: '20/08/2025', type: 'Avaliação clínica', professional: 'Fernanda Costa', description: 'Avaliação inicial de estomia.' },
]

export const DRESSING_CATALOG = [
  { name: 'Hidrogel', indication: 'Feridas com tecido necrótico ou esfacelo, pouco exsudativas.', frequency: 'Troca a cada 24–72h' },
  { name: 'Espuma de poliuretano', indication: 'Feridas com exsudato moderado a intenso.', frequency: 'Troca a cada 3–7 dias' },
  { name: 'Alginato de cálcio', indication: 'Feridas altamente exsudativas ou com sangramento leve.', frequency: 'Troca a cada 1–3 dias' },
  { name: 'Filme transparente', indication: 'Proteção de pele íntegra ou feridas superficiais.', frequency: 'Troca a cada 5–7 dias' },
  { name: 'Carvão ativado com prata', indication: 'Feridas com odor e sinais de infecção.', frequency: 'Troca a cada 2–3 dias' },
]

export const SYSTEM_USERS = [
  { name: 'Ana Silva', email: 'ana.silva@revigorar.com', role: 'Enfermeira', status: 'Ativo' },
  { name: 'Fernanda Costa', email: 'fernanda.costa@revigorar.com', role: 'Estomaterapeuta', status: 'Ativo' },
  { name: 'Lucas Almeida', email: 'lucas.almeida@revigorar.com', role: 'Administrador', status: 'Ativo' },
  { name: 'Rafael Martins', email: 'rafael.martins@revigorar.com', role: 'Suporte', status: 'Inativo' },
]

export const INTEGRATIONS = [
  { name: 'WhatsApp Business API', description: 'Envio de notificações e lembretes por WhatsApp.', enabled: true },
  { name: 'E-mail transacional', description: 'Envio de relatórios e confirmações por e-mail.', enabled: true },
  { name: 'Backup automático na nuvem', description: 'Cópia de segurança diária dos dados do sistema.', enabled: false },
  { name: 'Assinatura digital de documentos', description: 'Assinatura eletrônica de laudos e termos.', enabled: false },
]
