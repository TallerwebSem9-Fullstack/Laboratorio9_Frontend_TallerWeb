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
  enroll: (eventId, email) => request(`/events/${eventId}/inscriptions`, {
    method: 'POST', body: JSON.stringify({ email }),
  }),
  cancelEnrollment: (eventId, email) => request(`/events/${eventId}/inscriptions/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  }),
  clearInscriptions: (email) => request(`/students/${encodeURIComponent(email)}/inscriptions`, {
    method: 'DELETE',
  }),
  demoSlow: (ms = 5000) => request(`/demo/slow?ms=${ms}`),
  health: () => request('/health'),
}
