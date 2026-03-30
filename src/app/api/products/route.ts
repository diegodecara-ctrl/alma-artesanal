import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/products — lista todos los productos activos
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/products — crear producto
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, descripcion, precio, stock, categoria } = body

  if (!nombre || precio == null) {
    return NextResponse.json({ error: 'Nombre y precio son obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('productos')
    .insert({ nombre, descripcion, precio, stock: stock ?? 0, categoria: categoria ?? 'Otro' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/products — actualizar precio o stock
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...campos } = body

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('productos')
    .update(campos)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/products — desactivar (soft delete)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('productos')
    .update({ activo: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
