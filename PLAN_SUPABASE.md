# Plan de Integración Supabase para LegalMind MVP

## 📋 Resumen Ejecutivo

Este documento detalla el plan de migración e integración de Supabase para transformar LegalMind de un MVP local (SQLite) a una plataforma escalable lista para inversionistas, con autenticación, sesiones de usuario, calificaciones, dashboards y análisis.

---

## 🎯 Objetivos de la Integración

### Para MVP con Inversionistas:
1. **Autenticación de usuarios** - Sistema de login/registro profesional
2. **Sesiones persistentes** - Cada usuario tiene su propio historial
3. **Sistema de calificaciones** - Feedback estructurado y scoring
4. **Dashboard analítico** - Métricas y progreso del usuario
5. **Multi-tenancy** - Soporte para múltiples usuarios simultáneos
6. **Escalabilidad** - Base de datos PostgreSQL en la nube

---

## 🏗️ Arquitectura Propuesta

### Stack Tecnológico:
- **Base de Datos**: Supabase PostgreSQL (migración desde SQLite)
- **Autenticación**: Supabase Auth (email/password, OAuth opcional)
- **Storage**: Supabase Storage (para documentos/evidencias)
- **Real-time**: Supabase Realtime (opcional, para features futuras)
- **Frontend**: Next.js (mantener)
- **ORM**: Prisma (mantener, cambiar datasource)

---

## 📊 Esquema de Base de Datos (Supabase)

### Tablas Principales:

#### 1. **users** (Supabase Auth + tabla extendida)
```sql
-- Usa la tabla auth.users de Supabase
-- Tabla extendida: public.user_profiles
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  role TEXT DEFAULT 'STUDENT', -- STUDENT, INSTRUCTOR, ADMIN
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'FREE', -- FREE, PREMIUM, ENTERPRISE
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **cases** (Casos de estudio)
```sql
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- PENAL, CIVIL, LABORAL, etc.
  difficulty TEXT NOT NULL, -- BASIC, INTERMEDIATE, ADVANCED
  scenario TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. **simulations** (Simulaciones de juicio)
```sql
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  case_id UUID NOT NULL REFERENCES public.cases(id),
  status TEXT DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, ABANDONED
  score INTEGER,
  case_accepted BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. **messages** (Mensajes del chat)
```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- USER, SYSTEM, JUDGE, WITNESS, etc.
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_simulation ON public.messages(simulation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);
```

#### 5. **feedback** (Calificaciones y feedback)
```sql
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID UNIQUE NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL, -- 0-100
  argumentation_score INTEGER, -- 0-100
  evidence_usage_score INTEGER, -- 0-100
  objection_handling_score INTEGER, -- 0-100
  content TEXT, -- Feedback detallado
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. **user_progress** (Progreso del usuario)
```sql
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  total_simulations INTEGER DEFAULT 0,
  completed_simulations INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  total_time_minutes INTEGER DEFAULT 0,
  cases_completed JSONB, -- Array de case_ids completados
  achievements JSONB, -- Array de logros desbloqueados
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### 7. **case_templates** (Plantillas de casos)
```sql
CREATE TABLE public.case_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  real_case_reference TEXT, -- Referencia al caso real
  year INTEGER,
  country TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Políticas RLS (Row Level Security):

```sql
-- Users solo pueden ver sus propios perfiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users pueden ver casos públicos o sus propios casos
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public cases" ON public.cases
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- Users solo pueden ver sus propias simulaciones
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own simulations" ON public.simulations
  FOR SELECT USING (auth.uid() = user_id);

-- Users solo pueden ver mensajes de sus simulaciones
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.simulations
      WHERE simulations.id = messages.simulation_id
      AND simulations.user_id = auth.uid()
    )
  );
```

---

## 🔐 Autenticación

### Flujo de Autenticación:
1. **Registro**: Email/Password con verificación de email
2. **Login**: Supabase Auth con sesiones JWT
3. **OAuth Opcional**: Google, GitHub (para MVP futuro)

### Implementación:
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Middleware para proteger rutas
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createClient(...)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && request.nextUrl.pathname.startsWith('/simulation')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

---

## 📈 Dashboard y Analytics

### Métricas a Mostrar:

#### Dashboard Principal:
1. **Estadísticas Generales**:
   - Total de simulaciones completadas
   - Promedio de calificación
   - Tiempo total de práctica
   - Casos completados por categoría

2. **Gráficos**:
   - Progreso de calificaciones (línea de tiempo)
   - Distribución por dificultad (pie chart)
   - Comparación con otros usuarios (opcional)

3. **Logros y Badges**:
   - Primer caso completado
   - 10 casos completados
   - Calificación perfecta
   - Especialista en [categoría]

#### Dashboard de Simulación Individual:
- Resumen del caso
- Calificación desglosada
- Feedback detallado
- Timeline de eventos
- Evidencias utilizadas

---

## 🎓 Sistema de Calificaciones

### Criterios de Evaluación:

1. **Argumentación** (30%):
   - Claridad de argumentos
   - Uso de precedentes
   - Estructura lógica

2. **Uso de Evidencias** (25%):
   - Presentación oportuna
   - Relevancia de evidencias
   - Contradicciones encontradas

3. **Manejo de Objeciones** (25%):
   - Respuestas a objeciones
   - Objeciones propias presentadas
   - Sustento legal

4. **Estrategia General** (20%):
   - Flujo del juicio
   - Timing de intervenciones
   - Manejo de testigos

### Implementación:
```typescript
// lib/actions/feedback.ts
export async function generateFeedback(simulationId: string) {
  // Analizar mensajes de la simulación
  // Calcular scores por criterio
  // Generar feedback usando IA
  // Guardar en tabla feedback
}
```

---

## 🔄 Plan de Migración

### Fase 1: Setup Inicial (Semana 1)
- [ ] Crear proyecto Supabase
- [ ] Configurar variables de entorno
- [ ] Crear esquema de base de datos
- [ ] Configurar RLS policies
- [ ] Setup Prisma con Supabase

### Fase 2: Autenticación (Semana 1-2)
- [ ] Implementar Supabase Auth
- [ ] Crear páginas de login/registro
- [ ] Middleware de protección de rutas
- [ ] Migrar datos de usuarios existentes (si hay)

### Fase 3: Migración de Datos (Semana 2)
- [ ] Script de migración SQLite → PostgreSQL
- [ ] Migrar casos existentes
- [ ] Migrar simulaciones (opcional, o empezar limpio)
- [ ] Validar integridad de datos

### Fase 4: Funcionalidades Nuevas (Semana 2-3)
- [ ] Sistema de calificaciones
- [ ] Dashboard de usuario
- [ ] Progreso y logros
- [ ] Feedback estructurado

### Fase 5: Testing y Optimización (Semana 3-4)
- [ ] Testing de autenticación
- [ ] Testing de RLS
- [ ] Optimización de queries
- [ ] Testing de carga

---

## 💰 Consideraciones de Costos

### Supabase Free Tier:
- 500 MB base de datos
- 2 GB bandwidth
- 1 GB file storage
- 50,000 monthly active users

### Para MVP con Inversionistas:
- **Pro Plan**: $25/mes
  - 8 GB base de datos
  - 250 GB bandwidth
  - 100 GB storage
  - Adecuado para demostración

### Escalabilidad Futura:
- **Team Plan**: $599/mes (cuando haya usuarios reales)
- Considerar caching con Redis
- CDN para assets estáticos

---

## 🚀 Features Adicionales para MVP

### Prioridad Alta:
1. ✅ Autenticación de usuarios
2. ✅ Sesiones persistentes
3. ✅ Sistema de calificaciones básico
4. ✅ Dashboard personal

### Prioridad Media:
5. ⚠️ Comparación con otros usuarios (anónima)
6. ⚠️ Exportar reporte de simulación (PDF)
7. ⚠️ Compartir casos completados

### Prioridad Baja (Post-MVP):
8. 🔮 Multiplayer (dos abogados compitiendo)
9. 🔮 Realtime collaboration
10. 🔮 Video recordings de simulaciones
11. 🔮 Marketplace de casos creados por usuarios

---

## 📝 Checklist de Implementación

### Backend:
- [ ] Configurar Supabase project
- [ ] Crear todas las tablas
- [ ] Configurar RLS policies
- [ ] Actualizar Prisma schema
- [ ] Migrar server actions a usar Supabase
- [ ] Implementar autenticación
- [ ] Sistema de calificaciones
- [ ] API endpoints para dashboard

### Frontend:
- [ ] Página de login/registro
- [ ] Protección de rutas
- [ ] Dashboard de usuario
- [ ] Vista de progreso
- [ ] Vista de calificaciones detalladas
- [ ] Mejoras de UI/UX

### Testing:
- [ ] Testing de autenticación
- [ ] Testing de RLS
- [ ] Testing de migración de datos
- [ ] Testing de performance

---

## 🎯 Métricas de Éxito para MVP

1. **Técnicas**:
   - Tiempo de respuesta < 200ms
   - 99.9% uptime
   - Soporte para 100+ usuarios concurrentes

2. **Funcionales**:
   - Login/registro funcional
   - Sesiones persistentes
   - Calificaciones precisas
   - Dashboard informativo

3. **Negocio**:
   - Demostrable a inversionistas
   - Escalable a producción
   - Base para features futuras

---

## 📚 Recursos y Documentación

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)

---

## ⚠️ Consideraciones Importantes

1. **Migración de Datos**: Decidir si migrar datos existentes o empezar limpio
2. **Backward Compatibility**: Mantener compatibilidad durante transición
3. **Testing**: Probar exhaustivamente antes de lanzar
4. **Backup**: Configurar backups automáticos en Supabase
5. **Monitoreo**: Configurar alertas y monitoreo

---

**Última actualización**: 2024
**Versión**: 1.0
**Estado**: Planificación

