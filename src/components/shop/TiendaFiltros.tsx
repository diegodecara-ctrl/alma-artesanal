'use client'
import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import ProductGrid from './ProductGrid'
import type { Producto, Subcategoria, Categoria } from '@/types'

export default function TiendaFiltros({ productos, subcategorias }: {
  productos: Producto[]
  subcategorias: Subcategoria[]
}) {
  const categoriasDisponibles = useMemo(
    () => Array.from(new Set(productos.map(p => p.categoria))),
    [productos]
  )

  const [categoria, setCategoria] = useState<Categoria | 'Todas'>('Todas')
  const [filtrosValores, setFiltrosValores] = useState<Record<string, Set<string>>>({})

  const subcategoriasCategoria = categoria === 'Todas'
    ? []
    : subcategorias.filter(s => s.categoria === categoria)

  function toggleValor(subId: string, valorId: string) {
    setFiltrosValores(f => {
      const actual = new Set(f[subId] ?? [])
      actual.has(valorId) ? actual.delete(valorId) : actual.add(valorId)
      return { ...f, [subId]: actual }
    })
  }

  function cambiarCategoria(c: Categoria | 'Todas') {
    setCategoria(c)
    setFiltrosValores({})
  }

  const hayFiltrosActivos = Object.values(filtrosValores).some(s => s.size > 0)

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      if (categoria !== 'Todas' && p.categoria !== categoria) return false
      return Object.values(filtrosValores).every(valorIds => {
        if (valorIds.size === 0) return true
        return (p.atributos ?? []).some(v => valorIds.has(v))
      })
    })
  }, [productos, categoria, filtrosValores])

  return (
    <div>
      {/* Tabs de categoría */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => cambiarCategoria('Todas')}
          className={`text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border transition-colors ${
            categoria === 'Todas'
              ? 'bg-[var(--earth)] border-[var(--earth)] text-[var(--cream)]'
              : 'border-[var(--warm)] text-[var(--text-soft)] hover:border-[var(--gold)]'
          }`}
        >
          Todas
        </button>
        {categoriasDisponibles.map(c => (
          <button
            key={c}
            onClick={() => cambiarCategoria(c)}
            className={`text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border transition-colors ${
              categoria === c
                ? 'bg-[var(--earth)] border-[var(--earth)] text-[var(--cream)]'
                : 'border-[var(--warm)] text-[var(--text-soft)] hover:border-[var(--gold)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Filtros por subcategoría */}
      {subcategoriasCategoria.length > 0 && (
        <div className="bg-[var(--white)] rounded-xl p-5 shadow-sm mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--earth)]">Filtrar {categoria}</p>
            {hayFiltrosActivos && (
              <button onClick={() => setFiltrosValores({})} className="flex items-center gap-1 text-[11px] text-[var(--text-soft)] hover:text-red-400">
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
          {subcategoriasCategoria.map(sub => (
            <div key={sub.id}>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1.5">{sub.nombre}</p>
              <div className="flex flex-wrap gap-1.5">
                {sub.subcategoria_valores.map(v => {
                  const activo = filtrosValores[sub.id]?.has(v.id) ?? false
                  return (
                    <button
                      key={v.id}
                      onClick={() => toggleValor(sub.id, v.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                        activo
                          ? 'bg-[var(--gold)] border-[var(--gold)] text-[var(--earth)] font-semibold'
                          : 'border-[var(--warm)] text-[var(--text-soft)] hover:border-[var(--gold)]'
                      }`}
                    >
                      {v.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductGrid productos={productosFiltrados} />
    </div>
  )
}
