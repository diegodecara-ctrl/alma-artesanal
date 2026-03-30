'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCarrito } from '@/hooks/useCarrito'

export default function Header() {
  const cantidadTotal = useCarrito(s => s.cantidadTotal)

  return (
    <header className="sticky top-0 z-50 bg-[var(--earth)] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-light text-[var(--gold)] tracking-widest">
          Alma <em className="text-[var(--cream)]">Artesanal</em>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/" className="text-[var(--warm)] hover:text-[var(--gold)] text-xs font-medium tracking-widest uppercase px-3 py-2 rounded transition-colors hidden sm:block">
            Tienda
          </Link>
          <Link href="/admin" className="text-[var(--warm)] hover:text-[var(--gold)] text-xs font-medium tracking-widest uppercase px-3 py-2 rounded transition-colors hidden sm:block">
            Administrar
          </Link>
          <Link href="/carrito" className="relative flex items-center gap-2 bg-[var(--gold)] text-[var(--earth)] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-md hover:bg-[var(--gold-dark)] transition-colors">
            <ShoppingBag size={15} />
            Carrito
            {cantidadTotal() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cantidadTotal()}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
