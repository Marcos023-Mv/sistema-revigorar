import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, ChevronRight } from 'lucide-react'
import { listPatientsWithPhotos } from '../../services/photosService.js'
import './PhotosList.css'

export default function PhotosList() {
  const [patients, setPatients] = useState([])

  useEffect(() => {
    let active = true
    listPatientsWithPhotos().then((data) => { if (active) setPatients(data) })
    return () => { active = false }
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Fotos</h1>
          <p>Registros fotográficos por paciente</p>
        </div>
      </div>
      <div className="photoslist-grid">
        {patients.map((p) => (
          <Link className="photoslist-card" to={`/pacientes/${p.id}/fotos`} key={p.id}>
            <div className="photoslist-card__preview"><ImageIcon size={26} /></div>
            <div className="photoslist-card__footer">
              <div>
                <strong>{p.name}</strong>
                <span>Última foto: {p.lastEval}</span>
              </div>
              <ChevronRight size={15} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
