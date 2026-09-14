import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import { PATIENTS } from '../../data/mockData.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { saveWoundAssessmentSection } from '../../services/assessmentsService.js'
import './WoundAssessment.css'

const SUBNAV = ['Dados gerais', 'Avaliação da ferida', 'Características', 'Escalas clínicas', 'Condutas']

export default function WoundAssessment() {
  const { id } = useParams()
  const [section, setSection] = useState('Avaliação da ferida')
  const [formKey, setFormKey] = useState(0)
  const patient = PATIENTS.find((p) => String(p.id) === id) || PATIENTS[0]
  const showToast = useToast()

  const handleSave = async (e, label) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    await saveWoundAssessmentSection(patient.id, section, data)
    showToast(`${label} salvo com sucesso.`)
  }

  const handleCancel = () => {
    setFormKey((k) => k + 1)
    showToast('Alterações descartadas.')
  }

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Pacientes', to: '/pacientes' },
          { label: patient.name, to: `/pacientes/${patient.id}` },
          { label: 'Avaliação da ferida' },
        ]}
      />

      <div className="wound-layout">
        <nav className="wound-subnav panel">
          {SUBNAV.map((item) => (
            <button
              key={item}
              className={section === item ? 'is-active' : ''}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <form className="panel wound-form" key={`${section}-${formKey}`} onSubmit={(e) => handleSave(e, section)}>
          {section === 'Dados gerais' && (
            <>
              <h3 className="panel-title">Dados gerais</h3>

              <div className="form-grid">
                <div className="form-field">
                  <label>Diagnóstico</label>
                  <input name="diagnostico" defaultValue="Úlcera venosa" />
                </div>
                <div className="form-field">
                  <label>Data de início do tratamento</label>
                  <input name="data_de_inicio_do_tratamento" type="date" defaultValue="2025-07-15" />
                </div>
                <div className="form-field">
                  <label>Convênio</label>
                  <select name="convenio" defaultValue="Particular">
                    <option>Particular</option>
                    <option>SUS</option>
                    <option>Convênio médico</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Profissional responsável</label>
                  <input name="profissional_responsavel" defaultValue="Ana Silva" />
                </div>
                <div className="form-field">
                  <label>Frequência de avaliação</label>
                  <select name="frequencia_de_avaliacao" defaultValue="Semanal">
                    <option>Diária</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Histórico clínico relevante</label>
                <textarea name="historico_clinico_relevante" rows={3} defaultValue="Paciente diabética, hipertensa controlada. Sem alergias conhecidas." />
              </div>

              <div className="wound-form__actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </>
          )}

          {section === 'Avaliação da ferida' && (
            <>
              <h3 className="panel-title">Avaliação da ferida</h3>

              <div className="form-field">
                <label>Localização</label>
                <input name="localizacao" defaultValue="Membro inferior direito" />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Comprimento (cm)</label>
                  <input name="comprimento_cm" defaultValue="4,2" />
                </div>
                <div className="form-field">
                  <label>Largura</label>
                  <input name="largura" defaultValue="3,1" />
                </div>
                <div className="form-field">
                  <label>Profundidade</label>
                  <input name="profundidade" defaultValue="0,5" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Tipo de tecido</label>
                  <select name="tipo_de_tecido" defaultValue="Granulação">
                    <option>Granulação</option>
                    <option>Necrose</option>
                    <option>Esfacelo</option>
                    <option>Epitelização</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Exsudato</label>
                  <select name="exsudato" defaultValue="Moderado">
                    <option>Ausente</option>
                    <option>Leve</option>
                    <option>Moderado</option>
                    <option>Intenso</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Odor</label>
                  <select name="odor" defaultValue="Ausente">
                    <option>Ausente</option>
                    <option>Leve</option>
                    <option>Intenso</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Observações</label>
                <textarea name="observacoes" rows={3} defaultValue="Evolução positiva, sem sinais de infecção." />
              </div>

              <div className="wound-form__actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </>
          )}

          {section === 'Características' && (
            <>
              <h3 className="panel-title">Características</h3>

              <div className="form-grid">
                <div className="form-field">
                  <label>Bordas</label>
                  <select name="bordas" defaultValue="Regulares">
                    <option>Regulares</option>
                    <option>Irregulares</option>
                    <option>Maceradas</option>
                    <option>Epitelizadas</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Pele perilesional</label>
                  <select name="pele_perilesional" defaultValue="Íntegra">
                    <option>Íntegra</option>
                    <option>Ressecada</option>
                    <option>Macerada</option>
                    <option>Eritematosa</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Dor (escala 0–10)</label>
                  <input name="dor_escala_010" type="number" min="0" max="10" defaultValue="2" />
                </div>
              </div>

              <div className="form-field">
                <label>Sinais de infecção</label>
                <div className="wound-checklist">
                  {['Hiperemia', 'Calor local', 'Edema', 'Secreção purulenta', 'Odor fétido'].map((s) => (
                    <label key={s}>
                      <input type="checkbox" name="sinais_infeccao" value={s} /> {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Presença de biofilme</label>
                <select name="presenca_de_biofilme" defaultValue="Não">
                  <option>Não</option>
                  <option>Suspeito</option>
                  <option>Confirmado</option>
                </select>
              </div>

              <div className="wound-form__actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </>
          )}

          {section === 'Escalas clínicas' && (
            <>
              <h3 className="panel-title">Escalas clínicas</h3>

              <div className="wound-scale">
                <div className="wound-scale__head">
                  <strong>Escala de Braden (risco de lesão por pressão)</strong>
                  <span className="wound-scale__score">18 pts</span>
                </div>
                <p>Risco baixo. Reavaliar em 7 dias.</p>
              </div>

              <div className="wound-scale">
                <div className="wound-scale__head">
                  <strong>Escala PUSH (Pressure Ulcer Scale for Healing)</strong>
                  <span className="wound-scale__score">7 pts</span>
                </div>
                <p>Tendência de melhora em relação à última avaliação (9 pts).</p>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Área da ferida</label>
                  <select name="area_da_ferida" defaultValue="4,1–8,0 cm²">
                    <option>0 cm²</option>
                    <option>&lt; 0,3 cm²</option>
                    <option>0,3–0,6 cm²</option>
                    <option>4,1–8,0 cm²</option>
                    <option>&gt; 24 cm²</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Quantidade de exsudato</label>
                  <select name="quantidade_de_exsudato" defaultValue="Moderado">
                    <option>Nenhum</option>
                    <option>Leve</option>
                    <option>Moderado</option>
                    <option>Intenso</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Tipo de tecido</label>
                  <select name="tipo_de_tecido" defaultValue="Tecido de granulação">
                    <option>Tecido epitelial</option>
                    <option>Tecido de granulação</option>
                    <option>Esfacelo</option>
                    <option>Tecido necrótico</option>
                  </select>
                </div>
              </div>

              <div className="wound-form__actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </>
          )}

          {section === 'Condutas' && (
            <>
              <h3 className="panel-title">Condutas</h3>

              <div className="form-grid">
                <div className="form-field">
                  <label>Cobertura indicada</label>
                  <select name="cobertura_indicada" defaultValue="Hidrogel">
                    <option>Hidrogel</option>
                    <option>Espuma de poliuretano</option>
                    <option>Alginato de cálcio</option>
                    <option>Filme transparente</option>
                    <option>Carvão ativado com prata</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Frequência de troca</label>
                  <select name="frequencia_de_troca" defaultValue="A cada 48h">
                    <option>Diária</option>
                    <option>A cada 48h</option>
                    <option>A cada 72h</option>
                    <option>Semanal</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Retorno previsto</label>
                  <input name="retorno_previsto" type="date" defaultValue="2025-09-19" />
                </div>
              </div>

              <div className="form-field">
                <label>Orientações ao paciente/cuidador</label>
                <textarea name="orientacoes_ao_paciente_cuidador" rows={3} defaultValue="Manter o curativo seco e limpo. Procurar atendimento em caso de febre, odor forte ou aumento da dor." />
              </div>

              <div className="form-field">
                <label>Encaminhamentos</label>
                <textarea name="encaminhamentos" rows={2} defaultValue="Nenhum encaminhamento adicional necessário no momento." />
              </div>

              <div className="wound-form__actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar conduta</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
