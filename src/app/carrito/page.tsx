'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import { useCarrito } from '@/hooks/useCarrito'
import type { DatosEnvio } from '@/types'

const PROVINCIAS = [
  'Buenos Aires','Entre Ríos','Córdoba','Santa Fe','Mendoza','Tucumán','Salta',
  'Misiones','Chaco','Corrientes','Santiago del Estero','San Juan','Jujuy',
  'Río Negro','Neuquén','Formosa','Chubut','San Luis','Catamarca','La Rioja',
  'La Pampa','Santa Cruz','Tierra del Fuego','Ciudad Autónoma de Buenos Aires'
]

const fmt = (n: number) => '$' + n.toLocaleString('es-AR')

export default function CarritoPage() {
  const { items, cambiarCantidad, quitar, total, datosEnvio, setDatosEnvio, vaciar } = useCarrito()
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState<DatosEnvio>(datosEnvio)
  const router = useRouter()

  const subtotal = total()

  const handleField = (k: keyof DatosEnvio, v: string) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleConfirmar = async () => {
    if (!items.length) return
    const req = ['nombre','email','direccion','ciudad','provincia'] as const
    for (const f of req) {
      if (!form[f].trim()) { toast.error('Completá todos los campos obligatorios'); return }
    }

    setCargando(true)
    setDatosEnvio(form)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            producto_id: i.producto.id,
            cantidad: i.cantidad,
            precio_unit: i.producto.precio
          })),
          envio: form,
          subtotal,
          total: subtotal
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      vaciar()

      // Si hay preferencia de MP, redirigir al checkout
      if (data.preferenceId) {
        router.push(`/pedido/exito?id=${data.pedidoId}&numero=${data.numeroPedido}`)
      } else {
        router.push(`/pedido/exito?id=${data.pedidoId}&numero=${data.numeroPedido}`)
      }
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Error al confirmar el pedido')
    } finally {
      setCargando(false)
    }
  }

  if (!items.length) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center">
          <ShoppingBag size={64} className="mx-auto text-[var(--warm)] mb-4" />
          <p className="font-display text-3xl text-[var(--text-soft)] mb-6">Tu carrito está vacío</p>
          <Link href="/" className="inline-block bg-[var(--earth)] text-[var(--cream)] text-xs font-semibold tracking-widest uppercase px-8 py-3 rounded-md hover:bg-[var(--bronze)] transition-colors">
            Ver productos
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-4xl font-light mb-1">Tu <em className="text-[var(--bronze)]">Carrito</em></h1>
        <p className="text-sm text-[var(--text-soft)] mb-8">Revisá tus artículos y completá tu pedido</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Items */}
          <div className="bg-[var(--white)] rounded-2xl p-6 shadow-md">
            {items.map(item => (
              <div key={item.producto.id} className="flex gap-4 items-center py-4 border-b border-[var(--warm)] last:border-0">
                <div className="w-16 h-16 rounded-lg bg-[var(--warm)] flex-shrink-0 relative overflow-hidden">
                  {item.producto.imagen_url
                    ? <Image src={item.producto.imagen_url} alt={item.producto.nombre} fill className="object-cover" sizes="64px" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">💎</div>
                  }
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[var(--earth)]">{item.producto.nombre}</p>
                  <p className="text-xs text-[var(--text-soft)] mt-0.5">{fmt(item.producto.precio)} c/u</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => cambiarCantidad(item.producto.id, item.cantidad - 1)} className="w-6 h-6 rounded bg-[var(--warm)] flex items-center justify-center hover:bg-[var(--gold)] transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.producto.id, item.cantidad + 1)} className="w-6 h-6 rounded bg-[var(--warm)] flex items-center justify-center hover:bg-[var(--gold)] transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-semibold text-[var(--bronze)]">
                    {fmt(item.producto.precio * item.cantidad)}
                  </p>
                  <button onClick={() => quitar(item.producto.id)} className="text-gray-300 hover:text-red-400 transition-colors mt-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario + resumen */}
          <div className="bg-[var(--white)] rounded-2xl p-6 shadow-md sticky top-24">
            <h2 className="font-display text-xl font-semibold text-[var(--earth)] border-b-2 border-[var(--gold)] pb-3 mb-5">
              Datos de envío
            </h2>

            {[
              { key: 'nombre', label: 'Nombre completo *', placeholder: 'Ana García' },
              { key: 'telefono', label: 'Teléfono / WhatsApp', placeholder: '+54 343 123-4567' },
              { key: 'email', label: 'Email *', placeholder: 'ana@ejemplo.com', type: 'email' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} className="mb-3">
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1">{label}</label>
                <input
                  type={type ?? 'text'}
                  value={form[key as keyof DatosEnvio]}
                  onChange={e => handleField(key as keyof DatosEnvio, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border-[1.5px] border-[var(--warm)] bg-[var(--cream)] text-[var(--earth)] text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            ))}

            <div className="mb-3">
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1">Provincia *</label>
              <select
                value={form.provincia}
                onChange={e => handleField('provincia', e.target.value)}
                className="w-full border-[1.5px] border-[var(--warm)] bg-[var(--cream)] text-[var(--earth)] text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--gold)]"
              >
                <option value="">Seleccioná...</option>
                {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {[
              { key: 'ciudad', label: 'Ciudad *', placeholder: 'Villa Elisa' },
              { key: 'direccion', label: 'Dirección completa *', placeholder: 'Calle 123, Barrio X' },
              { key: 'codigo_postal', label: 'Código Postal', placeholder: '3265' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="mb-3">
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key as keyof DatosEnvio]}
                  onChange={e => handleField(key as keyof DatosEnvio, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border-[1.5px] border-[var(--warm)] bg-[var(--cream)] text-[var(--earth)] text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            ))}

            <div className="mb-4">
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1">Nota adicional</label>
              <textarea
                value={form.nota}
                onChange={e => handleField('nota', e.target.value)}
                placeholder="Referencias, aclaraciones..."
                rows={3}
                className="w-full border-[1.5px] border-[var(--warm)] bg-[var(--cream)] text-[var(--earth)] text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--gold)] resize-none"
              />
            </div>

            {/* Resumen */}
            <div className="bg-[var(--cream)] rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm text-[var(--text-soft)] mb-1">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--text-soft)] mb-2">
                <span>Envío</span><span>A confirmar</span>
              </div>
              <div className="flex justify-between font-display text-xl font-semibold text-[var(--earth)] pt-2 border-t border-[var(--warm)]">
                <span>Total</span><span>{fmt(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmar}
              disabled={cargando}
              className="w-full bg-gradient-to-r from-[var(--bronze)] to-[var(--gold-dark)] text-[var(--cream)] text-sm font-semibold tracking-widest uppercase py-3.5 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {cargando ? 'Procesando...' : 'Confirmar pedido ✦'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
