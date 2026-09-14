
# REVIGORAR — Sistema de gestão para cuidados com feridas e estomias

Sistema completo para profissionais de enfermagem/estomaterapia acompanharem
pacientes, feridas, avaliações, prescrições, estoque, agenda e monitoramento
remoto. Duas partes, no mesmo repositório:

- **`backend/`** — API REST em Node.js + Express + TypeORM + PostgreSQL.
- **`frontend/`** — aplicação React (Vite) que consome essa API.

Este é o único README do projeto: cobre o que o sistema faz, como ele é
organizado e o passo a passo para rodar tudo do zero na sua máquina.

---

## 1. Visão geral das telas

| Tela | O que faz |
|---|---|
| **Login / Cadastro** | Tela inicial sempre que não há sessão válida. Alterna entre "Entrar" e "Criar conta" (autenticação por e-mail e senha, JWT). |
| **Dashboard** | Pacientes ativos, avaliações do dia, pendências, próximos atendimentos, evolução semanal de agendamentos e distribuição de pacientes por tipo de cuidado. |
| **Pacientes** | Listar, cadastrar, editar e remover pacientes (data de nascimento, tipo de cuidado — ferida/estomia). |
| **Perfil do paciente** | Dados gerais, registros/histórico, evolução (linha do tempo), prontuário/documentos. |
| **Avaliações** | Lista de avaliações por paciente + formulário de avaliação de ferida (dados gerais, características, escalas clínicas, condutas). |
| **Evoluções** | Feed cronológico de tudo que acontece com os pacientes (avaliações, prescrições, fotos). |
| **Fotos** | Registro fotográfico por paciente. |
| **Prescrições** | Lista por paciente + quadro Kanban (Ativas/Concluídas) entre todos os pacientes, e catálogo de coberturas. |
| **Agenda** | Visualização semanal de atendimentos; criar, confirmar, cancelar, remover. |
| **Monitoramento remoto** | Chat com o paciente, pedido de nova foto, status de acompanhamento. |
| **Estoque** | Itens, quantidade, entradas/saídas com histórico de movimentação. |
| **Relatórios** | Gráficos de perfil de pacientes, evolução de feridas/estomias, uso de coberturas e indicadores clínicos (últimos 7 dias). |
| **Configurações** | Dados da instituição, usuários do sistema, integrações, segurança (senha/2FA/alertas de login) e backup dos dados. |

**Tudo listado acima está ligado ao backend de verdade** — não há mais telas
em modo mock. Se o backend estiver fora do ar ou o token expirar, cada tela
volta sozinha a mostrar dados de exemplo (comportamento de fallback que já
existia no projeto), então nada quebra com a API indisponível.

---

## 2. Pré-requisitos

- **Node.js** 18 ou superior (e npm)
- **PostgreSQL** 13 ou superior, rodando localmente (ou em um container)

---

## 3. Como rodar — passo a passo

### 3.1 Banco de dados

Crie um banco e um usuário no Postgres (ajuste os valores como preferir,
só precisam bater com o `.env` do passo seguinte):

```sql
CREATE USER revigorar WITH PASSWORD 'revigorar_dev_2026';
CREATE DATABASE revigorar_dev OWNER revigorar;
```

### 3.2 Backend

```bash
cd backend
cp .env.example .env      # ajuste DB_USER / DB_PASSWORD / DB_NAME se necessário
npm install
npm run db:sync           # cria/atualiza todas as tabelas a partir dos modelos
npm run dev                # sobe a API em http://localhost:3000
```

Variáveis do `.env` (`backend/.env.example`):

```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_USER=revigorar
DB_PASSWORD=revigorar_dev_2026
DB_NAME=revigorar_dev

JWT_SECRET=troque_por_um_segredo_forte_em_producao_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

> Em desenvolvimento o TypeORM está com `synchronize: true`, então qualquer
> mudança de schema (como as tabelas novas descritas mais abaixo) é criada
> automaticamente ao subir o backend — não é necessário escrever migração
> manual. `npm run db:sync` faz a mesma sincronização sem deixar o servidor
> no ar, útil para preparar o banco antes do primeiro `npm run dev`.

O backend cria a pasta `backend/uploads/` automaticamente na primeira vez
que alguém envia uma foto, documento ou roda um backup — não precisa criar
à mão.

### 3.3 Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev                 # sobe em http://localhost:5173
```

O frontend já vem configurado (`frontend/.env`) para falar com
`http://localhost:3000/api`. Se o backend rodar em outra porta/host, ajuste
`VITE_API_URL` nesse arquivo.

### 3.4 Criar sua conta

Não existe usuário/senha pré-cadastrado. Toda vez que o sistema é aberto sem
uma sessão válida, ele começa pela tela de **login** (`/login`) — nela dá
para alternar entre "Entrar" e "Criar conta". Depois de logar/cadastrar,
o acesso ao resto do sistema fica liberado até você sair.

**Sair da conta**: menu lateral → **Configurações** → aba **Segurança** →
botão **Sair da conta**, no final da página. Isso encerra a sessão local e
volta para a tela de login.

---

## 4. Estrutura do repositório

```
sistema-revigorar/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # monta middlewares e todas as rotas
│   │   ├── config/                # env, banco de dados, upload (multer)
│   │   ├── models/                # entidades TypeORM
│   │   ├── controllers/           # regras de negócio de cada recurso
│   │   ├── routes/                # mapeamento HTTP → controller
│   │   ├── middleware/            # auth (JWT) e tratamento de erros
│   │   └── database/sync.ts       # script de sincronização do schema
│   └── uploads/                   # fotos, documentos e backups gerados (git-ignored)
└── frontend/
    └── src/
        ├── pages/                 # uma pasta por tela
        ├── services/              # um arquivo por recurso, chama a API real
        │                          # e cai para dados de exemplo se ela falhar
        └── data/mockData.js       # dados de exemplo usados no fallback
```

Padrão de cada `services/*.js`: a função sempre tenta `apiClient.get/post/...`
primeiro; se der erro (rede, 401, backend fora do ar), `withFallback` devolve
os dados de exemplo automaticamente. Isso significa que o front-end funciona
para demonstração mesmo sem backend, e passa a usar dados reais assim que a
API responde.

---

## 5. Endpoints da API

Base: `http://localhost:3000/api` (todas as rotas abaixo, exceto login e
registro, exigem `Authorization: Bearer <token>`).

| Recurso | Rotas |
|---|---|
| Autenticação | `POST /auth/register`, `POST /auth/login`, `GET/PUT /auth/profile` |
| Pacientes | `GET/POST /patients`, `GET/PUT/DELETE /patients/:id` |
| Feridas | `GET/POST /wounds`, `GET/PUT/DELETE /wounds/:id` |
| Avaliações clínicas | `GET/POST /evaluations`, `GET/PUT/DELETE /evaluations/:id` |
| Avaliações (tela "Avaliações") | `GET /assessments`, `GET/PUT /patients/:id/wound-assessment[/:section]` |
| Evoluções | `GET /evolutions/feed`, `GET /patients/:id/records`, `GET /patients/:id/evolution-timeline` |
| Fotos | `GET /photos`, `GET/POST /patients/:id/photos` |
| Prescrições | `GET/POST /prescriptions`, `PUT/DELETE /prescriptions/:id`, `GET/POST /patients/:id/prescriptions`, `GET /dressing-catalog` |
| Documentos | `GET/POST /patients/:id/documents`, `GET /patients/:id/documents/:name/download` |
| Agenda | `GET/POST /appointments`, `PUT/DELETE /appointments/:id` |
| Monitoramento remoto | `GET/POST /patients/:id/monitoring/messages`, `POST /patients/:id/monitoring/request-photo`, `GET /patients/:id/monitoring/status` |
| Estoque | `GET/POST /stock`, `PUT/DELETE /stock/:id`, `POST /stock/movement` |
| Relatórios | `GET /reports`, `GET /reports/weekdays`, `GET /reports/distribution` |
| Dashboard | `GET /dashboard/stats`, `GET /dashboard/weekly-series`, `GET /dashboard/distribution` |
| Configurações | `GET/PUT /settings/institution`, `GET/POST/PUT/DELETE /users[/:id]`, `GET/PATCH /settings/integrations[/:name]`, `PUT /settings/security`, `GET/POST /settings/backup[/run]`, `PUT /settings/backup/frequency` |
| Especialidades | `GET /specialties` |

Fotos são servidas estaticamente em `GET /uploads/photos/<arquivo>`.
Documentos não têm URL pública — saem só pela rota autenticada de download.

---

## 6. Decisões de modelo e adaptações importantes

- **Idade do paciente**: o backend guarda `birth_date` (data de nascimento),
  não uma idade pronta. O formulário de paciente pede a data de nascimento,
  e a idade exibida nas telas é calculada a partir dela no front-end.
- **`care_type`** (`ferida`/`estomia`): campo próprio do paciente desde o
  cadastro (`backend/src/models/Patient.ts`), em vez de depender de já
  existir uma ferida (`Wound`) cadastrada.
- **Status em inglês**: pacientes, agendamentos e prescrições guardam status
  em inglês no banco (`active`, `confirmed`, `scheduled`...) — convertidos
  para português nas telas.
- **Estoque**: não existe endpoint para editar só a quantidade; toda
  alteração vira um lançamento em `POST /stock/movement`, preservando o
  histórico de entradas/saídas.
- **Avaliação de ferida (formulário livre)**: os campos das seções "Dados
  gerais", "Características", "Escalas clínicas" e "Condutas" são
  dinâmicos no front-end (não há um esquema fixo), então o backend guarda
  cada seção como um documento JSON (`assessment_sections`) em vez de
  colunas fixas.
- **Feed de evoluções**: não é uma tabela própria — é uma agregação em
  tempo real de avaliações clínicas, prescrições e fotos de cada paciente,
  ordenada por data.
- **Fotos e documentos**: ficam em disco (`backend/uploads/`), com o
  caminho salvo no banco. As fotos são servidas por uma rota estática
  simples (sem checagem de token por requisição de imagem); os documentos
  saem por uma rota de download autenticada.
- **Monitoramento remoto**: o "status" (ativo / próximo contato) é
  calculado a partir de dados reais já existentes — status do paciente e
  próximo agendamento — sem precisar de uma tabela nova só para isso.
- **Usuários do sistema (Configurações)**: como ainda não existe um fluxo
  de convite por e-mail, criar um usuário novo gera uma senha temporária
  aleatória no backend; a pessoa só consegue entrar depois que um fluxo de
  "esqueci minha senha" for implementado (próximo passo natural).
- **Backup**: é um backup real em nível de aplicação — exporta os dados da
  conta (pacientes, feridas, avaliações, agendamentos, estoque,
  prescrições, documentos) para um arquivo JSON salvo em
  `backend/uploads/backups/`. Não é um `pg_dump` do banco inteiro, mas é um
  backup de verdade dos dados do usuário, e fica registrado com data/hora
  em `backup_logs`.

---

## 7. Solução de problemas

- **Frontend mostra sempre dados de exemplo**: confira se o backend está
  rodando (`http://localhost:3000`) e se `frontend/.env` aponta para a URL
  certa. Erros de rede/401 caem automaticamente no fallback, então a tela
  não trava, mas também não avisa explicitamente — olhe o console do
  navegador para ver o erro real.
- **Erro de conexão com o Postgres**: confira `DB_HOST`, `DB_USER`,
  `DB_PASSWORD` e `DB_NAME` no `backend/.env` contra o que você criou no
  passo 3.1.
- **Coluna nova não aparece no banco** depois de atualizar o código: reinicie
  o backend (`npm run dev`) ou rode `npm run db:sync` — o `synchronize: true`
  do TypeORM só sincroniza o schema quando a aplicação sobe.
