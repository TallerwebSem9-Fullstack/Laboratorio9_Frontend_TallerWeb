const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? `Error HTTP ${response.status}`)
  return data
}

export const api = {
  getEvents: () => request('/events'),
  getEvent: (id) => request(`/events/${id}`),
  getInscriptions: (email) => request(`/students/${encodeURIComponent(email)}/inscriptions`),
  enroll: (eventId, student) => request(`/events/${eventId}/inscriptions`, {
    method: 'POST', body: JSON.stringify(typeof student === 'string' ? { email: student } : student),
  }),
  cancelEnrollment: (eventId, email) => request(`/events/${eventId}/inscriptions/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  }),
  clearInscriptions: (email) => request(`/students/${encodeURIComponent(email)}/inscriptions`, {
    method: 'DELETE',
  }),
  getFavorites: (email) => request(`/students/${encodeURIComponent(email)}/favorites`),
  addFavorite: (email, eventId, name) => request(`/students/${encodeURIComponent(email)}/favorites/${eventId}`, {
    method: 'POST', body: JSON.stringify({ name }),
  }),
  removeFavorite: (email, eventId) => request(`/students/${encodeURIComponent(email)}/favorites/${eventId}`, {
    method: 'DELETE',
  }),
  getReviews: (eventId) => request(`/events/${eventId}/reviews`),
  saveReview: (eventId, review) => request(`/events/${eventId}/reviews`, {
    method: 'POST', body: JSON.stringify(review),
  }),
  demoSlow: (ms = 5000) => request(`/demo/slow?ms=${ms}`),
  health: () => request('/health'),
}
