import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { supabaseAdmin } from '@/lib/supabase'

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Solo procesar notificaciones de pago
  if (body.type !== 'payment') {
    return NextResponse.json({ ok: true })
  }

  try {
    const payment = new Payment(mp)
    const pago = await payment.get({ id: body.data.id })

    const pedidoId = pago.external_reference
    const status = pago.status // approved | pending | rejected

    if (!pedidoId) return NextResponse.json({ ok: true })

    // Mapear estado de MP a estado interno
    const estadoMap: Record<string, string> = {
      approved: 'pagado',
      pending: 'pendiente',
      rejected: 'pendiente'
    }

    await supabaseAdmin
      .from('pedidos')
      .update({
        mp_payment_id: String(pago.id),
        mp_status: status,
        estado: estadoMap[status ?? 'pending'] ?? 'pendiente'
      })
      .eq('id', pedidoId)

  } catch (e) {
    console.error('Webhook error:', e)
  }

  return NextResponse.json({ ok: true })
}
