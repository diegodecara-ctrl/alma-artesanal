import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/subcategorias — lista todas las subcategorías con sus valores
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('subcategorias')
    .select('*, subcategoria_valores(*)')
    .order('orden')
    .order('orden', { foreignTable: 'subcategoria_valores' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/subcategorias — crear subcategoría (ej. "Material" para "Aros")
export async function POST(req: NextRequest) {
  const { categoria, nombre } = await req.json()
  if (!categoria || !nombre) {
    return NextResponse.json({ error: 'Categoría y nombre son obligatorios' }, { status: 400 })
  }

  const { count } = await supabaseAdmin
    .from('subcategorias')
    .select('id', { count: 'exact', head: true })
    .eq('categoria', categoria)

  const { data, error } = await supabaseAdmin
    .from('subcategorias')
    .insert({ categoria, nombre, orden: count ?? 0 })
    .select('*, subcategoria_valores(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/subcategorias?id=... — elimina una subcategoría y sus valores
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { error } = await supabaseAdmin.from('subcategorias').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
