export default function Hero() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[var(--earth)] via-[var(--bronze)] to-[var(--gold-dark)] p-12 sm:p-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(201,169,110,0.2),transparent_65%)]" />
      <div className="relative">
        <p className="text-[var(--gold)] text-xs font-medium tracking-[0.25em] uppercase mb-4">
          ✦ Hecho a mano con amor
        </p>
        <h1 className="font-display text-5xl sm:text-6xl font-light text-[var(--cream)] leading-tight mb-5 max-w-xl">
          Bijouterie que <em className="text-[var(--gold)]">cuenta historias</em>
        </h1>
        <p className="text-[var(--warm)] text-base max-w-md leading-relaxed mb-8">
          Cada pieza es única, creada con materiales seleccionados y técnicas artesanales que capturan la esencia de lo auténtico.
        </p>
        <a
          href="#productos"
          className="inline-block bg-[var(--gold)] text-[var(--earth)] text-xs font-semibold tracking-widest uppercase px-8 py-3 rounded-md hover:bg-[var(--gold-dark)] transition-all hover:-translate-y-0.5"
        >
          Ver colección
        </a>
      </div>
    </div>
  )
}
