'use client'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useCarrito } from '@/hooks/useCarrito'
import type { Producto } from '@/types'

const EMOJIS: Record<string, string> = {
  Collares: '🌙', Pulseras: '🔱', Aros: '✨',
  Anillos: '🌸', Sets: '🌷', Broches: '🦋', Otro: '💎'
}

const fmt = (n: number) => '$' + n.toLocaleString('es-AR')

export default function ProductGrid({ productos }: { productos: Producto[] }) {
  if (!productos.length) {
    return (
      <div className="text-center py-20 text-[var(--text-soft)]">
        <p className="font-display text-2xl">No hay productos disponibles</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productos.map(p => <ProductCard key={p.id} producto={p} />)}
    </div>
  )
}

function ProductCard({ producto: p }: { producto: Producto }) {
  const agregar = useCarrito(s => s.agregar)

  const handleAgregar = () => {
    agregar(p)
    toast.success(`"${p.nombre}" agregado al carrito 🌸`)
  }

  const stockBadge = p.stock === 0
    ? { label: 'Sin stock', cls: 'bg-gray-500/80 text-gray-100' }
    : p.stock <= 3
      ? { label: `¡Últimos ${p.stock}!`, cls: 'bg-red-500/85 text-white' }
      : { label: 'Disponible', cls: 'bg-[var(--earth)]/70 text-[var(--gold)]' }

  return (
    <div className="bg-[var(--white)] rounded-xl overflow-hidden shadow-md hover:-translate-y-1.5 hover:shadow-xl transition-all duration-250 flex flex-col">
      {/* Imagen */}
      <div className="aspect-square relative bg-[var(--warm)]">
        {p.imagen_url ? (
          <Image src={p.imagen_url} alt={p.nombre} fill className="object-cover" sizes="300px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {EMOJIS[p.categoria] ?? '💎'}
          </div>
        )}
        <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full ${stockBadge.cls}`}>
          {stockBadge.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--gold-dark)] mb-1">
          {p.categoria}
        </p>
        <h3 className="font-display text-lg font-semibold text-[var(--earth)] leading-tight mb-1">
          {p.nombre}
        </h3>
        <p className="text-xs text-[var(--text-soft)] leading-relaxed flex-1 mb-3">
          {p.descripcion}
        </p>
        <div className="flex items-end justify-between mb-3">
          <span className="font-display text-2xl font-semibold text-[var(--bronze)]">
            {fmt(p.precio)}
          </span>
          <span className="text-xs text-[var(--text-soft)]">
            {p.stock > 0 ? `Stock: ${p.stock}` : '—'}
          </span>
        </div>
        <button
          disabled={p.stock === 0}
          onClick={handleAgregar}
          className="w-full bg-[var(--earth)] text-[var(--cream)] text-xs font-medium tracking-widest uppercase py-2.5 rounded-md hover:bg-[var(--bronze)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {p.stock === 0 ? 'Sin stock' : '+ Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
