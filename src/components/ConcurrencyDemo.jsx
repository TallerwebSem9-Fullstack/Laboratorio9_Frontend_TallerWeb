import { useState } from 'react'
import { api } from '../services/api'

function ConcurrencyDemo() {
  const [slowResult, setSlowResult] = useState(null)
  const [healthResult, setHealthResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const runDemo = async () => {
    setRunning(true)
    setError('')
    setSlowResult(null)
    setHealthResult(null)
    const started = performance.now()

    const slowRequest = api.demoSlow(5000)
      .then((result) => setSlowResult({ ...result, elapsed: Math.round(performance.now() - started) }))

    // Esta petición se lanza mientras la primera duerme en el servidor.
    try {
      const healthStarted = performance.now()
      const health = await api.health()
      setHealthResult({ ...health, elapsed: Math.round(performance.now() - healthStarted) })
    } catch (requestError) {
      setError(requestError.message)
    }

    try {
      await slowRequest
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="info-card" style={{ margin: '1.5rem 0', padding: '1rem' }}>
      <h3 className="info-card__title">Demostración de concurrencia del backend</h3>
      <p>Se inicia una petición que espera 5 segundos y, mientras sigue pendiente, se consulta la salud del servidor.</p>
      <button className="btn btn--outline" onClick={runDemo} disabled={running}>
        {running ? 'Petición lenta en curso…' : 'Probar concurrencia'}
      </button>
      {healthResult && <p role="status">✅ /api/health respondió en {healthResult.elapsed} ms mientras la otra petición esperaba.</p>}
      {slowResult && <p>⏱️ /api/demo/slow terminó después de {slowResult.elapsed} ms (demora solicitada: {slowResult.delayMs} ms).</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}

export default ConcurrencyDemo
