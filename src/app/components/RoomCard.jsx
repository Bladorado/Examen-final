'use client'

import { useState } from 'react'

export default function ReservaForm({ sala }) {
  const [fecha, setFecha] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Calcular duración y total
  const calcularDuracion = () => {
    if (!horaInicio || !horaFin) return 0
    const inicio = new Date(`2000-01-01T${horaInicio}`)
    const fin = new Date(`2000-01-01T${horaFin}`)
    return (fin - inicio) / (1000 * 60 * 60)
  }

  const duracionHoras = calcularDuracion()
  const total = duracionHoras > 0 && sala ? Math.round(sala.precio_hora * duracionHoras * 100) : 0
  const totalEuros = (total / 100).toFixed(2)

  // Validar formulario
  const validar = () => {
    if (!fecha || !horaInicio || !horaFin) {
      setError('Por favor completa todos los campos')
      return false
    }

    const hoy = new Date()
    const fechaSeleccionada = new Date(fecha)
    fechaSeleccionada.setHours(0, 0, 0, 0)

    if (fechaSeleccionada < hoy) {
      setError('La fecha debe ser hoy o posterior')
      return false
    }

    if (horaFin <= horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio')
      return false
    }

    const inicio = new Date(`2000-01-01T${horaInicio}`)
    const fin = new Date(`2000-01-01T${horaFin}`)
    const duracionHoras = (fin - inicio) / (1000 * 60 * 60)

    if (duracionHoras <= 0) {
      setError('La duración debe ser mayor a 0 horas')
      return false
    }

    setError('')
    return true
  }

  // Manejar pago
  const handlePago = async () => {
    if (!validar()) return

    setCargando(true)
    setError('')

    try {
      // Obtener usuario autenticado
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Debes iniciar sesión para reservar')
        setCargando(false)
        return
      }

      // Enviar datos a la API de pagos
      const response = await fetch('/api/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sala_id: sala.id,
          fecha: fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          userId: user.id,
          userEmail: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al procesar el pago')
        setCargando(false)
        return
      }

      // Redirigir a Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      console.error('Error:', err)
      setError('Error al procesar la reserva')
      setCargando(false)
    }
  }

  // Obtener fecha mínima (hoy)
  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Reservar: {sala.nombre}
      </h3>

      <div className="space-y-4">
        {/* Campo fecha */}
        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={hoy}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Campo hora inicio */}
        <div>
          <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
            Hora de inicio
          </label>
          <input
            type="time"
            id="horaInicio"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Campo hora fin */}
        <div>
          <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700 mb-1">
            Hora de fin
          </label>
          <input
            type="time"
            id="horaFin"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mostrar total */}
        {total > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Duración:</span>
              <span className="font-semibold">
                {duracionHoras.toFixed(1)} horas
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-700">Precio/hora:</span>
              <span className="font-semibold">{sala.precio_hora.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-300">
              <span className="text-lg font-bold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-blue-600">{totalEuros} €</span>
            </div>
          </div>
        )}

        {/* Mostrar error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Botón de pago */}
        <button
          onClick={handlePago}
          disabled={cargando || total <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          {cargando ? 'Procesando...' : 'Pagar reserva'}
        </button>
      </div>
    </div>
  )
}