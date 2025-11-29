# Guía de Configuración de Supabase para LegalMind

## 📋 Pasos para Configurar Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa:
   - **Name**: LegalMind (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige la más cercana (ej: US East)
   - **Pricing Plan**: Free tier es suficiente para MVP

### 2. Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia las siguientes credenciales:
   - **Project URL**: `https://[tu-proyecto].supabase.co`
   - **anon public key**: La clave pública anónima
   - **service_role key**: La clave de servicio (mantener secreta)

### 3. Obtener Connection String

1. Ve a **Settings** → **Database**
2. En "Connection string", selecciona **URI**
3. Copia la connection string
4. Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste
5. Agrega `?pgbouncer=true&connection_limit=1` al final

Ejemplo:
```
postgresql://postgres:[TU-PASSWORD]@db.[tu-proyecto].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

### 4. Configurar Variables de Entorno

Crea o actualiza tu archivo `.env` en la raíz del proyecto:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[TU-PASSWORD]@db.[tu-proyecto].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]

# OpenAI
OPENAI_API_KEY=[tu-openai-key]
```

**⚠️ IMPORTANTE**: 
- Nunca subas el archivo `.env` a Git
- El archivo `.env.example` está en el repo como plantilla
- Reemplaza `[TU-PASSWORD]`, `[tu-proyecto]`, etc. con tus valores reales

### 5. Ejecutar Migraciones

Una vez configurado el `.env`:

```bash
# Generar el cliente de Prisma con el nuevo schema
npx prisma generate

# Ejecutar migraciones en Supabase
npx prisma migrate deploy

# O si prefieres crear una nueva migración:
npx prisma migrate dev --name init_supabase
```

### 6. Verificar Conexión

```bash
# Abrir Prisma Studio para verificar
npx prisma studio
```

Deberías poder ver las tablas en Supabase.

## 🔐 Configuración de Autenticación (Opcional por ahora)

Por ahora, el sistema funciona sin autenticación estricta. Todos los usuarios son "abogados" por defecto.

Para implementar autenticación más adelante:
1. Habilitar Email Auth en Supabase Dashboard
2. Configurar políticas RLS (Row Level Security)
3. Implementar páginas de login/registro

## 📊 Dashboard de Historial

El dashboard de historial (`/dashboard/history`) es **público** y muestra:
- Total de simulaciones
- Simulaciones completadas
- Calificación promedio
- Tiempo total de práctica
- Lista de casos resueltos

Esto permite métricas generales sin necesidad de autenticación.

## 🚀 Próximos Pasos

1. ✅ Configurar credenciales en `.env`
2. ✅ Ejecutar migraciones
3. ✅ Probar conexión
4. ⏭️ Implementar autenticación (futuro)
5. ⏭️ Configurar RLS policies (futuro)

## 📝 Notas

- El schema de Prisma ya está actualizado para PostgreSQL
- El rol por defecto es "ABOGADO" (sin roles múltiples por ahora)
- El dashboard de historial es público para métricas
- La autenticación se implementará en una fase posterior

---

**¿Problemas?**
- Verifica que las credenciales estén correctas
- Asegúrate de que la contraseña de la base de datos sea correcta
- Verifica que el proyecto de Supabase esté activo
- Revisa los logs de Prisma para errores de conexión

