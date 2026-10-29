import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const saved = localStorage.getItem('edu_student')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [inscriptions, setInscriptions] = useState([])
  const [favorites, setFavorites] = useState([])
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingEventId, setPendingEventId] = useState(null)

  useEffect(() => {
    api.getEvents()
      .then(setEvents)
      .catch((error) => setApiError(`No se pudieron cargar los eventos: ${error.message}`))
      .finally(() => setEventsLoading(false))
  }, [])

  useEffect(() => {
    if (!student?.email) {
      setInscriptions([])
      setFavorites([])
      return
    }
    api.getInscriptions(student.email)
      .then(({ inscriptions: ids }) => setInscriptions(ids))
      .catch((error) => setApiError(`No se pudieron cargar tus inscripciones: ${error.message}`))
    api.getFavorites(student.email)
      .then(({ favorites: ids }) => setFavorites(ids))
      .catch((error) => setApiError(`No se pudieron cargar tus favoritos: ${error.message}`))
  }, [student?.email])

  const refreshEvents = async () => {
    try {
      const latestEvents = await api.getEvents()
      setEvents(latestEvents)
    } catch (error) {
      setApiError(`No se pudieron actualizar los eventos: ${error.message}`)
    }
  }

  const saveStudent = (data) => {
    setStudent(data)
    localStorage.setItem('edu_student', JSON.stringify(data))
  }

  const clearStudent = async () => {
    if (student?.email) {
      try {
        await api.clearInscriptions(student.email)
        await refreshEvents()
      } catch (error) {
        setApiError(error.message)
        return
      }
    }
    setStudent(null)
    setInscriptions([])
    setFavorites([])
    localStorage.removeItem('edu_student')
    localStorage.removeItem('edu_inscriptions')
  }

  const openModal = (eventId = null) => {
    setPendingEventId(eventId)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setPendingEventId(null)
  }

  const confirmRegistration = async (data) => {
    saveStudent(data)
    if (pendingEventId !== null) {
      try {
        const result = await api.enroll(pendingEventId, data)
        setInscriptions(result.inscriptions)
        setApiError('')
        closeModal()
        await refreshEvents()
      } catch (error) {
        setApiError(error.message)
        throw error
      }
    } else {
      closeModal()
    }
  }

  const inscribe = async (eventId) => {
    if (!student) {
      openModal(eventId)
      return
    }
    try {
      const result = await api.enroll(eventId, student)
      setInscriptions(result.inscriptions)
      setApiError('')
      await refreshEvents()
    } catch (error) {
      setApiError(error.message)
    }
  }

  const cancelInscription = async (eventId) => {
    if (!student) return
    try {
      const result = await api.cancelEnrollment(eventId, student.email)
      setInscriptions(result.inscriptions)
      setApiError('')
      await refreshEvents()
    } catch (error) {
      setApiError(error.message)
    }
  }

  const isInscribed = (eventId) => inscriptions.includes(eventId)

  const toggleFavorite = async (eventId) => {
    if (!student) {
      openModal(null)
      return
    }
    try {
      const result = favorites.includes(eventId)
        ? await api.removeFavorite(student.email, eventId)
        : await api.addFavorite(student.email, eventId, student.name)
      setFavorites(result.favorites)
      setApiError('')
    } catch (error) {
      setApiError(`No se pudo actualizar el favorito: ${error.message}`)
    }
  }

  const isFavorite = (eventId) => favorites.includes(eventId)

  return (
    <AppContext.Provider value={{
      student, saveStudent, clearStudent,
      inscriptions, inscribe, cancelInscription, isInscribed,
      favorites, toggleFavorite, isFavorite,
      events, eventsLoading, apiError,
      modalOpen, openModal, closeModal, confirmRegistration, pendingEventId,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
