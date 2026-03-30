import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { supabaseAdmin } from '@/lib/supabase'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const productoId = formData.get('productoId') as string | null

  if (!file || !productoId) {
    return NextResponse.json({ error: 'Archivo y productoId son requeridos' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'La imagen no puede superar 5MB' }, { status: 400 })
  }

  // Convertir a buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Subir a Cloudinary
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'alma-artesanal',
        public_id: `producto-${productoId}`,
        overwrite: true,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result as { secure_url: string })
      }
    ).end(buffer)
  })

  // Guardar URL en Supabase
  const { error } = await supabaseAdmin
    .from('productos')
    .update({ imagen_url: result.secure_url })
    .eq('id', productoId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ url: result.secure_url })
}
