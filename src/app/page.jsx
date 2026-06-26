import { createClient } from '@/lib/supabase/server'
import ReservaForm from '@/app/components/RoomCard'


export default async function Home() {
  // Obtener usuario autenticado (server-side)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Obtener salas activas
const result = await supabase
  .from("salas")
  .select("*");

console.dir(result, { depth: null });

const { data: salas, error } = result;


  const listasalas = [
    {
      id: 1,
      sal: "Azul",
      precio: "50€ Hora",
      placeholder: "Mediana y reluciente"

    },
    {
      id: 2,
      sal: "Verde",
      precio: "40€ Hora",
      placeholder: "Pequeña y espaciosa"

    },
    {
      id: 3,
      sal: "Roja",
      precio: "60€ Hora",
      placeholder: "Grande y bonita"

    },


  ]


  return (
    <div className="min-h-screen bg-green-100 ">
      {/* Hero section */}
      <div className=" text-black py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Sistema de Reservas
          </h1>

          <p className="text-xl text-blue-950">
            Reserva tu sala
          </p>

          {listasalas.map((c) => (
            <div className="bg-amber-200 w-3xl m-auto p-4 text-blue-950 text-2xl mb-3.5" key={c.id}> {c.sal}: {c.precio}: {c.placeholder} </div>

          ))}
          <button className='p-4 bg-amber-500 rounded-2xl hover:bg-red-300'>Reservar</button>
        </div>
      </div>

      {/* Grid de salas */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Nuestras Salas
        </h2>

        {!salas || salas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay salas disponibles en este momento
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salas.map((sala) => (
              <div
                key={sala.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Imagen de la sala */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={sala.imagen_url}
                    alt={sala.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Información de la sala */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {sala.nombre}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {sala.descripcion}
                  </p>

                  {/* Características */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>{sala.capacidad} personas</span>
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-blue-600">
                        {sala.precio_hora.toFixed(2)} €
                      </span>
                      <span className="text-gray-500">/hora</span>
                    </div>
                  </div>

                  {/* Botón de reserva */}
                  <ReservaForm sala={sala} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}