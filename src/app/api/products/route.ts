import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function conAtributos(producto: any) {
  const { producto_atributos, ...resto } = producto
  return { ...resto, atributos: (producto_atributos ?? []).map((a: any) => a.valor_id) }
}

// GET /api/products — lista todos los productos activos
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('productos')
    .select('*, producto_atributos(valor_id)')
    .eq('activo', true)
    .order('creado_en', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(conAtributos))
}

// POST /api/products — crear producto
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, descripcion, precio, stock, categoria, atributos } = body

  if (!nombre || precio == null) {
    return NextResponse.json({ error: 'Nombre y precio son obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('productos')
    .insert({ nombre, descripcion, precio, stock: stock ?? 0, categoria: categoria ?? 'Otro' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (Array.isArray(atributos) && atributos.length) {
    await supabaseAdmin
      .from('producto_atributos')
      .insert(atributos.map((valor_id: string) => ({ producto_id: data.id, valor_id })))
  }

  return NextResponse.json({ ...data, atributos: atributos ?? [] }, { status: 201 })
}

// PATCH /api/products — actualizar campos (precio, stock, atributos, etc.)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, atributos, ...campos } = body

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  let data = null
  if (Object.keys(campos).length) {
    const res = await supabaseAdmin.from('productos').update(campos).eq('id', id).select().single()
    if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 })
    data = res.data
  }

  if (Array.isArray(atributos)) {
    await supabaseAdmin.from('producto_atributos').delete().eq('producto_id', id)
    if (atributos.length) {
      await supabaseAdmin
        .from('producto_atributos')
        .insert(atributos.map((valor_id: string) => ({ producto_id: id, valor_id })))
    }
  }

  return NextResponse.json(data ?? { id, atributos })
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
