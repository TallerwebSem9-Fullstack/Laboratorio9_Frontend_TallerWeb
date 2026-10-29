import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'
import { isPastEvent } from '../utils/dateUtils'

function ReviewsSection({ event }) {
  const { student, openModal } = useApp()
  const [data, setData] = useState({ reviews: [], average: null, count: 0 })
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadReviews = async () => {
    try {
      setData(await api.getReviews(event.id))
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReviews() }, [event.id])

  const myReview = data.reviews.find((review) => review.studentEmail === student?.email?.toLowerCase())

  const submitReview = async (submitEvent) => {
    submitEvent.preventDefault()
    if (!student) return openModal(null)
    setSaving(true)
    setError('')
    try {
      await api.saveReview(event.id, { email: student.email, name: student.name, rating, comment })
      setComment('')
      await loadReviews()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="reviews-section">
      <h3 className="detail-section-title">⭐ Calificaciones y comentarios</h3>
      <p className="reviews-summary">
        {loading ? 'Cargando opiniones…' : data.count
          ? `${data.average.toFixed(1)} de 5 · ${data.count} opinión${data.count === 1 ? '' : 'es'}`
          : 'Aún no hay opiniones para este evento.'}
      </p>

      {isPastEvent(event.date) ? (
        <form className="review-form" onSubmit={submitReview}>
          <label className="form-group">
            <span className="form-label">Tu calificación</span>
            <select className="select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{'★'.repeat(value)} ({value})</option>)}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Comentario (máximo 1000 caracteres)</span>
            <textarea className="input review-textarea" maxLength={1000} required value={comment} onChange={(e) => setComment(e.target.value)} placeholder={myReview ? 'Escribe para actualizar tu opinión…' : '¿Qué te pareció el evento?'} />
          </label>
          {!student && <p className="text-muted">Primero identifícate para publicar tu opinión.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn--primary" disabled={saving || loading} type="submit">
            {saving ? 'Guardando…' : myReview ? 'Actualizar opinión' : 'Publicar opinión'}
          </button>
        </form>
      ) : <p className="text-muted">Podrás calificar este evento después de que se realice.</p>}

      {data.reviews.length > 0 && (
        <ul className="review-list">
          {data.reviews.map((review) => (
            <li className="review-item" key={review.id}>
              <div className="review-item__heading">
                <strong>{review.name}</strong>
                <span aria-label={`${review.rating} de 5 estrellas`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ReviewsSection
