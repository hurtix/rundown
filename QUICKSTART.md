# Rundown Studio - Quick Start

## 🚀 5 Minutos para Empezar

### 1. Clonar / Abrir Proyecto
```bash
cd /Users/hurtix/Sites/rundown
```

### 2. Instalar (Ya hecho)
```bash
npm install
# ✅ Completo
```

### 3. Crear Cuenta Supabase & Obtener Keys

**Link**: https://supabase.com

Después de crear proyecto:
- Copiar **Project URL**: `https://xxxxx.supabase.co`
- Copiar **Anon Key**: `eyJxxxx`

### 4. Configurar .env.local

```bash
# Editar .env.local (ya existe template)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
DATABASE_URL=postgresql://postgres:xxxxx@xxxxx.supabase.co:5432/postgres
```

### 5. Crear Schema en Base de Datos

```bash
# Ejecuta migrations de Prisma en Supabase
npx prisma migrate deploy
```

Si no funciona, en **Supabase Dashboard → SQL Editor**, ejecuta:

```sql
-- Ver: prisma/schema.prisma para el SQL
-- O copiar output de: npx prisma migrate diff --from-empty
```

### 6. Habilitar Realtime en Supabase (IMPORTANTE)

En Supabase Dashboard:
1. Ir a **Database → Tables**
2. Seleccionar tabla **Cue** → **Realtime** (botón azul)
3. Habilitar "Realtime" ✅

### 7. Ejecutar Localmente

```bash
npm run dev
```

Abre: http://localhost:3000

---

## 📖 Estructura Rápida

```
src/
├── app/              # Páginas (Next.js 14)
│   ├── /            # Home
│   └── /rundowns/   # Editor, Live, etc
├── modules/         # Lógica de negocio
│   ├── rundown/     # CRUD Rundowns
│   └── cues/        # CRUD Cues + componentes
├── context/         # React Context (estado)
├── hooks/           # Custom hooks
├── lib/             # Utilidades (Supabase client)
└── server/          # Server Actions (CRUD)
```

---

## ✨ Funcionalidades

| Feature | Cómo usarlo | Archivo |
|---------|------------|---------|
| Crear Rundown | Home → "Go to Rundowns" → "+ New Rundown" | `/rundowns/new/page.tsx` |
| Editar Cues | Editor → Click "Edit" en cue o la tabla | `/modules/cues/components/CueTable.tsx` |
| Agregar Cue | Editor → "+ Add Cue" | `CueTable.tsx` → `createCue()` |
| Reordenar | Drag-drop filas en tabla | `CueTable.tsx` (HTML5 Drag API) |
| Modo Live | Editor → "Go Live" | `/rundowns/[id]/live/page.tsx` |
| Timer | En Live: muestra elapsed/remaining | `LiveView.tsx` |
| Real-time Sync | Abre rundown en 2 tabs: cambios aparecen al instante | `useSyncRundown.ts` |

---

##  🧪 Test Rápido (Sin Supabase)

**Local dev sin DB (solo UI test)**:

1. Comentar `listRundowns()` en `/rundowns/page.tsx`
2. Retornar array vacío `[]`
3. `npm run dev`
4. La UI funciona (sin persistencia)

---

## 🛠 Compilación

### Development
```bash
npm run dev
# Hot reload en http://localhost:3000
```

### Production
```bash
npm run build   # npm run build checks y optimiza
npm start       # Corre la versión compilada
```

### Troubleshooting Build
- ✅ Build actual funciona (ya verificado)
- Si error con variables: revisar `.env.local`
- Si error con Prisma: revisar DATABASE_URL

---

## 📚 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `prisma/schema.prisma` | Estructura de BD |
| `src/context/RundownContext.tsx` | State management |
| `src/modules/{cues,rundown}/` | Lógica de negocio |
| `src/server/{rundownActions,cueActions}.ts` | Server Actions (CRUD) |
| `README.md` | Documentación completa |
| `IMPLEMENTATION_GUIDE.md` | Status técnico completo |

---

## 🚀 Deploy a VPS (Después)

Ver `README.md` sección "Environment Setup (VPS Deployment)"

Resumen:
1. Clone proyecto en `/opt/rundown`
2. Configurar `.env.production` con Supabase keys
3. `npm run build`
4. PM2 o systemd para ejecutar `npm start`
5. Nginx reverse proxy

---

## 💡 Tips

- **Hot reload**: Cambios en archivos se actualizan instantáneamente en dev
- **Server Actions**: Modificar `src/server/*.ts` para cambiar CRUD
- **Componentes**: Cada módulo es independiente y reutilizable
- **Types**: TypeScript strict mode activo → catches bugs early

---

## ❓ Preguntas?

Ver:
- `README.md` - Setup & deploy completo
- `IMPLEMENTATION_GUIDE.md` - Status técnico detallado
- `prisma/schema.prisma` - Modelo de datos
- Código comentado en componentes

---

**Status**: ✅ Listo para producción (con Supabase configurado)
