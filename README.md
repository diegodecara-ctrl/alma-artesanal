# 🌸 Alma Artesanal — Tienda de Bijouterie

Tienda online completa construida con **Next.js 14**, **Supabase**, **Cloudinary**, **MercadoPago** y **Resend**.

---

## 🗂️ Estructura del proyecto

```
alma-artesanal/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/route.ts     ← CRUD de productos
│   │   │   ├── orders/route.ts       ← Crear pedidos + MP + email
│   │   │   ├── upload/route.ts       ← Subir imágenes a Cloudinary
│   │   │   └── webhook/route.ts      ← Notificaciones MercadoPago
│   │   ├── admin/page.tsx            ← Panel de administración
│   │   ├── carrito/page.tsx          ← Carrito + formulario de envío
│   │   ├── pedido/exito/page.tsx     ← Pantalla de confirmación
│   │   ├── layout.tsx
│   │   └── page.tsx                  ← Tienda (home)
│   ├── components/
│   │   ├── ui/Header.tsx
│   │   ├── shop/Hero.tsx
│   │   └── shop/ProductGrid.tsx
│   ├── hooks/useCarrito.ts           ← Estado del carrito (Zustand)
│   ├── lib/supabase.ts               ← Clientes de Supabase
│   └── types/index.ts                ← Tipos TypeScript
├── supabase/migrations/001_schema.sql ← Schema de la base de datos
├── .env.example                       ← Plantilla de variables de entorno
└── README.md
```

---

## 🚀 Guía de instalación paso a paso

### Paso 1 — Requisitos previos

Instalá en tu computadora:
- [Node.js 18+](https://nodejs.org) → descargá el instalador LTS
- [Git](https://git-scm.com) 
- Una cuenta de [GitHub](https://github.com) (gratis) con gmail

---

### Paso 2 — Configurar Supabase (base de datos)

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta gratis relacionada con github
2. Clic en **"New Project"** → elegí nombre (ej: `alma-artesanal`) → región **South America (São Paulo)**
3. Esperá ~2 minutos a que se cree nombre: almaartesanal, pass:Chumsam1972@ proyect url:https://siyhkjteibqiwcivpuhg.supabase.co
4. Andá a **SQL Editor** → **New query**
5. Pegá todo el contenido de `supabase/migrations/001_schema.sql` y ejecutá (▶ Run)
6. Andá a **Settings → API** y copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

### Paso 3 — Configurar Cloudinary (imágenes)

1. Creá cuenta gratis en [cloudinary.com](https://cloudinary.com) conectada a github
2. En el Dashboard copiá:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

### Paso 4 — Configurar MercadoPago (pagos)

1. Entrá a [mercadopago.com.ar](https://mercadopago.com.ar) con tu cuenta celu de silvia
2. Andá a **Tu negocio → Configuración → Credenciales**
3. En **Credenciales de prueba** copiá:
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`
   - `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
4. Cuando quieras cobrar de verdad, usá las **Credenciales de producción**

---

### Paso 5 — Configurar Resend (emails)

1. Creá cuenta gratis en [resend.com](https://resend.com)
2. Andá a **API Keys → Create API Key**
3. Copiá la key → `RESEND_API_KEY`
4. Para enviar desde tu dominio, verificalo en Resend → Domains
   (Si no tenés dominio propio, podés usar `onboarding@resend.dev` para pruebas)

---

### Paso 6 — Variables de entorno

```bash
# Copiá el archivo de ejemplo
cp .env.example .env.local

# Abrilo con cualquier editor de texto y completá todos los valores
```

---

### Paso 7 — Correr el proyecto localmente

```bash
# Instalá las dependencias
npm install

# Iniciá el servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

- **Tienda:** http://localhost:3000
- **Carrito:** http://localhost:3000/carrito
- **Admin:** http://localhost:3000/admin

---

### Paso 8 — Subir a Vercel (poner online)

1. Subí el código a GitHub:
   ```bash
   git init
   git add .
   git commit -m "primer commit"
   git remote add origin https://github.com/TU_USUARIO/alma-artesanal.git
   git push -u origin main
   ```

2. Entrá a [vercel.com](https://vercel.com) → **New Project** → importá tu repositorio de GitHub

3. En **Environment Variables** agregá todas las variables de `.env.local`

4. Clic en **Deploy** → en ~2 minutos tu tienda está online con una URL tipo `alma-artesanal.vercel.app`

5. Actualizá `NEXT_PUBLIC_APP_URL` en Vercel con tu URL real y re-deployá

---

## 💡 Funcionalidades incluidas

| Feature | Descripción |
|---|---|
| 🛍️ Tienda | Grilla de productos con imagen, precio, stock y categoría |
| 🛒 Carrito | Persiste entre sesiones, ajuste de cantidades |
| 📦 Envío | Formulario completo con las 24 provincias argentinas |
| 💳 MercadoPago | Checkout Pro con tarjetas, cuotas, transferencias |
| 📧 Emails | Confirmación automática al comprador y al admin |
| 🖼️ Imágenes | Subida a Cloudinary, optimización automática |
| ⚙️ Admin | Crear, editar precio/stock, eliminar productos |
| 🔒 Seguridad | RLS en Supabase, service role solo en servidor |
| 📉 Stock | Se descuenta automáticamente al confirmar pedido |

---

## 🚚 Sobre los envíos

El sistema guarda los datos de envío del comprador (dirección, ciudad, provincia).
Para calcular y cobrar el envío podés:

- **Opción simple:** coordinar por WhatsApp y ajustar el total manualmente
- **Andreani / OCA / Correo Argentino:** integrar su API para calcular el precio automáticamente según el código postal (se puede agregar en una segunda etapa)

---

## 🆘 Problemas comunes

**Error de CORS con Supabase:** verificá que las URLs en `.env.local` no tengan espacios ni comillas extra.

**Imágenes que no cargan:** asegurate de que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` sea correcto y que el dominio esté en `next.config.js`.

**MercadoPago no redirige:** en desarrollo, el webhook no puede recibir notificaciones. Usá [ngrok](https://ngrok.com) para exponer tu localhost, o probá directamente en Vercel.

---

## 📞 Soporte

¿Dudas? Abrí un issue en el repositorio o consultá la documentación de cada servicio:
- [Supabase docs](https://supabase.com/docs)
- [Cloudinary docs](https://cloudinary.com/documentation)
- [MercadoPago developers](https://www.mercadopago.com.ar/developers)
- [Resend docs](https://resend.com/docs)
