-- ═══════════════════════════════════════════════════
-- ALMA ARTESANAL — Schema de base de datos
-- Ejecutar en: Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ───────────────────────────────────────────────────
-- TABLA: productos
-- ───────────────────────────────────────────────────
create table public.productos (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  descripcion text,
  precio      numeric(10,2) not null check (precio >= 0),
  stock       integer not null default 0 check (stock >= 0),
  categoria   text not null default 'Otro',
  imagen_url  text,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- ───────────────────────────────────────────────────
-- TABLA: pedidos
-- ───────────────────────────────────────────────────
create table public.pedidos (
  id              uuid primary key default uuid_generate_v4(),
  numero          serial unique,                    -- número legible: 1, 2, 3...
  estado          text not null default 'pendiente' -- pendiente | pagado | enviado | entregado | cancelado
                  check (estado in ('pendiente','pagado','enviado','entregado','cancelado')),

  -- Datos del comprador
  nombre          text not null,
  email           text not null,
  telefono        text,

  -- Datos de envío
  direccion       text not null,
  ciudad          text not null,
  provincia       text not null,
  codigo_postal   text,
  nota            text,

  -- Totales
  subtotal        numeric(10,2) not null default 0,
  costo_envio     numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,

  -- MercadoPago
  mp_preference_id  text,
  mp_payment_id     text,
  mp_status         text,

  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

-- ───────────────────────────────────────────────────
-- TABLA: items_pedido (líneas del carrito)
-- ───────────────────────────────────────────────────
create table public.items_pedido (
  id          uuid primary key default uuid_generate_v4(),
  pedido_id   uuid not null references public.pedidos(id) on delete cascade,
  producto_id uuid not null references public.productos(id),
  cantidad    integer not null check (cantidad > 0),
  precio_unit numeric(10,2) not null,    -- precio al momento de la compra
  subtotal    numeric(10,2) not null
);

-- ───────────────────────────────────────────────────
-- FUNCIÓN: actualizar updated_at automáticamente
-- ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger productos_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

create trigger pedidos_updated_at
  before update on public.pedidos
  for each row execute function public.set_updated_at();

-- ───────────────────────────────────────────────────
-- FUNCIÓN: descontar stock al confirmar pedido
-- ───────────────────────────────────────────────────
create or replace function public.descontar_stock(items jsonb)
returns void language plpgsql as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    update public.productos
    set stock = stock - (item->>'cantidad')::integer
    where id = (item->>'producto_id')::uuid
      and stock >= (item->>'cantidad')::integer;

    if not found then
      raise exception 'Stock insuficiente para producto %', item->>'producto_id';
    end if;
  end loop;
end;
$$;

-- ───────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────
alter table public.productos enable row level security;
alter table public.pedidos enable row level security;
alter table public.items_pedido enable row level security;

-- Productos: lectura pública, escritura solo con service role
create policy "productos_lectura_publica" on public.productos
  for select using (activo = true);

create policy "productos_admin" on public.productos
  for all using (auth.role() = 'service_role');

-- Pedidos: solo service role (se maneja desde el servidor)
create policy "pedidos_service_role" on public.pedidos
  for all using (auth.role() = 'service_role');

create policy "items_service_role" on public.items_pedido
  for all using (auth.role() = 'service_role');

-- ───────────────────────────────────────────────────
-- DATOS DE EJEMPLO
-- ───────────────────────────────────────────────────
insert into public.productos (nombre, descripcion, precio, stock, categoria) values
  ('Collar Boho Luna',       'Dije de luna en zamak bañado en oro con piedras naturales de howlita blanca.', 3200, 8,  'Collares'),
  ('Pulsera Trenzada Cobre', 'Hilo encerado trenzado a mano con dije de cobre martillado. Ajustable.',       1800, 5,  'Pulseras'),
  ('Aros Mandala Plata',     'Aros colgantes con diseño mandala, bañados en plata 925. Livianos y elegantes.', 2400, 3, 'Aros'),
  ('Anillo Flor Dorado',     'Anillo de flor en bronce bañado en oro, talle ajustable.',                     1500, 12, 'Anillos'),
  ('Set Primavera',          'Collar + pulsera a juego con flores secas encapsuladas en resina. Ed. limitada.', 5800, 2, 'Sets'),
  ('Broche Mariposa',        'Broche esmaltado a mano con detalles de mariposa en tonos pastel.',              950,  7, 'Broches');
