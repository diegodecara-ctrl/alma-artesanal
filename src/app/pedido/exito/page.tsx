import Link from 'next/link'
import Header from '@/components/ui/Header'

export default function ExitoPage({
  searchParams
}: {
  searchParams: { numero?: string; id?: string }
}) {
  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-[var(--white)] rounded-2xl p-10 shadow-lg">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="font-display text-4xl font-light text-[var(--earth)] mb-3">
            ¡Pedido confirmado!
          </h1>
          {searchParams.numero && (
            <p className="text-[var(--bronze)] font-semibold mb-3">
              Pedido #{searchParams.numero}
            </p>
          )}
          <p className="text-[var(--text-soft)] text-sm leading-relaxed mb-6">
            Muchas gracias por tu compra. Te enviamos un email con los detalles.
            Nos comunicaremos pronto para coordinar el envío.
          </p>
          <Link
            href="/"
            className="inline-block bg-[var(--earth)] text-[var(--cream)] text-xs font-semibold tracking-widest uppercase px-8 py-3 rounded-md hover:bg-[var(--bronze)] transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
      </main>
    </>
  )
}
