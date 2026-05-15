# ERP-Lite Web - Plan de Desarrollo Frontend

## Descripcion

Frontend empresarial para ERP-Lite, construido con Angular y PrimeNG, orientado a un SaaS multi-tenant con autenticacion JWT, autorizacion por roles/permisos y modulos operativos para clientes, productos, facturas y pagos.

El frontend debe consumir la API existente de `erp-lite-api`, respetando las reglas criticas del backend:

- Nunca enviar `tenantId` desde el frontend.
- Usar JWT en endpoints protegidos.
- Manejar refresh token mediante `POST /api/auth/refresh`.
- Validar formularios en frontend, sin confiar solo en esa validacion.
- Mantener componentes delgados y delegar logica a servicios.

---

## Objetivo

Construir una aplicacion Angular profesional, mantenible y segura que permita:

- Registrar una empresa/tenant.
- Iniciar sesion.
- Renovar sesion automaticamente con refresh token.
- Proteger rutas con guards.
- Controlar acceso por permisos.
- Gestionar clientes, productos, facturas y pagos.
- Preparar la base para dashboard, reportes, usuarios, roles y configuracion.

---

## Stack Tecnologico

### Base

- Angular 21
- TypeScript
- RxJS
- Angular Router
- Reactive Forms
- Angular HTTP Client
- Angular Signals para estado local/simple

### UI

- PrimeNG
- PrimeIcons
- PrimeFlex o utilidades CSS propias
- Tema PrimeNG configurado globalmente

### Testing

- Vitest / Angular test builder actual del proyecto
- Tests unitarios para servicios, guards e interceptors
- Tests de componentes para formularios criticos

---

## Dependencias Iniciales

El proyecto actual todavia no incluye PrimeNG en `package.json`. Antes de implementar pantallas se debe agregar:

```bash
npm install primeng primeicons
```

Opcional, solo si se decide usar utilidades de layout de PrimeNG:

```bash
npm install primeflex
```

No agregar librerias de estado global como NgRx en la primera fase. El alcance inicial se puede resolver con servicios, signals y RxJS.

---

## Arquitectura Propuesta

Usar estructura feature-based con componentes standalone y rutas lazy-loaded.

```text
src/app/
  core/
    auth/
    config/
    guards/
    interceptors/
    models/
    services/
  shared/
    components/
    pipes/
    utils/
  layout/
    shell/
    sidebar/
    topbar/
  features/
    auth/
    dashboard/
    customers/
    products/
    invoices/
    payments/
    users/
    roles/
    settings/
```

### Reglas de arquitectura

- Los componentes no deben llamar `HttpClient` directamente.
- Cada feature debe tener sus propios `models`, `services`, `pages` y `components` cuando aplique.
- `core` solo debe contener servicios singleton, guards, interceptors, configuracion y modelos transversales.
- `shared` solo debe contener piezas reutilizables sin dependencia directa de una feature.
- Las rutas de features deben cargarse con `loadChildren` o `loadComponent`.

---

## Configuracion Global

### Environments

Crear configuracion para API base URL:

```text
src/environments/environment.ts
src/environments/environment.development.ts
```

Ejemplo:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:5001/api'
};
```

La URL real debe ajustarse al puerto configurado en `erp-lite-api`.

### App Config

Actualizar `app.config.ts` para proveer:

- `provideHttpClient()` con interceptors.
- `provideRouter(routes)`.
- Animaciones requeridas por PrimeNG si aplica.
- Providers globales de PrimeNG.
- Configuracion de mensajes/toasts.

---

## Autenticacion y Sesion

### Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### Modelos

```ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterTenantRequest {
  name: string;
  slug?: string | null;
  ownerFullName: string;
  ownerEmail: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  userId: string;
  tenantId: string;
  fullName: string;
  email: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}
```

### Estrategia de almacenamiento

Para cumplir la regla de seguridad del proyecto:

- No usar `localStorage` para tokens.
- Mantener tokens en memoria dentro de `AuthSessionService`.
- Si el usuario recarga la pagina, la sesion se pierde y debe iniciar sesion de nuevo.

Mejora futura recomendada:

- Migrar refresh token a cookie `httpOnly`, `Secure`, `SameSite`.
- Mantener access token en memoria.

### AuthSessionService

Responsabilidades:

- Guardar estado de sesion en memoria.
- Exponer usuario actual, roles y estado autenticado.
- Guardar `accessToken` y `refreshToken`.
- Limpiar sesion en logout o refresh fallido.
- No decodificar ni confiar en `tenantId` para enviarlo al backend.

### AuthApiService

Responsabilidades:

- `login(request)`
- `registerTenant(request)`
- `refreshToken(request)`

### AuthInterceptor

Responsabilidades:

- Adjuntar `Authorization: Bearer {accessToken}` a requests protegidas.
- No adjuntar token a `/api/auth/login`, `/api/auth/register` ni `/api/auth/refresh`.
- Si una request protegida responde `401`, intentar `refresh`.
- Si refresh funciona, actualizar sesion y reintentar la request original.
- Si refresh falla, limpiar sesion y redirigir a `/login`.
- Evitar multiples refresh simultaneos usando una cola/control RxJS.

### ErrorInterceptor

Responsabilidades:

- Transformar errores HTTP en mensajes de usuario.
- Manejar:
  - `400`: errores de validacion.
  - `401`: sesion expirada si refresh falla.
  - `403`: acceso denegado.
  - `404`: recurso no encontrado.
  - `500`: error generico.
- No mostrar stack traces ni detalles internos.

---

## Autorizacion

### Roles actuales

- `Owner`
- `Admin`
- `Manager`
- `Employee`

### Permisos actuales del backend

- `customers.read`
- `customers.create`
- `customers.update`
- `customers.delete`
- `products.read`
- `products.create`
- `products.update`
- `products.delete`
- `invoices.read`
- `invoices.create`
- `invoices.update`
- `invoices.delete`
- `payments.read`
- `payments.create`
- `payments.delete`

### Guards

Crear:

- `authGuard`: permite entrar solo con sesion activa.
- `guestGuard`: evita que usuarios autenticados entren a login/register.
- `permissionGuard`: valida permisos requeridos por ruta.

Nota importante:

El `AuthResponse` actual devuelve roles, no permisos. Para bloqueo granular completo en frontend hay dos opciones:

- Fase inicial: usar roles para navegacion y permisos visuales basicos.
- Mejora backend: agregar permisos al `AuthResponse` o crear endpoint `GET /api/me/permissions`.

Para el primer desarrollo, el backend sigue siendo la fuente real de autorizacion. El frontend puede ocultar acciones por rol, pero debe asumir que el backend rechazara acciones no permitidas con `403`.

---

## Rutas

### Publicas

```text
/login
/register
```

### Protegidas

```text
/app/dashboard
/app/customers
/app/products
/app/invoices
/app/invoices/:id
/app/payments
/app/users
/app/roles
/app/settings
```

### Redirecciones

- `/` redirige a `/app/dashboard` si hay sesion activa.
- `/` redirige a `/login` si no hay sesion.
- Ruta desconocida redirige a una pagina `not-found`.

---

## Layout

Crear un shell empresarial responsive:

- Sidebar con navegacion principal.
- Topbar con nombre de usuario, tenant visible solo como informacion y boton logout.
- Area central para contenido.
- Breadcrumb por pagina.
- Soporte responsive para desktop y tablet.

Navegacion inicial:

- Dashboard
- Clientes
- Productos
- Facturas
- Pagos
- Usuarios
- Roles
- Configuracion

Usar PrimeNG para:

- `p-menubar` o `p-panelMenu`
- `p-drawer` en mobile/tablet
- `p-avatar`
- `p-toast`
- `p-confirmDialog`

---

## Shared Components

Crear componentes reutilizables para evitar duplicacion:

- `PageHeaderComponent`: titulo, descripcion y acciones.
- `DataTableToolbarComponent`: busqueda, filtros y boton crear.
- `EmptyStateComponent`: estado sin datos.
- `LoadingStateComponent`: carga estandar.
- `ConfirmDeleteDialog` usando PrimeNG ConfirmDialog.
- `ValidationErrorsComponent`: errores de formularios.
- `StatusTagComponent`: etiquetas de estado para facturas.

---

## Modulos Funcionales

## Auth

### Pantallas

- Login
- Registro de empresa

### Validaciones

Login:

- Email requerido, formato email, maximo 150 caracteres.
- Password requerido.

Registro:

- Nombre empresa requerido, maximo 150.
- Slug opcional, maximo 100.
- Nombre owner requerido, maximo 150.
- Email owner requerido, formato email, maximo 150.
- Password requerido, minimo 8.

### UX

- Mostrar errores de credenciales como mensaje generico.
- Deshabilitar submit mientras carga.
- Redirigir a dashboard luego de login/register exitoso.

---

## Dashboard

### Fase inicial

Como el backend aun no expone endpoints de reportes/dashboard, crear dashboard con datos derivados de endpoints existentes cuando sea posible:

- Total de clientes usando `GET /api/customers?page=1&pageSize=1`.
- Total de productos usando `GET /api/products?page=1&pageSize=1`.
- Total de facturas usando `GET /api/invoices?page=1&pageSize=1`.

### Mejora futura

Crear endpoint backend especifico:

```http
GET /api/dashboard/summary
```

Con metricas agregadas de ventas, facturas pendientes, pagos recientes y productos con bajo stock.

---

## Customers

### Endpoints

```http
GET /api/customers?page=1&pageSize=10&search=
GET /api/customers/{id}
POST /api/customers
PUT /api/customers/{id}
DELETE /api/customers/{id}
```

### Pantallas

- Lista paginada con busqueda.
- Crear cliente.
- Editar cliente.
- Ver detalle basico.
- Confirmar eliminacion.

### Campos

- `name`
- `email`
- `phone`
- `address`

### PrimeNG

- `p-table`
- `p-dialog`
- `p-inputText`
- `p-textarea`
- `p-button`
- `p-confirmDialog`

---

## Products

### Endpoints

```http
GET /api/products?page=1&pageSize=10&search=
GET /api/products/{id}
POST /api/products
PUT /api/products/{id}
DELETE /api/products/{id}
```

### Pantallas

- Lista paginada con busqueda.
- Crear producto.
- Editar producto.
- Ver detalle.
- Confirmar eliminacion.

### Campos

- `name`
- `description`
- `price`
- `stock`

### Validaciones

- Nombre requerido, maximo 150.
- Descripcion maximo 1000.
- Precio mayor o igual a 0.
- Stock mayor o igual a 0.

---

## Invoices

### Endpoints

```http
GET /api/invoices?page=1&pageSize=10&status=
GET /api/invoices/{id}
POST /api/invoices
PUT /api/invoices/{id}
PATCH /api/invoices/{id}/status
DELETE /api/invoices/{id}
```

### Estados

Segun enum backend:

- `Draft`
- `Sent`
- `Paid`
- `Cancelled`

Si el backend serializa enums como numeros, crear mapping en frontend para mostrar etiquetas correctamente.

### Pantallas

- Lista paginada con filtro por estado.
- Crear factura.
- Editar factura.
- Detalle de factura con items.
- Cambiar estado.
- Confirmar eliminacion.

### Campos principales

- `customerId`
- `invoiceNumber`
- `issueDate`
- `dueDate`
- `taxRate`
- `items`

### Items

- `productId`
- `description`
- `quantity`
- `unitPrice`

### UX

- Seleccionar cliente desde dropdown/autocomplete.
- Agregar/remover items dinamicamente con `FormArray`.
- Calcular subtotal, impuestos y total en frontend solo como vista previa.
- El backend conserva la fuente real del calculo.

---

## Payments

### Endpoints

```http
POST /api/payments
GET /api/payments/invoice/{invoiceId}
GET /api/payments/{id}
DELETE /api/payments/{id}
```

### Pantallas

- Registrar pago desde detalle de factura.
- Ver pagos asociados a una factura.
- Ver detalle de pago.
- Eliminar pago con confirmacion.

### Campos

- `invoiceId`
- `amount`
- `paymentDate`
- `method`
- `reference`
- `notes`

### PaymentMethod

Confirmar valores reales del enum backend al implementar. Crear mapping centralizado para labels de UI.

---

## Users y Roles

### Endpoints actuales

```http
POST /api/users
POST /api/users/{id}/roles
POST /api/roles
POST /api/roles/{id}/permissions
```

### Alcance inicial

El backend actual permite crear usuarios, crear roles y asignar roles/permisos, pero no expone listados. Por eso:

- Implementar formularios solo si se agregan endpoints de consulta.
- O dejar estas pantallas como fase posterior.

### Endpoints backend recomendados antes de UI completa

```http
GET /api/users?page=1&pageSize=10&search=
GET /api/users/{id}
GET /api/roles
GET /api/roles/{id}
GET /api/permissions
```

---

## Settings

### Fase inicial

Pantalla placeholder protegida para configuracion de empresa.

### Mejora backend futura

Agregar endpoints para `TenantSettings`:

```http
GET /api/settings
PUT /api/settings
```

Posibles campos:

- Nombre comercial
- Moneda
- Tasa fiscal por defecto
- Logo
- Numeracion de facturas

---

## Servicios HTTP

Crear servicios por feature:

```text
core/auth/auth-api.service.ts
features/customers/services/customers-api.service.ts
features/products/services/products-api.service.ts
features/invoices/services/invoices-api.service.ts
features/payments/services/payments-api.service.ts
```

### Modelo paginado compartido

```ts
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Reglas

- Servicios retornan `Observable<T>`.
- Componentes manejan estado de carga y errores de presentacion.
- Errores globales se interceptan centralmente.
- No duplicar construccion de query params.

---

## Formularios

Usar Reactive Forms en todos los formularios.

Reglas:

- Validar requerido, email, longitudes y rangos.
- Deshabilitar submit cuando el formulario sea invalido o este cargando.
- Mostrar errores junto al campo.
- Mapear errores `400` del backend a mensajes visibles.
- Usar `FormArray` para items de factura.

---

## UI PrimeNG

Componentes principales:

- `Button`
- `InputText`
- `Password`
- `Table`
- `Paginator`
- `Dialog`
- `ConfirmDialog`
- `Toast`
- `Dropdown` o `Select`
- `Calendar` o `DatePicker`
- `InputNumber`
- `Tag`
- `Card`
- `Toolbar`
- `Menu`

### Guia visual

- UI empresarial sobria, clara y densa sin sentirse saturada.
- Priorizar tablas legibles, acciones claras y estados vacios bien disenados.
- Usar un tema consistente en toda la aplicacion.
- Evitar pantallas genericas sin jerarquia visual.

Antes de disenar pantallas complejas, consultar Stitch MCP para proponer layout visual.

---

## Seguridad Frontend

- No guardar JWT en `localStorage`.
- No enviar `tenantId`.
- No mostrar tokens ni datos sensibles en consola.
- Sanitizar/validar entradas de usuario.
- Manejar `401` y `403` correctamente.
- Logout debe limpiar sesion en memoria.
- Los permisos visuales no sustituyen la autorizacion del backend.

---

## Testing

### Unit tests

- `AuthSessionService`
- `AuthApiService`
- `AuthInterceptor`
- `ErrorInterceptor`
- `authGuard`
- `permissionGuard`
- Servicios HTTP de cada feature

### Component tests

- Login form valido/invalido.
- Register form valido/invalido.
- Customer form.
- Product form.
- Invoice form con items dinamicos.

### Escenarios criticos

- Login exitoso.
- Login invalido.
- Refresh token exitoso.
- Refresh token fallido redirige a login.
- Request protegida reintenta despues de refresh.
- `403` muestra acceso denegado.
- Formularios no envian datos invalidos.

---

## Roadmap

### Fase 1 - Base tecnica

- Instalar y configurar PrimeNG.
- Crear environments.
- Configurar `provideHttpClient`.
- Crear layout base.
- Crear auth session service.
- Crear auth interceptor y error interceptor.
- Crear guards.
- Crear paginas login/register.

### Fase 2 - CRUD principal

- Clientes.
- Productos.
- Facturas.
- Pagos desde detalle de factura.
- Componentes compartidos de tabla, loading, empty state y confirmacion.

### Fase 3 - Experiencia empresarial

- Dashboard inicial.
- Busquedas y filtros.
- Estados visuales.
- Mejoras responsive.
- Manejo de errores mas pulido.

### Fase 4 - Administracion

- Usuarios.
- Roles.
- Permisos.
- Configuracion de tenant.

Requiere ampliar endpoints backend de consulta para usuarios, roles, permisos y settings.

### Fase 5 - Avanzado

- Dashboard real con endpoint agregado.
- Reportes.
- Exportacion PDF/Excel.
- Notificaciones.
- Auditoria.
- Persistencia segura de sesion con cookies httpOnly.

---

## Criterios de Aceptacion

- La app compila con `npm run build`.
- Login/register funcionan contra el backend.
- Requests protegidas incluyen bearer token.
- Refresh token renueva sesion y reintenta requests con `401`.
- Si refresh falla, el usuario vuelve a login.
- CRUD de clientes y productos funciona con paginacion y busqueda.
- Facturas permiten crear/editar items y cambiar estado.
- Pagos se registran desde una factura.
- No se envia `tenantId` desde el frontend.
- No se usa `localStorage` para tokens.
- Las rutas protegidas no son accesibles sin sesion.
- Los errores `400`, `401`, `403`, `404` y `500` muestran mensajes seguros.

---

## Decisiones Pendientes

- Confirmar puerto final/base URL del backend.
- Decidir si se instala `primeflex` o si se usan estilos CSS propios.
- Confirmar si los enums del backend llegan como numeros o strings.
- Definir si el backend agregara permisos en `AuthResponse` o endpoint `GET /api/me/permissions`.
- Definir si la sesion futura migrara a cookies httpOnly.

---

## Resultado Esperado

Frontend Angular para ERP-Lite con arquitectura profesional, PrimeNG, autenticacion segura con refresh token, rutas protegidas, modulos ERP iniciales y base preparada para escalar a funcionalidades administrativas y reportes.
