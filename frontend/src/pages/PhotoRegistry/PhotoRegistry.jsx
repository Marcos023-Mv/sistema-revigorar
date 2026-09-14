import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Clock } from 'lucide-react'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import { PATIENTS } from '../../data/mockData.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { getPatientPhotos, uploadPatientPhoto } from '../../services/photosService.js'
import './PhotoRegistry.css'

export default function PhotoRegistry() {
  const { id } = useParams()
  const [thumbs, setThumbs] = useState([])
  const [active, setActive] = useState(0)
  const [compareIndex, setCompareIndex] = useState(0)
  const patient = PATIENTS.find((p) => String(p.id) === id) || PATIENTS[0]
  const showToast = useToast()
  const fileInputRef = useRef(null)

  useEffect(() => {
    let active2 = true
    getPatientPhotos(id).then((data) => { if (active2) setThumbs(data) })
    return () => { active2 = false }
  }, [id])

  const addPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const uploaded = await uploadPatientPhoto(id, file)
    setThumbs((list) => [uploaded.date || new Date().toLocaleDateString('pt-BR'), ...list])
    setActive(0)
    showToast('Nova foto adicionada ao registro.')
    e.target.value = ''
  }

  const shiftCompare = (dir) => {
    setCompareIndex((i) => {
      const next = i + dir
      if (next < 0) return 0
      if (next > thumbs.length - 2) return Math.max(0, thumbs.length - 2)
      return next
    })
  }

  const selectFromHistory = (i) => {
    setActive(i)
    showToast(`Exibindo foto de ${thumbs[i]}.`)
  }

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Pacientes', to: '/pacientes' },
          { label: patient.name, to: `/pacientes/${patient.id}` },
          { label: 'Registro fotográfico' },
        ]}
      />

      <div className="photo-grid">
        <div className="panel">
          <h3 className="panel-title">Registro fotográfico</h3>
          <div className="photo-main">
            <ImageIcon size={40} />
            <span className="photo-main__date">{thumbs[active]}</span>
          </div>
          <div className="photo-thumbs">
            {thumbs.map((date, i) => (
              <button
                key={date + i}
                className={`photo-thumb ${active === i ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Foto de ${date}`}
              >
                <ImageIcon size={16} />
              </button>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="photo-grid__file-input"
            onChange={handleFileSelected}
          />
          <button className="btn btn-primary photo-grid__add" onClick={addPhoto}>
            <Plus size={15} /> Adicionar nova foto
          </button>
        </div>

        <div className="panel">
          <h3 className="panel-title">Comparação de imagens</h3>
          <div className="photo-compare">
            <button className="btn-icon" aria-label="Comparação anterior" onClick={() => shiftCompare(-1)}>
              <ChevronLeft size={16} />
            </button>
            <div className="photo-compare__item">
              <span className="photo-compare__date">{thumbs[compareIndex]}</span>
              <div className="photo-compare__image"><ImageIcon size={32} /></div>
            </div>
            <div className="photo-compare__item">
              <span className="photo-compare__date">{thumbs[compareIndex + 1] || thumbs[thumbs.length - 1]}</span>
              <div className="photo-compare__image"><ImageIcon size={32} /></div>
            </div>
            <button className="btn-icon" aria-label="Próxima comparação" onClick={() => shiftCompare(1)}>
              <ChevronRight size={16} />
            </button>
          </div>

          <h4 className="photo-history__title"><Clock size={14} /> Histórico</h4>
          <ul className="photo-history">
            {thumbs.map((date, i) => (
              <li key={date + i} onClick={() => selectFromHistory(i)}>
                <span className="photo-history__dot" />
                {date}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
