import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { Resend } from 'resend'
import type { CrearPedidoPayload } from '@/types'

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
const resend = new Resend(process.env.RESEND_API_KEY!)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function POST(req: NextRequest) {
  const body: CrearPedidoPayload = await req.json()
  const { items, envio, subtotal, total } = body

  if (!items?.length || !envio?.nombre) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  // 1. Crear pedido en Supabase
  const { data: pedido, error: pedidoError } = await supabaseAdmin
    .from('pedidos')
    .insert({
      nombre: envio.nombre,
      email: envio.email,
      telefono: envio.telefono,
      direccion: envio.direccion,
      ciudad: envio.ciudad,
      provincia: envio.provincia,
      codigo_postal: envio.codigo_postal,
      nota: envio.nota,
      subtotal,
      total,
      estado: 'pendiente'
    })
    .select()
    .single()

  if (pedidoError || !pedido) {
    return NextResponse.json({ error: 'Error creando pedido' }, { status: 500 })
  }

  // 2. Insertar items del pedido
  await supabaseAdmin.from('items_pedido').insert(
    items.map(item => ({
      pedido_id: pedido.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unit: item.precio_unit,
      subtotal: item.precio_unit * item.cantidad
    }))
  )

  // 3. Descontar stock
  try {
    await supabaseAdmin.rpc('descontar_stock', {
      items: items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad }))
    })
  } catch {
    // Si falla el stock, cancelar el pedido
    await supabaseAdmin.from('pedidos').update({ estado: 'cancelado' }).eq('id', pedido.id)
    return NextResponse.json({ error: 'Stock insuficiente para uno o más productos' }, { status: 409 })
  }

  // 4. Crear preferencia de MercadoPago
  let preferenceId: string | null = null
  try {
    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: items.map(item => ({
          id: item.producto_id,
          title: `Producto × ${item.cantidad}`,
          quantity: item.cantidad,
          unit_price: item.precio_unit,
          currency_id: 'ARS'
        })),
        payer: { name: envio.nombre, email: envio.email },
        back_urls: {
          success: `${APP_URL}/pedido/exito?id=${pedido.id}`,
          failure: `${APP_URL}/pedido/error?id=${pedido.id}`,
          pending: `${APP_URL}/pedido/pendiente?id=${pedido.id}`
        },
        auto_return: 'approved',
        notification_url: `${APP_URL}/api/webhook`,
        external_reference: pedido.id
      }
    })
    preferenceId = result.id ?? null
    await supabaseAdmin
      .from('pedidos')
      .update({ mp_preference_id: preferenceId })
      .eq('id', pedido.id)
  } catch (e) {
    console.error('MercadoPago error:', e)
  }

  // 5. Enviar email de confirmación
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: envio.email,
      subject: `✨ Pedido #${pedido.numero} recibido — Creaciones Nala`,
      html: emailConfirmacion(pedido.numero, envio, total)
    })
    // Email al admin
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_ADMIN!,
      subject: `🛒 Nuevo pedido #${pedido.numero} de ${envio.nombre}`,
      html: emailAdmin(pedido.numero, envio, items, total)
    })
  } catch (e) {
    console.error('Email error:', e)
  }

  return NextResponse.json({
    pedidoId: pedido.id,
    numeroPedido: pedido.numero,
    preferenceId,
    mpPublicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
  }, { status: 201 })
}

// ── Templates de email ──────────────────────────────

function emailConfirmacion(numero: number, envio: CrearPedidoPayload['envio'], total: number) {
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3d2b1f">
    <div style="background:#3d2b1f;padding:32px;text-align:center">
      <h1 style="color:#c9a96e;margin:0;font-size:28px;font-weight:300">Creaciones <em>Nala</em></h1>
    </div>
    <div style="padding:32px;background:#fdfaf5">
      <h2 style="font-weight:400">¡Gracias por tu pedido, ${envio.nombre}!</h2>
      <p>Recibimos tu pedido <strong>#${numero}</strong> correctamente.</p>
      <div style="background:#f5f0e8;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0"><strong>Envío a:</strong> ${envio.direccion}, ${envio.ciudad}, ${envio.provincia}</p>
        <p style="margin:8px 0 0"><strong>Total:</strong> $${total.toLocaleString('es-AR')}</p>
      </div>
      <p>Nos comunicaremos pronto para coordinar el envío y los detalles de pago.</p>
      <p style="color:#7a6355;font-size:14px">¿Dudas? Respondé este email y te ayudamos.</p>
    </div>
    <div style="background:#e8ddd0;padding:16px;text-align:center;font-size:12px;color:#7a6355">
      Hecho con amor · Creaciones Nala
    </div>
  </div>`
}

function emailAdmin(
  numero: number,
  envio: CrearPedidoPayload['envio'],
  items: CrearPedidoPayload['items'],
  total: number
) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
    <h2>Nuevo pedido #${numero}</h2>
    <p><strong>Cliente:</strong> ${envio.nombre} · ${envio.email} · ${envio.telefono}</p>
    <p><strong>Envío:</strong> ${envio.direccion}, ${envio.ciudad}, ${envio.provincia} ${envio.codigo_postal}</p>
    ${envio.nota ? `<p><strong>Nota:</strong> ${envio.nota}</p>` : ''}
    <p><strong>Items:</strong> ${items.map(i => `${i.cantidad}× ${i.producto_id}`).join(', ')}</p>
    <p><strong>Total: $${total.toLocaleString('es-AR')}</strong></p>
  </div>`
}
