import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MessageSquare, Camera, Image as ImageIcon } from 'lucide-react'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { PATIENTS, CURRENT_USER } from '../../data/mockData.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { getMessages, sendMessage as sendMessageApi, requestPhoto as requestPhotoApi, getMonitoringStatus } from '../../services/monitoringService.js'
import './RemoteMonitoring.css'

function initialsOf(name) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export default function RemoteMonitoring() {
  const { id } = useParams()
  const patient = PATIENTS.find((p) => String(p.id) === id) || PATIENTS[0]
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState({ active: true, nextContact: '—' })
  const [note, setNote] = useState('')
  const showToast = useToast()

  useEffect(() => {
    let active2 = true
    getMessages(id).then((data) => { if (active2) setMessages(data) })
    getMonitoringStatus(id).then((data) => { if (active2) setStatus(data) })
    return () => { active2 = false }
  }, [id])

  const nowTime = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  const sendMessage = async () => {
    if (!note.trim()) return
    const created = await sendMessageApi(id, note.trim())
    setMessages((list) => [
      ...list,
      { id: created.id, from: 'nurse', name: CURRENT_USER.name, time: nowTime(), text: note.trim() },
    ])
    showToast('Mensagem enviada ao paciente pelo WhatsApp.')
    setNote('')
  }

  const requestPhoto = async () => {
    const created = await requestPhotoApi(id)
    setMessages((list) => [
      ...list,
      { id: created.id, from: 'nurse', name: CURRENT_USER.name, time: nowTime(), text: 'solicitou uma nova foto da ferida ao paciente' },
    ])
    showToast('Solicitação de foto enviada ao paciente pelo WhatsApp.')
  }

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Pacientes', to: '/pacientes' },
          { label: patient.name, to: `/pacientes/${patient.id}` },
          { label: 'Acompanhamento remoto' },
        ]}
      />

      <h1 className="monitoring__title">Acompanhamento remoto</h1>

      <div className="monitoring-grid">
        <div className="panel monitoring-upload">
          <div className="monitoring-upload__icon"><MessageSquare size={22} /></div>
          <h3>Enviar orientação</h3>
          <p>Envie uma mensagem ou peça uma nova foto ao paciente pelo WhatsApp.</p>
          <textarea
            className="monitoring-upload__textarea"
            rows={3}
            placeholder="Escreva uma orientação para o paciente..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="btn btn-primary" onClick={sendMessage}>Enviar mensagem</button>
          <button className="btn btn-secondary" onClick={requestPhoto}>
            <Camera size={14} /> Solicitar nova foto
          </button>
        </div>

        <div className="panel monitoring-chat">
          {messages.map((m) => (
            <div className={`monitoring-chat__msg ${m.from === 'nurse' ? 'monitoring-chat__msg--reply' : ''}`} key={m.id}>
              <Avatar initials={m.from === 'nurse' ? initialsOf(m.name) : initialsOf(patient.name)} size={32} />
              <div>
                <div className="monitoring-chat__head">
                  <strong>{m.from === 'nurse' ? m.name : patient.name}</strong>
                  <span>{m.time}</span>
                </div>
                <p>{m.text}</p>
                {m.photo && <div className="monitoring-chat__photo"><ImageIcon size={20} /></div>}
              </div>
            </div>
          ))}
        </div>

        <div className="panel monitoring-status">
          <h3 className="panel-title">Status do acompanhamento</h3>
          <Badge tone={status.active ? 'success' : 'neutral'}>{status.active ? 'Ativo' : 'Inativo'}</Badge>
          <div className="monitoring-status__info">
            <span>Próximo contato</span>
            <strong>{status.nextContact}</strong>
          </div>
          <Link to={`/pacientes/${patient.id}/evolucao`} className="btn btn-secondary">Ver histórico</Link>
        </div>
      </div>
    </div>
  )
}
