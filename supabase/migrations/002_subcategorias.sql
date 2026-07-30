-- ═══════════════════════════════════════════════════
-- CREACIONES NALA — Subcategorías y atributos de producto
-- Ejecutar en: Supabase → SQL Editor → New query
-- (después de haber corrido 001_schema.sql)
-- ═══════════════════════════════════════════════════

-- ───────────────────────────────────────────────────
-- TABLA: subcategorias (grupos de atributos por categoría,
-- ej. "Material" o "Colores de colgante" dentro de "Aros")
-- ───────────────────────────────────────────────────
create table public.subcategorias (
  id        uuid primary key default uuid_generate_v4(),
  categoria text not null,
  nombre    text not null,
  orden     integer not null default 0,
  creado_en timestamptz not null default now(),
  unique (categoria, nombre)
);

-- ───────────────────────────────────────────────────
-- TABLA: subcategoria_valores (los ítems seleccionables
-- dentro de cada subcategoría, ej. "Plata", "Oro rosa")
-- ───────────────────────────────────────────────────
create table public.subcategoria_valores (
  id              uuid primary key default uuid_generate_v4(),
  subcategoria_id uuid not null references public.subcategorias(id) on delete cascade,
  nombre          text not null,
  orden           integer not null default 0,
  creado_en       timestamptz not null default now(),
  unique (subcategoria_id, nombre)
);

-- ───────────────────────────────────────────────────
-- TABLA: producto_atributos (qué valores tiene asignado
-- cada producto — permite varios valores por producto)
-- ───────────────────────────────────────────────────
create table public.producto_atributos (
  producto_id uuid not null references public.productos(id) on delete cascade,
  valor_id    uuid not null references public.subcategoria_valores(id) on delete cascade,
  primary key (producto_id, valor_id)
);

-- ───────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────
alter table public.subcategorias enable row level security;
alter table public.subcategoria_valores enable row level security;
alter table public.producto_atributos enable row level security;

create policy "subcategorias_lectura_publica" on public.subcategorias for select using (true);
create policy "subcategorias_admin" on public.subcategorias for all using (auth.role() = 'service_role');

create policy "valores_lectura_publica" on public.subcategoria_valores for select using (true);
create policy "valores_admin" on public.subcategoria_valores for all using (auth.role() = 'service_role');

create policy "atributos_lectura_publica" on public.producto_atributos for select using (true);
create policy "atributos_admin" on public.producto_atributos for all using (auth.role() = 'service_role');

-- ───────────────────────────────────────────────────
-- DATOS: subcategorías e ítems de la categoría "Aros"
-- (las demás categorías quedan sin subcategorías por ahora,
-- se cargan desde el panel de administración)
-- ───────────────────────────────────────────────────
with sub as (
  insert into public.subcategorias (categoria, nombre, orden) values
    ('Aros', 'Modelos', 1),
    ('Aros', 'Tipo de brisura', 2),
    ('Aros', 'Material', 3),
    ('Aros', 'Colores de brisura', 4),
    ('Aros', 'Colores de colgante', 5)
  returning id, nombre
)
insert into public.subcategoria_valores (subcategoria_id, nombre, orden)
select sub.id, v.nombre, v.orden
from sub
join (values
  ('Modelos', 'Flores', 1),
  ('Modelos', 'Geométricos', 2),
  ('Modelos', 'Colgantes', 3),
  ('Modelos', 'Grandes', 4),
  ('Modelos', 'Corazones', 5),
  ('Modelos', 'Pequeños', 6),
  ('Modelos', 'Mini', 7),

  ('Tipo de brisura', 'Argolla', 1),
  ('Tipo de brisura', 'Tipo anzuelo', 2),
  ('Tipo de brisura', 'Gancho francés', 3),
  ('Tipo de brisura', 'Redonda', 4),
  ('Tipo de brisura', 'Base de aro plana', 5),
  ('Tipo de brisura', 'Tipo lazo/moñito', 6),
  ('Tipo de brisura', 'Con diamante imitación', 7),
  ('Tipo de brisura', 'Bandeja', 8),
  ('Tipo de brisura', 'Pasador tipo bolita', 9),
  ('Tipo de brisura', 'Gancho en forma de V', 10),

  ('Material', 'Acero inoxidable', 1),
  ('Material', 'Níquel', 2),
  ('Material', 'Acero quirúrgico', 3),
  ('Material', 'Plata', 4),
  ('Material', 'Madera', 5),

  ('Colores de brisura', 'Plata', 1),
  ('Colores de brisura', 'Oro', 2),
  ('Colores de brisura', 'Oro rosa', 3),
  ('Colores de brisura', 'Arcoíris', 4),

  ('Colores de colgante', 'Blanco', 1),
  ('Colores de colgante', 'Negro', 2),
  ('Colores de colgante', 'Rosa', 3),
  ('Colores de colgante', 'Rojo', 4),
  ('Colores de colgante', 'Naranja', 5),
  ('Colores de colgante', 'Azul', 6),
  ('Colores de colgante', 'Celeste', 7),
  ('Colores de colgante', 'Turquesa', 8),
  ('Colores de colgante', 'Verde', 9),
  ('Colores de colgante', 'Lila', 10),
  ('Colores de colgante', 'Violeta', 11),
  ('Colores de colgante', 'Amarillo', 12),
  ('Colores de colgante', 'Dorado', 13),
  ('Colores de colgante', 'Bronce', 14),
  ('Colores de colgante', 'Fuxia', 15),
  ('Colores de colgante', 'Gris', 16),
  ('Colores de colgante', 'Granito', 17),
  ('Colores de colgante', 'Plata', 18),
  ('Colores de colgante', 'Beige', 19),
  ('Colores de colgante', 'Galaxy', 20),
  ('Colores de colgante', 'Lavanda', 21),
  ('Colores de colgante', 'Rosa pastel', 22),
  ('Colores de colgante', 'Mostaza', 23),
  ('Colores de colgante', 'Oliva', 24),
  ('Colores de colgante', 'Mix', 25),
  ('Colores de colgante', 'Mix rayas', 26),
  ('Colores de colgante', 'Marmolado', 27),
  ('Colores de colgante', 'Con brillos', 28),
  ('Colores de colgante', 'Animal print', 29),
  ('Colores de colgante', 'Jaspeado', 30)
) as v(subnombre, nombre, orden) on v.subnombre = sub.nombre;
