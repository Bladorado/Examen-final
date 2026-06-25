'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ReservaExitoPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [reserva, setReserva] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Sesión no válida')
      setCargando(false)
      return
    }

    const supabase = createClient()

    // Cargar reserva inicial
    const cargarReserva = async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select('*, salas(*)')
        .eq('stripe_session_id', sessionId)
        .single()

      if (error) {
        console.error('Error al cargar reserva:', error)
        setError('No se encontró la reserva')
      } else {
        setReserva(data)
      }
      setCargando(false)
    }

    cargarReserva()

    // Crear canal de Realtime para escuchar cambios en la reserva
    const channel = supabase
      .channel(`reserva-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservas',
          filter: `stripe_session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Actualizar la reserva con los nuevos datos
          setReserva(payload.new)
        }
      )
      .subscribe()

    // Limpiar canal al desmontar el componente
    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // Mostrar estado de carga
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando información de la reserva...</p>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error || !sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Sesión no válida'}</p>
          <a
            href="/"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  // Si no hay reserva aún
  if (!reserva) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-500 text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Procesando tu reserva...</h1>
          <p className="text-gray-600">Por favor espera mientras confirmamos tu pago</p>
        </div>
      </div>
    )
  }

  // Calcular total en euros
  const totalEuros = (reserva.total / 100).toFixed(2)

  // Formatear fecha
  const fechaFormateada = new Date(reserva.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Estado: Procesando */}
          {reserva.estado === 'pendiente' && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center animate-fadeIn">
              <div className="text-amber-500 text-6xl mb-4">⏳</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Procesando tu reserva...
              </h1>
              <p className="text-gray-600 mb-6">
                Estamos confirmando tu pago. Esto puede tardar unos segundos.
              </p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            </div>
          )}

          {/* Estado: Confirmada */}
          {reserva.estado === 'confirmada' && (
            <div className="bg-white rounded-lg shadow-md p-8 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  ¡Reserva confirmada!
                </h1>
                <p className="text-gray-600">
                  Tu reserva ha sido confirmada exitosamente
                </p>
              </div>

              {/* Detalles de la reserva */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Detalles de la reserva
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sala:</span>
                    <span className="font-semibold text-gray-800">
                      {reserva.salas?.nombre}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-semibold text-gray-800">
                      {fechaFormateada}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Horario:</span>
                    <span className="font-semibold text-gray-800">
                      {reserva.hora_inicio} - {reserva.hora_fin}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-semibold text-gray-800">
                      {(() => {
                        const inicio = new Date(`2000-01-01T${reserva.hora_inicio}`)
                        const fin = new Date(`2000-01-01T${reserva.hora_fin}`)
                        const horas = (fin - inicio) / (1000 * 60 * 60)
                        return `${horas.toFixed(1)} horas`
                      })()}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-800">Total pagado:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {totalEuros} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Código QR */}
              {reserva.qr_token && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Tu código de acceso
                  </h3>
                  <div className="bg-white p-4 rounded-lg inline-block mb-3">
                    <code className="text-lg font-mono font-bold text-blue-600 break-all">
                      {reserva.qr_token}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Presenta este código al llegar a la sala
                  </p>
                </div>
              )}

              {/* Botón para ver mis reservas */}
              <div className="mt-6 text-center">
                <a
                  href="/mis-reservas"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  Ver mis reservas
                </a>
              </div>
            </div>
          )}

          {/* Estado: Cancelada */}
          {reserva.estado === 'cancelada' && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center animate-fadeIn">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Reserva cancelada</h1>
              <p className="text-gray-600 mb-6">
                Tu reserva ha sido cancelada. Si tienes alguna pregunta, contacta con nosotros.
              </p>
              <a
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
              >
                Volver al inicio
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}