import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import EventCard from '../components/EventCard'

function FavoriteEvents() {
  const { student, openModal, favorites, events, eventsLoading, apiError } = useApp()
  const favoriteEvents = events.filter((event) => favorites.includes(event.id))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Mis favoritos</h2>
          <p className="page-subtitle">Eventos que guardaste para consultar después.</p>
        </div>
        <div className="stat-pill">
          <span className="stat-pill__number">{favoriteEvents.length}</span>
          <span className="stat-pill__label">Guardados</span>
        </div>
      </div>

      {apiError && <p role="alert" className="page-subtitle">{apiError}</p>}
      {eventsLoading ? <p>Cargando eventos…</p> : favoriteEvents.length > 0 ? (
        <div className="events-grid">
          {favoriteEvents.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">♡</span>
          <h3>Aún no guardaste eventos</h3>
          {!student && <p><button onClick={() => openModal(null)} className="link-btn">Identifícate</button> para guardar favoritos entre visitas.</p>}
          <p>Explora los eventos y pulsa “Favorito” para agregarlos a esta lista.</p>
          <Link to="/" className="btn btn--primary">Explorar eventos</Link>
        </div>
      )}
    </div>
  )
}

export default FavoriteEvents
