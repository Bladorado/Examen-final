import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MisReservasPage() {
  // Obtener usuario autenticado (server-side)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si no hay usuario, redirigir a login
  if (!user) {
    redirect('/')
  }

  // Obtener reservas del usuario
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('*, salas(*)')
    .eq('user_id', user.id)
    .order('fecha', { ascending: false })

  if (error) {
    console.error('Error al cargar reservas:', error)
  }

  // Función para obtener las clases CSS según el estado
  const getEstadoClasses = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'estado-pendiente'
      case 'confirmada':
        return 'estado-confirmada'
      case 'cancelada':
        return 'estado-cancelada'
      case 'completada':
        return 'estado-completada'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Función para obtener el texto del estado
  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente'
      case 'confirmada':
        return 'Confirmada'
      case 'cancelada':
        return 'Cancelada'
      case 'completada':
        return 'Completada'
      default:
        return estado
    }
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Mis Reservas
        </h1>

        {!reservas || reservas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No tienes reservas
            </h2>
            <p className="text-gray-600 mb-6">
              Aún no has realizado ninguna reserva. ¡Explora nuestras salas y reserva ahora!
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Ver salas disponibles
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {reservas.map((reserva) => {
              const totalEuros = (reserva.total / 100).toFixed(2)

              return (
                <div
                  key={reserva.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    {/* Encabezado de la tarjeta */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {reserva.salas?.nombre || 'Sala desconocida'}
                        </h3>
                        <p className="text-gray-600">
                          {reserva.salas?.descripcion}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getEstadoClasses(reserva.estado)}`}
                        >
                          {getEstadoTexto(reserva.estado)}
                        </span>
                      </div>
                    </div>

                    {/* Detalles de la reserva */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Fecha */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm font-medium">Fecha</span>
                        </div>
                        <p className="text-gray-800 font-semibold">
                          {formatearFecha(reserva.fecha)}
                        </p>
                      </div>

                      {/* Horario */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm font-medium">Horario</span>
                        </div>
                        <p className="text-gray-800 font-semibold">
                          {reserva.hora_inicio} - {reserva.hora_fin}
                        </p>
                      </div>

                      {/* Duración */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span className="text-sm font-medium">Duración</span>
                        </div>
                        <p className="text-gray-800 font-semibold">
                          {(() => {
                            const inicio = new Date(`2000-01-01T${reserva.hora_inicio}`)
                            const fin = new Date(`2000-01-01T${reserva.hora_fin}`)
                            const horas = (fin - inicio) / (1000 * 60 * 60)
                            return `${horas.toFixed(1)} horas`
                          })()}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm font-medium">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {totalEuros} €
                        </p>
                      </div>
                    </div>

                    {/* Código QR (solo para reservas confirmadas) */}
                    {reserva.estado === 'confirmada' && reserva.qr_token && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                          <span className="text-sm font-semibold text-blue-800">
                            Código de acceso
                          </span>
                        </div>
                        <code className="block bg-white p-3 rounded border border-blue-200 font-mono text-sm font-bold text-blue-600 break-all">
                          {reserva.qr_token}
                        </code>
                      </div>
                    )}

                    {/* Estado de pago */}
                    {reserva.estado_pago && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Estado del pago:</span>{' '}
                        <span
                          className={
                            reserva.estado_pago === 'pagado'
                              ? 'text-green-600 font-semibold'
                              : reserva.estado_pago === 'cancelado'
                              ? 'text-red-600 font-semibold'
                              : 'text-amber-600 font-semibold'
                          }
                        >
                          {reserva.estado_pago === 'pagado'
                            ? 'Pagado'
                            : reserva.estado_pago === 'cancelado'
                            ? 'Cancelado'
                            : 'Pendiente'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}