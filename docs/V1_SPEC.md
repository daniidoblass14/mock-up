# Especificación V1 - AutoLytix

## Objetivo V1

Especificación visual V1 para **pequeña flota (5-20 vehículos)**, enfocada en gestión básica de vehículos y mantenimientos. Versión congelable y coherente, sin backend real, solo UI + lógica mock/local.

## Organización (V1 Mock)

En la versión V1 existe una única organización simulada (mock).
- Todas las validaciones de unicidad (matrícula, VIN) se aplican dentro de esta organización mock
- El concepto de organización real (multiempresa) se implementará en backend y queda fuera del alcance V1
- No existe gestión de múltiples organizaciones en la UI V1

## Alcance V1

### Must Have (Incluido)

- ✅ Gestión de vehículos (CRUD)
- ✅ Gestión de mantenimientos (CRUD)
- ✅ Calendario de mantenimientos
- ✅ Análisis de costes de mantenimiento
- ✅ Dashboard con KPIs y urgencias
- ✅ Estado derivado de vehículos basado en mantenimientos
- ✅ Completar mantenimientos con actualización de kilometraje

### Should Have (Incluido)

- ✅ Filtros y búsqueda básica
- ✅ Validaciones de formularios
- ✅ Estados vacíos y de carga
- ✅ Breadcrumbs y navegación coherente

### Won't Have (Excluido explícitamente)

- ❌ Integraciones externas
- ❌ IA / Predicciones avanzadas
- ❌ Adjuntos de archivos
- ❌ Notificaciones email/push
- ❌ Gestión de conductores
- ❌ Multiempresa compleja
- ❌ Backend real (solo mock/localStorage)

## Rutas V1

### Rutas Obligatorias

- `/login` - Inicio de sesión
- `/dashboard` - Resumen de flota
- `/vehiculos` - Listado de vehículos
- `/vehiculos/:id` - Detalle de vehículo
- `/mantenimientos` - Listado de mantenimientos
- `/mantenimientos/:id` - Detalle de mantenimiento
- `/calendario` - Calendario de mantenimientos
- `/costes` - Análisis de costes (renombrado desde /graficas)

### Rutas Opcionales

- `/perfil` - Oculto en navegación (existe pero no se muestra en sidebar)

## Reglas de Negocio V1

### A) Vehículos

#### Formulario "Añadir/Editar vehículo"

**Campos obligatorios:**
- Marca/Modelo
- Tipo (coche/furgo/camión básico)
- Año
- Matrícula
- Kilometraje actual (kmActual)

**Campos opcionales:**
- VIN

**Validaciones:**
- Matrícula: formato válido (0000-AAA) y única dentro de la organización mock
- VIN: si se rellena, debe ser único dentro de la organización mock
- Permitir vehículos con misma marca/modelo (NO bloquear duplicados de marca/modelo)

**Estado del vehículo:**
- ❌ **NO es editable** - es derivado automáticamente
- Se calcula basado en mantenimientos asociados:
  - **"Vencido"** si tiene ≥ 1 mantenimiento vencido
  - **"Próximo"** si no tiene vencidos pero sí ≥ 1 próximo
  - **"Al día"** si no tiene vencidos ni próximos

#### Listado de vehículos

- Mostrar badge de estado derivado: "Al día / Próximo / Vencido"
- Filtros por estado
- Búsqueda por modelo, matrícula, tipo, VIN

### B) Mantenimientos

#### Crear mantenimiento

**Campos obligatorios:**
- Vehículo
- Tipo (catálogo + "Otro")
- Coste
- **Al menos uno de:** fechaObjetivo **o** kmObjetivo (permitir ambos)

**Reglas de vencimiento:**

Un mantenimiento está:
- **Vencido** si:
  - `fechaObjetivo < hoy` **o**
  - `kmObjetivo <= kmActual` del vehículo
- **Próximo** si:
  - `fechaObjetivo` en ≤ 30 días **o**
  - `(kmObjetivo - kmActual) ≤ 1000 km`
- **Al día** en caso contrario

**Evaluación:**
- Si solo hay fecha, evaluar por fecha
- Si solo hay km, evaluar por km
- Si hay ambos, se evalúan de forma independiente: el mantenimiento se considera vencido o próximo si se cumple cualquiera de los dos criterios
- No existe prioridad entre fecha y kilómetros; ambos se evalúan de forma independiente

#### Completar mantenimiento

**Acción disponible en:** detalle de mantenimiento (botón "Completar mantenimiento")

**Datos a capturar:**
- `fechaReal` (obligatorio)
- `kmReal` (obligatorio)
- `costeReal` (opcional, si ya existe coste se pre-rellena)

**Comportamiento del coste:**
- El campo `costeReal` es opcional
- Si se introduce `costeReal`, este sustituye al coste planificado del mantenimiento
- Si no se introduce `costeReal`, se mantiene el coste original del mantenimiento

**Regla de actualización de km del vehículo:**
- Si `kmReal > kmActualVehiculo`: **actualizar** `kmActual` del vehículo
- Si `kmReal < kmActual`: **NO actualizar** y mostrar aviso claro (toast warning)

**Resultado:**
- Mantenimiento cambia a estado "Completado"
- Se guarda información de completado en notas

### C) Calendario

- Mostrar **solo mantenimientos** (no tareas manuales)
- Filtros: por vehículo y por tipo
- Búsqueda: por vehículo o tipo
- **Click en evento:** navegar a `/mantenimientos/:id` directamente

### D) Costes

- Renombrado desde "Gráficas" a "Costes"
- Ruta: `/costes`
- Solo reflejar **costes de mantenimiento**
- Vista anual: total anual y desglose por meses del año actual
- Filtro por vehículo (y opción "Flota")
- ❌ Eliminada comparativa "año actual vs anterior"

### E) Dashboard

**KPIs principales:**
- Mantenimientos vencidos
- Próximos (30 días / 1000 km)
- Coste del año (mantenimiento)

**Sección "Urgencias":**
- Lista accionable de mantenimientos urgentes
- Muestra: mantenimiento + vehículo + motivo (vencido por fecha/km o próximo por fecha/km)
- CTA "Ver" que lleva al detalle del mantenimiento

## Umbrales V1

- **Próximo por fecha:** ≤ 30 días
- **Próximo por km:** ≤ 1000 km
- **Flota objetivo:** 5-20 vehículos

## Decisiones Asumidas

1. **Costes = solo mantenimiento:** No se incluyen otros costes (combustible, seguros, etc.)
2. **Calendario click → detalle:** Click en evento navega directamente a `/mantenimientos/:id`
3. **Estado derivado automático:** Se recalcula automáticamente al crear/actualizar/eliminar mantenimientos
4. **Completar mantenimiento:** Actualiza km del vehículo solo si kmReal > kmActual
5. **VIN opcional:** No es obligatorio, pero si se proporciona debe ser único
6. **Marca/Modelo duplicados:** Permitidos (no se valida unicidad de marca+modelo)
7. **Tipo de mantenimiento:** Catálogo predefinido + opción "Otro"
8. **Fecha o km:** Al menos uno obligatorio, ambos permitidos
9. **Auditoría completa fuera de V1:** En V1 solo se mantienen campos técnicos como createdAt y updatedAt. No se muestra historial de cambios al usuario. La auditoría completa (quién, cuándo, qué cambió) queda fuera del alcance V1

## Arquitectura

- **Componentes reutilizables:** Modal, CustomSelect, ConfirmDialog, Layout, Sidebar, Header
- **Servicios mock:** VehiculosService, MantenimientosService, CalendarioService
- **Contextos:** AppContext (estado global), ThemeContext, ToastContext
- **Persistencia:** localStorage
- **Validaciones:** Inline en formularios, botones deshabilitados si inválido

## Calidad UX Mínima

- ✅ Empty states claros (sin datos)
- ✅ Loading states (aunque sea fake)
- ✅ Error states (si falla mock)
- ✅ ConfirmDialog en eliminar
- ✅ Breadcrumb + botón volver en detalles
- ✅ Consistencia de formularios (errores inline, deshabilitar botón si inválido)

## Navegación

**Sidebar muestra solo:**
- Dashboard
- Vehículos
- Mantenimientos
- Calendario
- Costes

**Oculto:**
- Perfil (existe pero no se muestra en navegación principal)

## Criterios de Aceptación

La rama queda lista si:

- ✅ La app navega solo por rutas V1 sin elementos "fantasma"
- ✅ "Estado vehículo" nunca se edita y se deriva correctamente
- ✅ Mantenimientos vencen por fecha o km según reglas V1
- ✅ Completar mantenimiento actualiza km con regla segura
- ✅ Calendario lleva a detalle del mantenimiento
- ✅ Costes solo reflejan mantenimiento y filtran por vehículo
- ✅ Dashboard muestra KPIs y urgencias según V1
- ✅ Existe `docs/V1_SPEC.md`

## Notas Técnicas

- **Estado derivado:** Se recalcula en AppContext al crear/actualizar/eliminar mantenimientos
- **Calendario:** Las tareas se generan automáticamente desde mantenimientos con fechaVencimiento
- **Validaciones:** Matrícula única dentro de la organización mock, VIN único dentro de la organización mock (si se proporciona)
- **Formularios:** Validación en tiempo real, botones deshabilitados si hay errores
- **Auditoría:** Solo campos técnicos (createdAt, updatedAt). No se implementa historial de cambios visible al usuario en V1

## Correcciones de Errores Aplicadas

### Error: Declaración duplicada de variables

**Problema detectado:**
- `DetalleMantenimiento.tsx`: Variable `vehiculos` declarada dos veces (línea 52 desde `useApp()` y línea 106 con `vehiculosService.getAll()`)
- `DetalleVehiculo.tsx`: Variable `mantenimientos` declarada dos veces (línea 32 desde `useApp()` y línea 82 con `mantenimientosService.getByVehiculoId()`)

**Solución aplicada:**
- En `DetalleMantenimiento.tsx`: Eliminada la declaración duplicada `const vehiculos = vehiculosService.getAll()`. Se usa `vehiculos` del contexto `useApp()` en todo el componente.
- En `DetalleVehiculo.tsx`: Renombrada la variable local a `mantenimientosVehiculo` para el historial del vehículo específico, manteniendo `mantenimientos` del contexto para el cálculo del estado derivado.

**Lección aprendida:**
- Usar variables del contexto `useApp()` para datos globales
- Renombrar variables locales cuando se necesite un subconjunto filtrado de los datos del contexto

---

**Versión:** 1.0.0  
**Fecha:** 2024  
**Rama:** `release/v1-ui-spec`
