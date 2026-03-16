# Refactorización: De Tabla a Tarjetas Horizontales

## 📊 Cambio Realizado

Se ha reemplazado el diseño basado en tablas `CueTable.tsx` por un sistema moderno de tarjetas (`CueListHorizontal.tsx`) similar al del referente de Rundown Studio.

## 🏗️ Estructura de Componentes

### Nuevos Componentes

#### 1. **CueListHorizontal.tsx** (Principal)
- Contenedor principal con scroll horizontal
- Gestiona estado de drag/drop global
- Proporciona header con controles
- Reemplaza a `CueTable.tsx`

**Props:**
```tsx
interface CueListHorizontalProps {
  rundownId: string
}
```

**Estado interno:**
- `dragState`: { draggedId, dragOverId, isDragging }

**Métodos:**
- `handleAddCue()` - Crea un nuevo cue
- `handleDeleteCue()` - Elimina un cue
- `handleUpdateCue()` - Actualiza un cue
- `handleDragStart/Over/Leave/Drop()` - Gestiona drag & drop

---

#### 2. **CueCard.tsx** (Tarjeta Individual)
- Componente card para cada cue
- Edición inline con save/cancel
- Indicadores visuales de drag
- Reemplaza a `CueRow.tsx`

**Props:**
```tsx
interface CueCardProps {
  cue: Cue
  isDragging: boolean
  isDragOver: boolean
  onDragStart: () => void
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
  onUpdate: (cueId: string, updates: Partial<Cue>) => void
  onDelete: () => void
}
```

**Características:**
- 🎨 Color dot indicador del color de cue
- 📋 Campos editables: title, duration, camera, audio, graphics, notes
- 🗑️ Confirmación de eliminación
- 💾 Save/Cancel inline
- 🖱️ Visual feedback en drag

---

#### 3. **SegmentGroup.tsx** (Agrupador de Cues)
- Agrupa cues por segmento
- Collapsible/expandible
- Útil para futuras mejoras con segmentación

**Props:**
```tsx
interface SegmentGroupProps {
  segmentName: string
  cues: Cue[]
  // ... drag handlers
}
```

---

#### 4. **ColumnManager.tsx** (Gestor de Columnas)
- Dropdown para mostrar/ocultar columnas
- Extensible para futuros campos
- Placeholder para implementación futura

**Props:**
```tsx
interface ColumnManagerProps {
  columns: ColumnConfig[]
  onToggleColumn: (columnId: string) => void
}
```

---

## 🎨 Diferencias Visuales

### Antes (Tabla)
```
┌─────┬────────────┬────────────┬──────────┬────────┐
│  #  │   Title    │   Color    │ Duration │ Actions│
├─────┼────────────┼────────────┼──────────┼────────┤
│  1  │   Cue 1    │    🔵      │ 00:00:30 │  Edit  │
├─────┼────────────┼────────────┼──────────┼────────┤
│  2  │   Cue 2    │    🔴      │ 00:01:00 │  Edit  │
└─────┴────────────┴────────────┴──────────┴────────┘
```

### Ahora (Tarjetas)
```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ 🎨 Cue 1        ⋮   │  │ 🎨 Cue 2        ⋮   │  │ 🎨 Cue 3        ⋮   │
│                     │  │                     │  │                     │
│ Duration            │  │ Duration            │  │ Duration            │
│ 00:00:30            │  │ 00:01:00            │  │ 00:00:45            │
│                     │  │                     │  │                     │
│ Camera              │  │ Camera              │  │ Camera              │
│ CAM1                │  │ CAM2                │  │ CAM1                │
│                     │  │                     │  │                     │
│ Audio               │  │ Audio               │  │ Audio               │
│ —                   │  │ LAVO 2              │  │ LAV1                │
│                     │  │                     │  │                     │
│ Graphics            │  │ Graphics            │  │ Graphics            │
│ —                   │  │ CHROMA              │  │ —                   │
│                     │  │                     │  │                     │
│ Notes               │  │ Notes               │  │ Notes               │
│ —                   │  │ Ready for live      │  │ Check sync cable    │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## 🔄 Drag & Drop Mejorado

### Visual Feedback
- **Arrastrando**: Opacidad reducida + borde gris
- **Sobre destino**: Fondo azul + borde azul + sombra
- **Normal**: Borde gris claro

### Manejo de Estado
```tsx
const [dragState, setDragState] = useState<DragState>({
  draggedId: string | null
  dragOverId: string | null
  isDragging: boolean
})
```

---

## 📦 Compatibilidad hacia atrás

Para mantener compatibilidad, el archivo `index.ts` exporta:
```tsx
// Nuevo nombre
export { default as CueListHorizontal } from "./CueListHorizontal"

// Alias para backwards compatibility
export { default as CueTable } from "./CueListHorizontal"
export { default as CueRow } from "./CueCard"
```

---

## 🚀 Cómo Usar

### Opción 1: Importar desde index
```tsx
import { CueListHorizontal } from "@/modules/cues/components"

export default function Page() {
  return <CueListHorizontal rundownId="123" />
}
```

### Opción 2: Importar directo (nombre viejo)
```tsx
import CueTable from "@/modules/cues/components"

export default function Page() {
  return <CueTable rundownId="123" />
}
```

---

## 🎯 Próximas Mejoras

1. **Columnas Configurable**: Usar `ColumnManager` para show/hide fields
2. **Agrupación por Segmentos**: Activar `SegmentGroup` con UI
3. **dnd-kit Library**: Para drag/drop más robusto (actualmente HTML5 nativo)
4. **Scroll Automático**: Auto-scroll al arrastrar cerca de edges
5. **Keyboard Navigation**: Soporte para arrows + space para reordenar
6. **Atajos**: Ctrl+D para delete, Ctrl+S para save, etc.
7. **Búsqueda/Filtrado**: Buscar cues por title
8. **Temas**: Modo oscuro/claro (actualmente light)

---

## 🐛 Troubleshooting

**Q: El drag & drop no funciona**
- Verifica que los elementos tengan `draggable="true"`
- Comprueba la consola para errores
- Asegúrate que `onDragStart` se ejecuta

**Q: Las tarjetas no se muestran**
- Verifica el `rundownId` prop
- Comprueba el contexto `useRundown()`
- Revisa que haya datos en la BD

**Q: ¿Dónde está CueRow/CueTable viejo?**
- Aún existent en Git, pero están deprecados
- Usa `CueListHorizontal` en su lugar
- La compatibilidad está en `index.ts`

---

## 📝 Notas Técnicas

- **Scroll**: `overflow-x-auto` en el contenedor para scroll horizontal
- **Drag**: HTML5 Drag API (sin librerías externas por ahora)
- **Estilos**: Tailwind CSS con custom hover/dynamic classes
- **Validación**: Edición inline con fallback a cancel
- **Performance**: Memoización via sort() en CueListHorizontal
