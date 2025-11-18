# AGENTS.md - Plataforma de Fotografía

## 📋 INFORMACIÓN DEL PROYECTO

### Descripción General
Plataforma web para negocio de fotografía con dos componentes principales:
1. **Sitio Público (Astro)**: Landing page con portafolio, servicios y sistema de reservaciones
2. **Panel Admin (Next.js)**: Dashboard para gestión de contenido, reservas y clientes

### Stack Tecnológico
- **Frontend Público**: Astro 4.x + React (islands) + Tailwind CSS
- **Panel Admin**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL) - Acceso directo sin ORM
- **Autenticación**: Supabase Auth (solo para admin)
- **Storage de Imágenes**: Cloudinary (URLs guardadas en Supabase)
- **Estado Global**: TanStack Query (React Query)
- **Tablas**: TanStack Table
- **Formularios**: React Hook Form + Zod
- **Emails**: Resend
- **Testing**: Vitest + Testing Library + Playwright
- **Deployment**: Vercel (ambas apps)

---

## 🗄️ ESQUEMA DE BASE DE DATOS (Supabase)

### Estructura SQL de Tablas (actualizada desde Supabase)

```sql
-- ============ EXTENSIONES ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- usado en algunas tablas para gen_random_uuid()

-- ============ ENUMS ============
CREATE TYPE message_status AS ENUM (
  'pending',
  'read',
  'responded',
  'archived'
);

-- ============ TABLA: site_content ============
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_content_key ON site_content(key);
COMMENT ON TABLE site_content IS 'Contenido editable del sitio (hero, about, contact info)';

-- ============ TABLA: services ============
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  image TEXT,
  gallery_images TEXT[],
  cta_text VARCHAR(50) DEFAULT 'SOLICITAR →',
  cta_link VARCHAR(200),
  features JSONB,
  pricing JSONB,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_active ON services(is_active) WHERE is_active = true;

COMMENT ON TABLE services IS 'Servicios/paquetes de fotografía ofrecidos';

-- ============ TABLA: projects ============
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  category VARCHAR(50) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  is_visible BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_category ON projects(category);

COMMENT ON TABLE projects IS 'Proyectos/categorías del portafolio';

-- ============ TABLA: portfolio_images ============
CREATE TABLE portfolio_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(200),
  alt TEXT,
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  link_url VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  category_id UUID,
  service_id UUID
);

COMMENT ON TABLE portfolio_images IS 'Imágenes del portafolio (grid landing + galería completa)';

-- ============ TABLA: gallery_images ============
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt TEXT,
  category VARCHAR(50) DEFAULT 'general',
  tags TEXT[],
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  "order" INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  project_id UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gallery_category ON gallery_images(category);
CREATE INDEX idx_gallery_project ON gallery_images(project_id);

COMMENT ON TABLE gallery_images IS 'Imágenes del portafolio (URLs de Cloudinary)';

-- ============ TABLA: hero_images ============
CREATE TABLE hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(200),
  alt TEXT,
  width INTEGER,
  height INTEGER,
  "order" INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hero_images IS 'Imágenes del carousel del Hero (URLs de Cloudinary)';

-- ============ TABLA: image_categories ============
CREATE TABLE image_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TABLA: about_us ============
CREATE TABLE about_us (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  image_alt TEXT,
  title TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TABLA: testimonials ============
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(200) NOT NULL,
  text TEXT NOT NULL,
  rating SMALLINT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  image TEXT,
  position VARCHAR(100),
  is_visible BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TABLA: contact_messages ============
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status message_status DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  response TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  service_type VARCHAR(100),
  event_date DATE,
  how_found_us VARCHAR(200)
);

CREATE INDEX idx_messages_status ON contact_messages(status);
CREATE INDEX idx_messages_email ON contact_messages(email);

-- ============ TABLA: config ============
CREATE TABLE config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE config IS 'Configuración global del sistema';

-- ============ FUNCIONES / TRIGGERS ============
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers usados en tablas que tienen columna updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_site_content') THEN
    CREATE TRIGGER set_timestamp_site_content
      BEFORE UPDATE ON site_content
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_projects') THEN
    CREATE TRIGGER set_timestamp_projects
      BEFORE UPDATE ON projects
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_testimonials') THEN
    CREATE TRIGGER set_timestamp_testimonials
      BEFORE UPDATE ON testimonials
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_contact_messages') THEN
    CREATE TRIGGER set_timestamp_contact_messages
      BEFORE UPDATE ON contact_messages
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END$$;

-- ============ DATOS INICIALES (SEED) ============
INSERT INTO site_content (key, value, type) VALUES
  ('hero_title', 'Capturamos Momentos Inolvidables', 'text'),
  ('hero_subtitle', 'Fotografía profesional para bodas, eventos, cumpleaños y promoción comercial', 'text'),
  ('about_title', 'Sobre Nosotros', 'text'),
  ('about_text', 'Con más de 10 años de experiencia...', 'text'),
  ('contact_email', 'joel@gadeaiso.com', 'text'),
  ('contact_phone', '+506 1234-5678', 'text'),
  ('social_instagram', 'https://instagram.com/tufotografia', 'url'),
  ('social_facebook', 'https://facebook.com/tufotografia', 'url');

-- ============ SERVICIOS INICIALES ============
INSERT INTO services (title, slug, description, "order", is_active) VALUES
  (
    'BODAS',
    'bodas',
    'Cada historia de amor merece ser contada con autenticidad y emoción. Capturamos cada momento especial de tu día más importante.',
    1,
    true
  ),
  (
    'CUMPLEAÑOS',
    'cumpleanos',
    'Capturamos cada sonrisa y momento especial de tu celebración. Desde fiestas infantiles hasta celebraciones de adultos.',
    2,
    true
  ),
  (
    'EVENTOS',
    'eventos',
    'Retratamos la energía y el ambiente de sus actividades recreativas. Desde eventos corporativos hasta celebraciones sociales.',
    3,
    true
  ),
  (
    'PROMOCIÓN',
    'promocion',
    'Creamos imágenes que impulsan la presencia digital de tu negocio. Fotografía comercial y de productos de alta calidad.',
    4,
    true
  );
```

### Configuración de Cloudinary en Supabase
```sql
-- Guardar credenciales de Cloudinary en config (para uso del admin)
INSERT INTO config (key, value) VALUES
  ('cloudinary', '{
    "cloud_name": "your-cloud-name",
    "upload_preset": "your-upload-preset",
    "folder": "photography-platform"
  }'::jsonb);
```

**Nota**: Las imágenes se subirán directamente a Cloudinary desde el panel admin. Solo se guardan las URLs en Supabase.

---

## 📁 ESTRUCTURA DE DIRECTORIOS

```
photography-platform/
├── apps/
│   ├── web/                          # SITIO PÚBLICO (ASTRO)
│   │   ├── public/
│   │   │   ├── fonts/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── react/            # Componentes React (islands)
│   │   │   │   │   ├── Gallery.tsx
│   │   │   │   │   ├── ContactForm.tsx
│   │   │   │   │   └── TestimonialSlider.tsx
│   │   │   │   ├── Hero.astro
│   │   │   │   ├── Services.astro
│   │   │   │   ├── About.astro
│   │   │   │   └── Footer.astro
│   │   │   ├── layouts/
│   │   │   │   └── Layout.astro
│   │   │   ├── pages/
│   │   │   │   ├── index.astro        # Home
│   │   │   │   ├── servicios/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [slug].astro   # Detalle de servicio
│   │   │   │   ├── galeria/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [category].astro
│   │   │   │   └── contacto.astro
│   │   │   ├── lib/
│   │   │   │   ├── supabase.ts        # Cliente Supabase
│   │   │   │   ├── api.ts             # Funciones API
│   │   │   │   ├── constants.ts
│   │   │   │   └── utils.ts
│   │   │   └── styles/
│   │   │       └── global.css
│   │   ├── astro.config.mjs
│   │   ├── tailwind.config.mjs
│   │   └── package.json
│   │
│   └── admin/                         # PANEL ADMIN (NEXT.JS)
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   ├── login/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── layout.tsx
│       │   │   ├── (dashboard)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx           # Dashboard principal
│       │   │   │   ├── contenido/
│       │   │   │   │   └── page.tsx       # CMS
│       │   │   │   ├── servicios/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── nuevo/
│       │   │   │   │   └── [id]/edit/
│       │   │   │   ├── galeria/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── proyectos/
│       │   │   │   │   └── subir/
│       │   │   │   └── mensajes/
│       │   │   │       ├── page.tsx
│       │   │   │       └── [id]/
│       │   │   ├── api/
│       │   │   │   ├── auth/[...nextauth]/
│       │   │   │   │   └── route.ts
│       │   │   │   ├── trpc/[trpc]/
│       │   │   │   │   └── route.ts
│       │   │   │   ├── upload/
│       │   │   │   │   └── route.ts
│       │   │   │   └── contact/
│       │   │   │       └── route.ts
│       │   │   ├── layout.tsx
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── ui/                    # shadcn components
│       │   │   │   ├── button.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   ├── table.tsx
│       │   │   │   └── ... (más componentes)
│       │   │   ├── dashboard/
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── Header.tsx
│       │   │   │   └── StatsCard.tsx
│       │   │   ├── forms/
│       │   │   │   ├── ServiceForm.tsx
│       │   │   │   ├── ProjectForm.tsx
│       │   │   │   └── ContentEditor.tsx
│       │   │   ├── tables/
│       │   │   │   └── MessagesTable.tsx
│       │   │   └── upload/
│       │   │       ├── ImageUploader.tsx
│       │   │       └── MultiImageUploader.tsx
│       │   ├── lib/
│       │   │   ├── prisma.ts              # Cliente Prisma
│       │   │   ├── supabase.ts            # Cliente Supabase
│       │   │   ├── auth.ts                # NextAuth config
│       │   │   ├── trpc-client.ts
│       │   │   ├── upload.ts              # Lógica de upload
│       │   │   └── utils.ts
│       │   ├── server/
│       │   │   ├── trpc.ts                # tRPC setup
│       │   │   ├── context.ts
│       │   │   └── routers/
│       │   │       ├── index.ts
│       │   │       ├── content.ts
│       │   │       ├── services.ts
│       │   │       ├── gallery.ts
│       │   │       ├── messages.ts
│       │   │       └── stats.ts
│       │   └── types/
│       │       ├── index.ts
│       │       └── prisma.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/                          # CÓDIGO COMPARTIDO (OPCIONAL)
│   ├── ui/
│   │   ├── src/
│   │   └── package.json
│   ├── config/
│   │   ├── tailwind/
│   │   └── typescript/
│   └── utils/
│       ├── src/
│       └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

**Nota**: Los proyectos están separados (no es un monorepo). Cada uno tiene su propio `package.json` y se manejan independientemente con npm.

---

## 🔧 ARCHIVOS DE CONFIGURACIÓN PRINCIPALES

### Variables de Entorno
```bash
# .env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

// Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_PRESET="photography_preset"

# Resend (Email)
RESEND_API_KEY="re_..."
EMAIL_FROM="Tu Fotografía <noreply@tufotografia.com>"

# URLs
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_WEB_URL="http://localhost:4321"
```

### Configuración de Supabase (apps/web/src/lib/supabase/)

```typescript
// server.ts - Para SSR/SSG en Astro
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

// browser.ts - Para React Islands
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabaseBrowser = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'photography-auth',
    },
  }
)
```

### Configuración de Cloudinary

```typescript
// apps/web/src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  secure: true,
})

/**
 * Genera URL optimizada de Cloudinary
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'avif'
    crop?: 'fill' | 'fit' | 'scale'
  } = {}
): string {
  const {
    width = 800,
    height,
    quality = 80,
    format = 'auto',
    crop = 'fill',
  } = options

  const transformations = [
    `q_${quality}`,
    `f_${format}`,
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`
}

/**
 * Sube imagen a Cloudinary
 * Se usa en el panel admin
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'photography'
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', import.meta.env.CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()
  
  return {
    url: data.secure_url,
    publicId: data.public_id,
  }
}
```

### Configuración de Astro

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://tufotografia.com',
  integrations: [
    react(), // Para React Islands
    tailwind({
      applyBaseStyles: false, // Usamos nuestro global.css
    }),
    sitemap(),
  ],
  output: 'hybrid', // SSG por defecto, SSR cuando sea necesario
  image: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'query-vendor': ['@tanstack/react-query'],
          },
        },
      },
    },
    ssr: {
      external: ['@supabase/supabase-js'],
    },
  },
})
```

### Configuración de Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@tanstack/react-table',
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_WEB_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

---

## 🎯 CONVENCIONES Y REGLAS DE DESARROLLO

### 1. **Principios SOLID**

#### Single Responsibility Principle (SRP)
```typescript
// ❌ MAL: Componente con múltiples responsabilidades
function BookingPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Lógica de fetch
  const fetchBookings = async () => { /* ... */ }
  
  // Lógica de filtrado
  const filterBookings = (status) => { /* ... */ }
  
  // Lógica de exportación
  const exportToPDF = () => { /* ... */ }
  
  return <div>{/* render */}</div>
}

// ✅ BIEN: Separación de responsabilidades
// services/bookings.service.ts
export class BookingsService {
  async fetchBookings() { /* ... */ }
  async filterByStatus(status: BookingStatus) { /* ... */ }
}

// utils/export.ts
export class ExportService {
  exportToPDF(data: Booking[]) { /* ... */ }
}

// components/BookingsTable.tsx
function BookingsTable() {
  const { data } = useBookings()
  return <Table data={data} />
}
```

#### Open/Closed Principle (OCP)
```typescript
// ✅ Componente extensible mediante props
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated'
  children: React.ReactNode
  className?: string
}

export function Card({ variant = 'default', children, className }: CardProps) {
  const variants = {
    default: 'bg-white shadow',
    outlined: 'border border-gray-200',
    elevated: 'bg-white shadow-lg',
  }
  
  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  )
}
```

### 2. **Test-Driven Development (TDD)**

#### Orden de desarrollo
```
1. Escribir el test primero (ROJO)
2. Escribir código mínimo para pasar el test (VERDE)
3. Refactorizar (REFACTOR)
```

#### Ejemplo práctico
```typescript
// tests/unit/services/bookings.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { BookingsService } from '@/services/bookings.service'

describe('BookingsService', () => {
  let service: BookingsService
  
  beforeEach(() => {
    service = new BookingsService()
  })
  
  describe('createBooking', () => {
    it('should create a booking with valid data', async () => {
      // Arrange
      const bookingData = {
        clientName: 'Juan Pérez',
        clientEmail: 'juan@example.com',
        clientPhone: '+1234567890',
        serviceId: 'uuid-123',
        eventDate: new Date('2025-12-25'),
      }
      
      // Act
      const result = await service.createBooking(bookingData)
      
      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('bookingNumber')
      expect(result.data.status).toBe('pending')
    })
    
    it('should fail with invalid email', async () => {
      const bookingData = {
        clientEmail: 'invalid-email',
        // ... resto de datos
      }
      
      await expect(service.createBooking(bookingData)).rejects.toThrow()
    })
  })
})
```

### 3. **Cuándo usar React Islands vs Astro Components**

#### 🏝️ Usar React Island cuando:
- Necesitas interactividad (clicks, hovers, inputs)
- Manejo de estado local (useState, useReducer)
- Formularios con validación en tiempo real
- Componentes que hacen fetch de datos
- Carrusels, modals, tabs interactivos
- Drag & drop

#### 📄 Usar Astro Component cuando:
- Contenido estático (textos, imágenes)
- Layout y estructura
- SEO-critical content
- Hero sections sin interacción
- Cards que solo muestran información
- Footers, headers estáticos

#### Ejemplos
```astro
---
// ✅ Astro: Contenido estático
// components/ServiceCard.astro
interface Props {
  title: string
  description: string
  price: number
  image: string
}

const { title, description, price, image } = Astro.props
---

<div class="card">
  <img src={image} alt={title} />
  <h3>{title}</h3>
  <p>{description}</p>
  <span>${price}</span>
</div>
```

```tsx
// ✅ React Island: Galería interactiva con filtros
// islands/Gallery.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface GalleryProps {
  initialCategory?: string
}

export default function Gallery({ initialCategory = 'all' }: GalleryProps) {
  const [category, setCategory] = useState(initialCategory)
  
  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery', category],
    queryFn: () => fetchImages(category),
  })
  
  return (
    <div>
      <Filters category={category} onCategoryChange={setCategory} />
      <MasonryGrid images={images} />
    </div>
  )
}
```

### 4. **Validaciones con Zod**

```typescript
// lib/validations.ts
import { z } from 'zod'

// Schema para contacto
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre es demasiado largo'),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^\+?[0-9]{10,15}$/, 'Teléfono inválido')
    .transform(val => val.replace(/\s/g, ''))
    .optional(),
  
  subject: z.string().max(200).optional(),
  
  message: z.string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje es demasiado largo'),
})

export type ContactInput = z.infer<typeof contactSchema>

// Schema para servicio
export const serviceSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().min(50).max(2000),
  price: z.number().positive().max(100000),
  duration: z.number().int().positive().optional(),
  features: z.array(z.string().min(3)).min(1),
  image: z.string().url().optional(),
})
```

### 5. **Organización de Types**

```typescript
// types/database.types.ts
// Tipos generados desde Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          title: string
          slug: string
          // ...
        }
        Insert: {
          id?: string
          title: string
          // ...
        }
        Update: {
          title?: string
          // ...
        }
      }
      // ... otras tablas
    }
  }
}

// types/api.types.ts
// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number
  perPage: number
  total: number
  totalPages: number
}

// types/components.types.ts
// Tipos para props de componentes
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export interface CardProps {
  title: string
  description?: string
  image?: string
  href?: string
  className?: string
}
```

### 6. **Hooks Personalizados**

```typescript
// hooks/useContactForm.ts
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactInput } from '@/lib/validations'
import { supabaseBrowser } from '@/lib/supabase/browser'

export function useContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  })
  
  const onSubmit = async (data: ContactInput) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { data: message, error: supabaseError } = await supabaseBrowser
        .from('contact_messages')
        .insert({
          ...data,
          status: 'pending',
        })
        .select()
        .single()
      
      if (supabaseError) throw supabaseError
      
      // Enviar notificación por email
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: message.id }),
      })
      
      return { success: true, message }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar mensaje'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    error,
  }
}
```

### 7. **Services (Lógica de Negocio)**

```typescript
// services/gallery.service.ts
import { supabase } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type GalleryImage = Database['public']['Tables']['gallery_images']['Row']
type Project = Database['public']['Tables']['projects']['Row']

export class GalleryService {
  /**
   * Obtiene todas las imágenes visibles de la galería
   */
  static async getVisibleImages(category?: string): Promise<GalleryImage[]> {
    let query = supabase
      .from('gallery_images')
      .select('*')
      .eq('is_visible', true)
      .order('order', { ascending: true })
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) throw new Error(`Error fetching images: ${error.message}`)
    
    return data || []
  }
  
  /**
   * Obtiene un proyecto con sus imágenes
   */
  static async getProjectBySlug(slug: string): Promise<Project & { images: GalleryImage[] }> {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        images:gallery_images(*)
      `)
      .eq('slug', slug)
      .eq('is_visible', true)
      .single()
    
    if (projectError) throw new Error(`Project not found: ${projectError.message}`)
    
    return project as any
  }
  
  /**
   * Obtiene todas las categorías únicas
   */
  static async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('category')
      .eq('is_visible', true)
    
    if (error) throw error
    
    const categories = [...new Set(data.map(img => img.category))]
    return categories
  }
}
```

---

## 🧪 TESTING Y QUALITY ASSURANCE

### Configuración de Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Setup de Tests

```typescript
// tests/setup.ts
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Cleanup después de cada test
afterEach(() => {
  cleanup()
})

// Mock de Supabase
vi.mock('@/lib/supabase/browser', () => ({
  supabaseBrowser: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))
```

### Estructura de Tests

```typescript
// tests/unit/services/gallery.service.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GalleryService } from '@/services/gallery.service'

describe('GalleryService', () => {
  beforeEach(() => {
    // Setup antes de cada test
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    // Cleanup después de cada test
    vi.restoreAllMocks()
  })
  
  describe('getVisibleImages', () => {
    it('should fetch visible images successfully', async () => {
      // Test implementation
    })
    
    it('should filter by category', async () => {
      // Test implementation
    })
  })
})

// tests/integration/api/contact.test.ts
describe('Contact API', () => {
  it('POST /api/contact - sends contact message', async () => {
    // Test implementation
  })
})

// tests/e2e/contact-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Contact Flow', () => {
  test('user can submit contact form successfully', async ({ page }) => {
    await page.goto('/contacto')
    await page.fill('[name="name"]', 'Juan Pérez')
    await page.fill('[name="email"]', 'juan@example.com')
    await page.fill('[name="message"]', 'Me interesa conocer más sobre sus servicios')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Mensaje enviado')).toBeVisible()
  })
})
```

---

## 🚀 PRE-COMMIT HOOKS Y CI/CD

### Husky + Lint-Staged

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.tsx,.astro",
    "lint:fix": "eslint . --ext .ts,.tsx,.astro --fix",
    "type-check": "tsc --noEmit",
    "perf": "lighthouse http://localhost:4321 --only-categories=performance",
  },
  "lint-staged": {
    "*.{ts,tsx,astro}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run tests
npm run test

# Run linter
npm run lint

# Type checking
npm run type-check

# Si todo pasa, permitir commit
```

---

## 📊 MÉTRICAS DE PERFORMANCE

### Lighthouse CI

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4321', 'http://localhost:4321/servicios'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### Web Vitals Monitoring

```typescript
// lib/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals'

function sendToAnalytics(metric: Metric) {
  // Enviar a tu servicio de analytics
  console.log(metric)
}

export function initWebVitals() {
  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onLCP(sendToAnalytics)
  onFCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}
```

---

## 📝 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev                           # Astro en localhost:4321 (landing)
cd ../admin-photography/admin-photo && npm run dev  # Next.js en localhost:3000 (admin)

# Testing (cuando se configure)
npm test                              # Run all tests
npm run test:watch                    # Watch mode
npm run test:coverage                 # Coverage report
npm run test:e2e                      # Playwright E2E

# Linting y Formateo (cuando se configure)
npm run lint                          # Check linting
npm run lint:fix                      # Fix linting issues
npm run format                        # Format with Prettier

# Type Checking (cuando se configure)
npm run type-check                    # TypeScript validation

# Build
npm run build                         # Build proyecto actual
npm run preview                       # Preview build de Astro

# Performance (cuando se configure)
npm run perf                          # Run Lighthouse
npm run analyze                       # Bundle analyzer
```

---

## ✅ CHECKLIST ANTES DE COMMIT

- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Coverage mínimo 80%
- [ ] Linter sin errores
- [ ] Type checking pasa
- [ ] Performance score > 90
- [ ] Accesibilidad score > 90
- [ ] SEO score > 90
- [ ] No hay console.logs
- [ ] Documentación actualizada
- [ ] Variables de entorno documentadas

---

## 🎨 EJEMPLO COMPLETO DE FLUJO

### 1. Crear un servicio nuevo (TDD)

```typescript
// 1. Escribir el test primero
// tests/unit/services/services.service.test.ts
describe('ServicesService', () => {
  it('should create a service with valid data', async () => {
    const serviceData = {
      title: 'Fotografía de Bodas',
      slug: 'fotografia-bodas',
      description: 'Capturamos los momentos más especiales...',
      price: 1500,
      features: ['300 fotos editadas', '8 horas de cobertura'],
    }
    
    const result = await ServicesService.create(serviceData)
    
    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id')
  })
})

// 2. Implementar el servicio
// services/services.service.ts
export class ServicesService {
  static async create(data: ServiceInput) {
    const validated = serviceSchema.parse(data)
    
    const { data: service, error } = await supabase
      .from('services')
      .insert(validated)
      .select()
      .single()
    
    if (error) throw error
    
    return { success: true, data: service }
  }
}

// 3. Crear el componente
// islands/ServiceForm.tsx
export default function ServiceForm() {
  const form = useForm({
    resolver: zodResolver(serviceSchema),
  })
  
  const onSubmit = async (data) => {
    const result = await ServicesService.create(data)
    if (result.success) {
      toast.success('Servicio creado')
    }
  }
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
}

// 4. Test E2E
// tests/e2e/create-service.spec.ts
test('admin can create new service', async ({ page }) => {
  await page.goto('/admin/servicios/nuevo')
  await page.fill('[name="title"]', 'Fotografía de Bodas')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/admin/servicios')
})
```.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Configuración de Supabase Cliente
```typescript
// apps/web/src/lib/supabase.ts (Astro)
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

// apps/admin/src/lib/supabase.ts (Next.js)
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side
  {
    auth: {
      persistSession: false
    }
  }
)

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Client-side
)
```

---

## 🎯 REGLAS DE DESARROLLO

### Convenciones de Código
1. **TypeScript estricto**: Usar tipos explícitos, evitar `any`
2. **Nombres de archivos**: 
   - Componentes: `PascalCase.tsx`
   - Utilidades: `camelCase.ts`
   - Páginas: `kebab-case.astro` o `page.tsx`
3. **Imports organizados**:
   ```typescript
   // 1. Externos
   import { useState } from 'react'
   import { prisma } from '@/lib/prisma'
   
   // 2. Internos
   import { Button } from '@/components/ui/button'
   
   // 3. Tipos
   import type { Service } from '@prisma/client'
   ```

### Estructura de Componentes React
```typescript
// admin/src/components/example/ExampleComponent.tsx
import { useState } from 'react'
import type { FC } from 'react'

interface ExampleComponentProps {
  title: string
  onSave?: () => void
}

export const ExampleComponent: FC<ExampleComponentProps> = ({ 
  title, 
  onSave 
}) => {
  const [value, setValue] = useState('')

  return (
    <div>
      <h2>{title}</h2>
      {/* Content */}
    </div>
  )
}
```

### Manejo de Errores
```typescript
// Siempre usar try-catch en operaciones asíncronas
try {
  const data = await prisma.service.findMany()
  return { success: true, data }
} catch (error) {
  console.error('Error fetching services:', error)
  return { success: false, error: 'Failed to fetch services' }
}
```

### Optimización de Imágenes
```typescript
// Usar Cloudinary con transformaciones en URLs
const getImageUrl = (cloudinaryUrl: string, options?: { width?: number, quality?: number }) => {
  const { width = 800, quality = 80 } = options || {}
  
  // Transforma la URL de Cloudinary para optimizar
  // Ejemplo: https://res.cloudinary.com/demo/image/upload/sample.jpg
  // Se convierte en: https://res.cloudinary.com/demo/image/upload/w_800,q_80/sample.jpg
  
  return cloudinaryUrl.replace(
    '/upload/',
    `/upload/w_${width},q_${quality},f_auto/`
  )
}

// En componentes Astro
<img 
  src={getImageUrl(image.url, { width: 600 })}
  loading="lazy"
  decoding="async"
/>
```

---

## 🚀 FLUJOS DE TRABAJO PRINCIPALES

### 1. Crear un Nuevo Servicio
```typescript
// admin/src/app/(dashboard)/servicios/nuevo/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc-client'
import { ServiceForm } from '@/components/forms/ServiceForm'

export default function NewServicePage() {
  const router = useRouter()
  const createService = trpc.services.create.useMutation({
    onSuccess: () => {
      router.push('/servicios')
    }
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Nuevo Servicio</h1>
      <ServiceForm 
        onSubmit={(data) => createService.mutate(data)} 
        isLoading={createService.isLoading}
      />
    </div>
  )
}
```

### 2. Subir Imagen a Cloudinary
```typescript
// admin/src/lib/upload.ts
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'photography'
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary')
  }

  const data = await response.json()

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  }
}

// Uso en el admin
export async function saveImageToDatabase(file: File, projectId?: string) {
  // 1. Subir a Cloudinary
  const cloudinaryData = await uploadImageToCloudinary(file, 'gallery')
  
  // 2. Guardar URL en Supabase
  const { data, error } = await supabase
    .from('gallery_images')
    .insert({
      url: cloudinaryData.url,
      thumbnail_url: cloudinaryData.url.replace('/upload/', '/upload/w_400,q_80/'),
      width: cloudinaryData.width,
      height: cloudinaryData.height,
      project_id: projectId,
    })
    .select()
    .single()

  if (error) throw error
  
  return data
}
```

### 3. Mostrar Galería en Astro
```astro
---
// apps/web/src/pages/galeria/index.astro
import { supabase } from '@/lib/supabase'
import Layout from '@/layouts/Layout.astro'
import Gallery from '@/components/react/Gallery'

const { data: images } = await supabase
  .from('gallery_images')
  .select('*, project:projects(*)')
  .eq('is_visible', true)
  .order('order', { ascending: true })
---

<Layout title="Galería">
  <Gallery client:load images={images || []} />
</Layout>
```

### 4. Enviar Mensaje de Contacto
```typescript
// apps/web/src/components/react/ContactForm.tsx
import { useContactForm } from '@/hooks/useContactForm'

export default function ContactForm() {
  const { form, onSubmit, isSubmitting, error } = useContactForm()
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input {...form.register('name')} placeholder="Nombre" />
      <input {...form.register('email')} type="email" placeholder="Email" />
      <input {...form.register('phone')} placeholder="Teléfono (opcional)" />
      <textarea {...form.register('message')} placeholder="Mensaje" />
      
      {error && <p className="text-red-500">{error}</p>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
      </button>
    </form>
  )
}
```

---

## 📊 PRIORIDADES SEO Y PERFORMANCE

### SEO en Astro
```astro
---
// apps/web/src/layouts/Layout.astro
interface Props {
  title: string
  description?: string
  image?: string
}

const { 
  title, 
  description = 'Capturamos tus momentos más especiales',
  image = '/og-image.jpg'
} = Astro.props
---

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO -->
  <title>{title} | Tu Fotografía</title>
  <meta name="description" content={description}>
  <link rel="canonical" href={Astro.url.href}>
  
  <!-- Open Graph -->
  <meta property="og:title" content={title}>
  <meta property="og:description" content={description}>
  <meta property="og:image" content={new URL(image, Astro.url)}>
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content={title}>
  <meta name="twitter:description" content={description}>
  
  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://res.cloudinary.com">
</head>
<body>
  <slot />
</body>
</html>
```

### Performance Checklist
- ✅ Usar `loading="lazy"` en imágenes
- ✅ Implementar Image CDN (Cloudinary transformations)
- ✅ Code splitting automático en Astro
- ✅ Preload fonts críticos
- ✅ Minimizar JavaScript en páginas públicas
- ✅ Usar React Islands solo cuando sea necesario
- ✅ Caché de API con TanStack Query
- ✅ Optimizar imágenes con Cloudinary (formato auto, calidad, dimensiones)

---

## 🧪 TESTING (Futuro)

### Unit Tests
```bash
# Instalar dependencias
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### E2E Tests
```bash
# Instalar Playwright
npm install -D @playwright/test
```

---

## 📦 COMANDOS ÚTILES

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev              # Astro en localhost:4321 (landing)
cd ../admin-photography/admin-photo && npm run dev  # Next.js en localhost:3000 (admin)

# Build
npm run build            # Build proyecto actual
npm run preview          # Preview build de Astro

# Testing (cuando se configure)
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E

# Linting y Formateo (cuando se configure)
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues

# Type Checking (cuando se configure)
npm run type-check       # TypeScript validation
```