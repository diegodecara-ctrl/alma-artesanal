import { supabase } from '@/lib/supabase'
import type { Producto, Subcategoria } from '@/types'
import Header from '@/components/ui/Header'
import Hero from '@/components/shop/Hero'
import TiendaFiltros from '@/components/shop/TiendaFiltros'

export const revalidate = 60 // revalidar cada 60s

async function getProductos(): Promise<Producto[]> {
  const { data } = await supabase
    .from('productos')
    .select('*, producto_atributos(valor_id)')
    .eq('activo', true)
    .order('creado_en', { ascending: false })
  return (data ?? []).map(({ producto_atributos, ...p }: any) => ({
    ...p,
    atributos: (producto_atributos ?? []).map((a: any) => a.valor_id)
  }))
}

async function getSubcategorias(): Promise<Subcategoria[]> {
  const { data } = await supabase
    .from('subcategorias')
    .select('*, subcategoria_valores(*)')
    .order('orden')
    .order('orden', { foreignTable: 'subcategoria_valores' })
  return data ?? []
}

export default async function HomePage() {
  const [productos, subcategorias] = await Promise.all([getProductos(), getSubcategorias()])

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
          <TiendaFiltros productos={productos} subcategorias={subcategorias} />
        </section>
      </main>
    </>
  )
}
