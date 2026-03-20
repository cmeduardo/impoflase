# Importadora FLASE — Sistema Web

Sistema web completo para Importadora FLASE, importadora de vehículos en Guatemala.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Base de datos & Auth:** Supabase
- **Imágenes:** Cloudinary
- **Estilos:** Tailwind CSS
- **Deploy:** Vercel

## Setup Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

El archivo `.env.local` ya está configurado con:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drczfczfv
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=impoflase
```

### 3. Configurar base de datos en Supabase

1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Abrir el proyecto `gjrjrmrpnlzwttfrqvcm`
3. Ir a **SQL Editor**
4. Ejecutar `supabase/schema.sql` completo
5. (Opcional) Ejecutar `supabase/seed.sql` para datos de prueba

### 4. Crear usuario admin

En Supabase Dashboard → **Authentication** → **Users** → **Add user**

### 5. Configurar Cloudinary

Upload preset `impoflase` ya está configurado como **unsigned** con folder `vehiculos`.

### 6. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
src/
├── app/
│   ├── (public)/          # Sitio público
│   │   ├── page.tsx       # Inicio
│   │   ├── vehiculos/     # Catálogo
│   │   ├── cotizar/       # Formulario cotización
│   │   ├── citas/         # Formulario citas
│   │   ├── nosotros/      # Sobre nosotros
│   │   └── contacto/      # Contacto
│   ├── admin/             # Panel administrativo
│   │   ├── page.tsx       # Dashboard
│   │   ├── vehiculos/     # CRUD vehículos
│   │   ├── cotizaciones/  # Gestión cotizaciones
│   │   ├── citas/         # Gestión citas
│   │   └── configuracion/ # Config empresa
│   └── api/               # API Routes
├── components/
│   ├── public/            # Componentes sitio público
│   └── admin/             # Componentes panel admin
├── lib/
│   ├── supabase/          # Cliente Supabase
│   ├── cloudinary.ts      # Config Cloudinary
│   └── utils.ts           # Utilidades
└── types/
    └── database.ts        # Tipos TypeScript
```

## Deploy en Vercel

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Agregar las variables de entorno
3. Deploy automático en cada push a `main`

## Rutas Principales

### Sitio Público
- `/` — Inicio con vehículos destacados y próximos ingresos
- `/vehiculos` — Catálogo con filtros
- `/vehiculos/[slug]` — Detalle de vehículo
- `/cotizar` — Formulario de cotización
- `/citas` — Formulario de cita
- `/nosotros` — Sobre nosotros
- `/contacto` — Contacto

### Panel Admin
- `/admin/login` — Login
- `/admin` — Dashboard con KPIs
- `/admin/vehiculos` — Lista de vehículos
- `/admin/vehiculos/nuevo` — Crear vehículo
- `/admin/vehiculos/[id]/editar` — Editar vehículo
- `/admin/cotizaciones` — Gestión de cotizaciones
- `/admin/citas` — Gestión de citas
- `/admin/configuracion` — Configuración empresa
