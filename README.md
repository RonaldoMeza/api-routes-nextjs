# 📚 Biblioteca - Sistema de Gestión

Aplicación web full-stack construida con **Next.js 16**, **Prisma 7** y **PostgreSQL** para la gestión de una biblioteca con autores y libros. Incluye búsqueda avanzada, filtros, paginación y estadísticas.

## ✨ Características

- **CRUD completo** de autores y libros
- **Búsqueda en tiempo real** con filtros por título, género y autor
- **Paginación** con navegación entre páginas
- **Estadísticas** de autores (total libros, promedios, géneros, libro más extenso/corto)
- **Interfaz responsive** con diseño minimalista en tonos dorados
- **Notificaciones toast** con feedback visual (éxito, error, info)
- **Validación de formularios** en frontend y backend

## 🛠️ Tecnologías

| Tecnología | Versión |
|------------|---------|
| Next.js | 16.2.7 |
| React | 19.2.4 |
| TypeScript | 5.9 |
| Prisma | 7.8.0 |
| PostgreSQL | - |
| Tailwind CSS | 4 |
| Turbopack | - |

## 📋 Prerrequisitos

- Node.js 18+ (recomendado 22+)
- PostgreSQL (o base de datos remota como Neon, Supabase, etc.)
- npm o pnpm

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/RonaldoMeza/api-routes-nextjs.git
cd api-routes-nextjs

# Instalar dependencias
npm install

# Copiar variables de entorno y configurar
cp .env.example .env
# Editar .env con tu DATABASE_URL
```

## 🗄️ Configurar Base de Datos

1. Crea una base de datos PostgreSQL (local o en la nube como [Neon](https://neon.tech) o [Supabase](https://supabase.com))

2. Configura la variable `DATABASE_URL` en tu archivo `.env`:

```env
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_db"
```

3. Ejecuta las migraciones y genera el cliente Prisma:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## ▶️ Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🏗️ Construir para producción

```bash
npm run build
npm start
```

## 🚢 Despliegue en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/next-api-routes)

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Configura la variable de entorno `DATABASE_URL` en Vercel (Project Settings → Environment Variables)
3. Despliega

**Importante:** Asegúrate que tu base de datos acepte conexiones desde Vercel (configurar firewall/allow list si es necesario).

## 📡 Endpoints API

### Autores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/authors` | Listar todos los autores |
| POST | `/api/authors` | Crear un autor |
| GET | `/api/authors/[id]` | Obtener un autor por ID |
| PUT | `/api/authors/[id]` | Actualizar un autor |
| DELETE | `/api/authors/[id]` | Eliminar un autor |
| GET | `/api/authors/[id]/books` | Libros de un autor |
| GET | `/api/authors/[id]/stats` | Estadísticas del autor |

### Libros

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/books` | Listar libros (filtro por `genre` y `authorId`) |
| POST | `/api/books` | Crear un libro |
| GET | `/api/books/[id]` | Obtener un libro por ID |
| PUT | `/api/books/[id]` | Actualizar un libro |
| DELETE | `/api/books/[id]` | Eliminar un libro |
| GET | `/api/books/search` | Búsqueda con paginación |

### Búsqueda de libros

**`GET /api/books/search`**

Parámetros de consulta:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `search` | string | - | Búsqueda por título (case-insensitive) |
| `genre` | string | - | Filtro por género exacto |
| `authorName` | string | - | Búsqueda por nombre de autor |
| `page` | number | 1 | Número de página |
| `limit` | number | 10 | Resultados por página (máx. 50) |
| `sortBy` | string | createdAt | Campo de ordenación (`title`, `publishedYear`, `createdAt`) |
| `order` | string | desc | Orden (`asc` o `desc`) |

Ejemplo de respuesta:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 📄 Páginas del Frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard con estadísticas y CRUD de autores |
| `/books` | Búsqueda, filtros, paginación y CRUD de libros |
| `/authors/[id]` | Detalle del autor, estadísticas, libros y edición |

## 🗂️ Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── authors/           # CRUD de autores
│   │   │   ├── [id]/
│   │   │   │   ├── books/     # Libros por autor
│   │   │   │   ├── stats/     # Estadísticas
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── books/
│   │       ├── [id]/route.ts
│   │       ├── search/route.ts
│   │       └── route.ts
│   ├── authors/[id]/page.tsx  # Página detalle autor
│   ├── books/page.tsx         # Página de libros
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Dashboard
├── components/
│   └── Toast.tsx              # Sistema de notificaciones
└── lib/
    └── prisma.ts              # Cliente de Prisma
prisma/
├── schema.prisma              # Modelos de datos
└── prisma.config.ts           # Configuración de Prisma
```
