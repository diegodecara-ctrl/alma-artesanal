// ═══════════════════════════════════════════
// Tipos principales de Creaciones Nala
// ═══════════════════════════════════════════

export type Categoria = 'Collares' | 'Pulseras' | 'Aros' | 'Anillos' | 'Broches' | 'Sets' | 'Otro'

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  stock: number
  categoria: Categoria
  imagen_url: string | null
  activo: boolean
  creado_en: string
  actualizado_en: string
  atributos?: string[] // ids de subcategoria_valores asignados
}

export interface SubcategoriaValor {
  id: string
  subcategoria_id: string
  nombre: string
  orden: number
}

export interface Subcategoria {
  id: string
  categoria: Categoria
  nombre: string
  orden: number
  subcategoria_valores: SubcategoriaValor[]
}

export interface ItemCarrito {
  producto: Producto
  cantidad: number
}

export type EstadoPedido = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado'

export interface DatosEnvio {
  nombre: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  provincia: string
  codigo_postal: string
  nota: string
}

export interface Pedido {
  id: string
  numero: number
  estado: EstadoPedido
  nombre: string
  email: string
  telefono: string | null
  direccion: string
  ciudad: string
  provincia: string
  codigo_postal: string | null
  nota: string | null
  subtotal: number
  costo_envio: number
  total: number
  mp_preference_id: string | null
  mp_payment_id: string | null
  mp_status: string | null
  creado_en: string
  actualizado_en: string
  items?: ItemPedido[]
}

export interface ItemPedido {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unit: number
  subtotal: number
  producto?: Producto
}

export interface CrearPedidoPayload {
  items: { producto_id: string; cantidad: number; precio_unit: number }[]
  envio: DatosEnvio
  subtotal: number
  total: number
}
