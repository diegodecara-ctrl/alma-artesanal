import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/subcategorias/valores — crear un ítem dentro de una subcategoría
export async function POST(req: NextRequest) {
  const { subcategoria_id, nombre } = await req.json()
  if (!subcategoria_id || !nombre) {
    return NextResponse.json({ error: 'Subcategoría y nombre son obligatorios' }, { status: 400 })
  }

  const { count } = await supabaseAdmin
    .from('subcategoria_valores')
    .select('id', { count: 'exact', head: true })
    .eq('subcategoria_id', subcategoria_id)

  const { data, error } = await supabaseAdmin
    .from('subcategoria_valores')
    .insert({ subcategoria_id, nombre, orden: count ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/subcategorias/valores?id=... — elimina un ítem
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { error } = await supabaseAdmin.from('subcategoria_valores').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
