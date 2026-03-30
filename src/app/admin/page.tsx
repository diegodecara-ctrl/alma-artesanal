'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload, Pencil, Check, X } from 'lucide-react'
import Header from '@/components/ui/Header'
import type { Producto, Categoria } from '@/types'

const CATEGORIAS: Categoria[] = ['Collares','Pulseras','Aros','Anillos','Broches','Sets','Otro']
const fmt = (n: number) => '$' + n.toLocaleString('es-AR')

export default function AdminPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => { cargarProductos() }, [])

  async function cargarProductos() {
    setCargando(true)
    const res = await fetch('/api/products')
    const data = await res.json()
    setProductos(data)
    setCargando(false)
  }

  async function eliminarProducto(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
    setProductos(p => p.filter(x => x.id !== id))
    toast.success('Producto eliminado')
  }

  async function actualizarCampo(id: string, campo: string, valor: number) {
    const res = await fetch('/api/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [campo]: valor })
    })
    if (res.ok) {
      setProductos(p => p.map(x => x.id === id ? { ...x, [campo]: valor } : x))
      toast.success('Actualizado ✓')
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-light text-[var(--earth)]">
              Panel de <em className="text-[var(--bronze)]">Administración</em>
            </h1>
            <p className="text-sm text-[var(--text-soft)] mt-1">Gestioná tus productos e imágenes</p>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 bg-[var(--earth)] text-[var(--cream)] text-xs font-semibold tracking-widest uppercase px-5 py-3 rounded-lg hover:bg-[var(--bronze)] transition-colors"
          >
            <Plus size={14} /> Nuevo producto
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Lista de productos */}
          <div className="bg-[var(--white)] rounded-2xl p-6 shadow-md">
            <h2 className="font-display text-xl font-semibold text-[var(--earth)] border-b-2 border-[var(--gold)] pb-3 mb-5">
              Productos ({productos.length})
            </h2>
            {cargando ? (
              <p className="text-[var(--text-soft)] text-sm py-8 text-center">Cargando...</p>
            ) : productos.length === 0 ? (
              <p className="text-[var(--text-soft)] text-sm py-8 text-center">No hay productos aún.</p>
            ) : (
              productos.map(p => (
                <ProductoAdminRow
                  key={p.id}
                  producto={p}
                  onActualizar={actualizarCampo}
                  onEliminar={() => eliminarProducto(p.id, p.nombre)}
                  onImagenActualizada={(url) => setProductos(prev =>
                    prev.map(x => x.id === p.id ? { ...x, imagen_url: url } : x)
                  )}
                />
              ))
            )}
          </div>

          {/* Subir imagen */}
          <ImagenManager productos={productos} onActualizada={(id, url) =>
            setProductos(p => p.map(x => x.id === id ? { ...x, imagen_url: url } : x))
          } />
        </div>
      </main>

      {modalAbierto && (
        <NuevoProductoModal
          onCerrar={() => setModalAbierto(false)}
          onCreado={(p) => { setProductos(prev => [p, ...prev]); setModalAbierto(false) }}
        />
      )}
    </>
  )
}

// ── Fila de producto en admin ─────────────────────────────

function ProductoAdminRow({ producto: p, onActualizar, onEliminar, onImagenActualizada }: {
  producto: Producto
  onActualizar: (id: string, campo: string, valor: number) => void
  onEliminar: () => void
  onImagenActualizada: (url: string) => void
}) {
  const [editPrecio, setEditPrecio] = useState(false)
  const [editStock, setEditStock] = useState(false)
  const [precio, setPrecio] = useState(p.precio)
  const [stock, setStock] = useState(p.stock)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--warm)] last:border-0">
      <div className="w-12 h-12 rounded-lg bg-[var(--warm)] flex-shrink-0 relative overflow-hidden">
        {p.imagen_url
          ? <Image src={p.imagen_url} alt={p.nombre} fill className="object-cover" sizes="48px" />
          : <div className="w-full h-full flex items-center justify-center text-lg">💎</div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--earth)] truncate">{p.nombre}</p>
        <p className="text-xs text-[var(--text-soft)]">{p.categoria}</p>
      </div>

      {/* Precio inline */}
      <div className="flex items-center gap-1">
        {editPrecio ? (
          <>
            <input
              type="number" value={precio} min={0}
              onChange={e => setPrecio(Number(e.target.value))}
              className="w-24 border border-[var(--gold)] rounded px-2 py-1 text-xs bg-[var(--cream)]"
            />
            <button onClick={() => { onActualizar(p.id, 'precio', precio); setEditPrecio(false) }} className="text-green-600"><Check size={14}/></button>
            <button onClick={() => { setPrecio(p.precio); setEditPrecio(false) }} className="text-red-400"><X size={14}/></button>
          </>
        ) : (
          <button onClick={() => setEditPrecio(true)} className="flex items-center gap-1 text-xs text-[var(--bronze)] hover:underline">
            {fmt(precio)} <Pencil size={11}/>
          </button>
        )}
      </div>

      {/* Stock inline */}
      <div className="flex items-center gap-1">
        {editStock ? (
          <>
            <input
              type="number" value={stock} min={0}
              onChange={e => setStock(Number(e.target.value))}
              className="w-16 border border-[var(--gold)] rounded px-2 py-1 text-xs bg-[var(--cream)]"
            />
            <button onClick={() => { onActualizar(p.id, 'stock', stock); setEditStock(false) }} className="text-green-600"><Check size={14}/></button>
            <button onClick={() => { setStock(p.stock); setEditStock(false) }} className="text-red-400"><X size={14}/></button>
          </>
        ) : (
          <button onClick={() => setEditStock(true)} className="flex items-center gap-1 text-xs text-[var(--text-soft)] hover:underline">
            Stock: {stock} <Pencil size={11}/>
          </button>
        )}
      </div>

      <button onClick={onEliminar} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
        <Trash2 size={15} />
      </button>
    </div>
  )
}

// ── Gestor de imágenes ────────────────────────────────────

function ImagenManager({ productos, onActualizada }: {
  productos: Producto[]
  onActualizada: (id: string, url: string) => void
}) {
  const [productoId, setProductoId] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('Imagen demasiado grande (máx. 5MB)'); return }
    setArchivo(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleGuardar() {
    if (!productoId) { toast.error('Seleccioná un producto'); return }
    if (!archivo) { toast.error('Seleccioná una imagen'); return }
    setSubiendo(true)
    const fd = new FormData()
    fd.append('file', archivo)
    fd.append('productoId', productoId)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      onActualizada(productoId, data.url)
      toast.success('Imagen guardada ✓')
      setArchivo(null); setPreview(null); setProductoId('')
      if (inputRef.current) inputRef.current.value = ''
    } else {
      toast.error(data.error || 'Error subiendo imagen')
    }
    setSubiendo(false)
  }

  return (
    <div className="bg-[var(--white)] rounded-2xl p-6 shadow-md sticky top-24">
      <h2 className="font-display text-xl font-semibold text-[var(--earth)] border-b-2 border-[var(--gold)] pb-3 mb-5">
        Gestión de imágenes
      </h2>
      <p className="text-xs text-[var(--text-soft)] mb-4">
        Seleccioná un producto y subí o reemplazá su imagen.
      </p>

      <div className="mb-4">
        <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1">Producto</label>
        <select
          value={productoId}
          onChange={e => setProductoId(e.target.value)}
          className="w-full border-[1.5px] border-[var(--warm)] bg-[var(--cream)] text-[var(--earth)] text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="">— elegí un producto —</option>
          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-[2.5px] border-dashed border-[var(--gold)] rounded-xl p-6 text-center cursor-pointer hover:bg-[var(--warm)] transition-colors mb-4"
      >
        <Upload size={32} className="mx-auto text-[var(--gold)] mb-2" />
        <p className="text-xs text-[var(--text-soft)]">
          Hacé clic para subir una imagen<br />
          <span className="text-[10px]">JPG, PNG, WEBP · Máx. 5MB</span>
        </p>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleArchivo} className="hidden" />
      </div>

      {preview && (
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-[var(--warm)]">
          <Image src={preview} alt="Preview" fill className="object-cover" sizes="340px" />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleGuardar}
          disabled={subiendo}
          className="flex-1 bg-[var(--earth)] text-[var(--cream)] text-xs font-semibold tracking-widest uppercase py-2.5 rounded-lg hover:bg-[var(--bronze)] disabled:opacity-50 transition-colors"
        >
          {subiendo ? 'Subiendo...' : 'Guardar imagen'}
        </button>
        {preview && (
          <button
            onClick={() => { setArchivo(null); setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
            className="px-4 border-[1.5px] border-[var(--gold)] text-[var(--earth)] text-xs rounded-lg hover:bg-[var(--warm)] transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}

// ── Modal nuevo producto ──────────────────────────────────

function NuevoProductoModal({ onCerrar, onCreado }: {
  onCerrar: () => void
  onCreado: (p: Producto) => void
}) {
  const [form, setForm] = useState({ nombre:'', descripcion:'', precio:'', stock:'', categoria: 'Collares' as Categoria })
  const [cargando, setCargando] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleCrear() {
    if (!form.nombre || !form.precio) { toast.error('Nombre y precio son obligatorios'); return }
    setCargando(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, precio: Number(form.precio), stock: Number(form.stock) || 0 })
    })
    const data = await res.json()
    if (res.ok) { onCreado(data); toast.success(`"${data.nombre}" creado ✓`) }
    else { toast.error(data.error) }
    setCargando(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="bg-[var(--white)] rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-2xl font-semibold text-[var(--earth)] mb-6">Nuevo producto</h2>

        {[
          { key: 'nombre', label: 'Nombre *', placeholder: 'Collar de turquesa' },
          { key: 'descripcion', label: 'Descripción', placeholder: 'Materiales, tamaño...' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="mb-3">
            <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1">{label}</label>
            <input type="text" value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
              className="w-full border-[1.5px] border-[var(--warm)] bg-[var(--cream)] text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--gold)]" />
          </div>
        ))}

        <div className="mb-3">
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1">Categoría</label>
          <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
            className="w-full border-[1.5px] border-[var(--warm)] bg-[var(--cream)] text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--gold)]">
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { key: 'precio', label: 'Precio ($) *', placeholder: '2500' },
            { key: 'stock', label: 'Stock inicial', placeholder: '5' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--text-soft)] mb-1">{label}</label>
              <input type="number" min={0} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                className="w-full border-[1.5px] border-[var(--warm)] bg-[var(--cream)] text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--gold)]" />
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onCerrar} className="px-5 py-2 border-[1.5px] border-[var(--gold)] text-[var(--earth)] text-xs font-semibold tracking-widest uppercase rounded-lg hover:bg-[var(--warm)] transition-colors">
            Cancelar
          </button>
          <button onClick={handleCrear} disabled={cargando}
            className="px-5 py-2 bg-[var(--earth)] text-[var(--cream)] text-xs font-semibold tracking-widest uppercase rounded-lg hover:bg-[var(--bronze)] disabled:opacity-50 transition-colors">
            {cargando ? 'Creando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
