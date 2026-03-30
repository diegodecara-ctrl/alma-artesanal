import { supabase } from '@/lib/supabase'
import type { Producto } from '@/types'
import Header from '@/components/ui/Header'
import Hero from '@/components/shop/Hero'
import ProductGrid from '@/components/shop/ProductGrid'

export const revalidate = 60 // revalidar cada 60s

async function getProductos(): Promise<Producto[]> {
  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: false })
  return data ?? []
}

export default async function HomePage() {
  const productos = await getProductos()

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Hero />
        <section id="productos" className="mt-12">
          <h2 className="font-display text-4xl font-light text-[var(--earth)] mb-1">
            Nuestra <em className="text-[var(--bronze)]">Colección</em>
          </h2>
          <p className="text-sm text-[var(--text-soft)] mb-8 tracking-wide">
            Piezas únicas disponibles ahora mismo
          </p>
          <ProductGrid productos={productos} />
        </section>
      </main>
    </>
  )
}
