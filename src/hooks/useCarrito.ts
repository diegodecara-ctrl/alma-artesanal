import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto, ItemCarrito, DatosEnvio } from '@/types'

interface CarritoStore {
  items: ItemCarrito[]
  datosEnvio: DatosEnvio
  agregar: (producto: Producto) => void
  quitar: (productoId: string) => void
  cambiarCantidad: (productoId: string, cantidad: number) => void
  vaciar: () => void
  setDatosEnvio: (datos: DatosEnvio) => void
  total: () => number
  cantidadTotal: () => number
}

const envioVacio: DatosEnvio = {
  nombre: '', email: '', telefono: '',
  direccion: '', ciudad: '', provincia: '',
  codigo_postal: '', nota: ''
}

export const useCarrito = create<CarritoStore>()(
  persist(
    (set, get) => ({
      items: [],
      datosEnvio: envioVacio,

      agregar: (producto) => {
        const items = get().items
        const existe = items.find(i => i.producto.id === producto.id)
        if (existe) {
          if (existe.cantidad >= producto.stock) return
          set({ items: items.map(i =>
            i.producto.id === producto.id
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          )})
        } else {
          set({ items: [...items, { producto, cantidad: 1 }] })
        }
      },

      quitar: (productoId) =>
        set({ items: get().items.filter(i => i.producto.id !== productoId) }),

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) { get().quitar(productoId); return }
        const item = get().items.find(i => i.producto.id === productoId)
        if (item && cantidad > item.producto.stock) return
        set({ items: get().items.map(i =>
          i.producto.id === productoId ? { ...i, cantidad } : i
        )})
      },

      vaciar: () => set({ items: [], datosEnvio: envioVacio }),

      setDatosEnvio: (datos) => set({ datosEnvio: datos }),

      total: () => get().items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((s, i) => s + i.cantidad, 0),
    }),
    { name: 'alma-carrito' }
  )
)
