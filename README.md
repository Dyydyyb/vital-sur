# Vital Sur — E-Commerce y Panel de Administración (CRM)

Plataforma integral de comercio electrónico y sistema de gestión administrativa (CRM/Inventario) desarrollada para **Vital Sur**, tienda de suplementos deportivos y bienestar de **Florencio Varela, Zona Sur del Gran Buenos Aires, Argentina**.

Todo el sistema se encuentra localizado en **español rioplatense (voseo)** y opera en **pesos argentinos (ARS, formato `$12.999`)**.

---

## 1. Características Principales

### Identidad de Marca y Sistema Visual
- **Logo SVG Propio (`VitalSurLogo`)**: Isotipo basado en un brote orgánico estilizado integrado con el sol y horizonte del sur. Disponible en 4 variantes vectoriales en `/public/brand/` y en el componente `<VitalSurLogo />`:
  - `logo-horizontal.svg`
  - `logo-vertical.svg`
  - `isotipo.svg` (utilizado también como `icon.svg` / favicon)
  - `logo-monocromatico.svg`
- **Paleta Oficial**:
  - Blanco base: `#FFFFFF`
  - Fondos suaves alternados: `#F6FAF8`
  - Verde saludable principal: `#2E9E6B` (hover `#237B53`, suave `#E7F6EF`)
  - Azul claro secundario: `#7CC4E8` (contraste `#2E7EA6`)
  - Texto principal: `#1F2D2A`
- **Reglas Estrictas de Estilo**:
  - **Cero emojis** en todo el proyecto (reemplazados al 100% por iconografía SVG vectorial consistente).
  - **Cero efectos neón**, resplandores o degradados saturados; sombras orgánicas difusas de baja opacidad.
  - Ilustraciones de envases de suplementos y escenas 100% vectoriales (`ProductVectorArt`).
  - Animaciones naturales (`200ms–500ms`) con soporte completo para `prefers-reduced-motion`.

### Tienda Pública
- **Hero a Pantalla Completa (`100svh` exactos)**: Sin necesidad de scroll para visualizar título, subtítulo, botones de acción (`Ver productos` / `Conocer más`), composición vectorial animada e indicador de desplazamiento inferior.
- **Catálogo Avanzado (`/productos`)**: Filtros por categoría, subcategoría anidada, marca propia, rango de precio en ARS, ofertas, ordenamiento, búsqueda en tiempo real y carga progresiva.
- **Ficha de Producto (`/productos/[slug]`)**: Galería vectorial de 3 vistas, selector de sabor y tamaño, stock en tiempo real, tabla de información nutricional completa, modo de uso y productos relacionados.
- **Seguimiento de Pedido (`/seguimiento`)**: Consulta pública de estado y código de Correo Argentino.

### Carrito, Envíos y Checkout
- **Reglas de Envío Centralizadas (Correo Argentino)**:
  - Costo fijo nacional: **$8.999** (configurable desde el CRM).
  - **Envío GRATIS** cuando el subtotal alcanza o supera los **$80.000** (configurable desde el CRM).
  - Barra de progreso animada en el carrito lateral y en `/carrito` que calcula exactamente cuánto falta para llegar al envío gratis (*"Te faltan $12.500 para tener envío gratis"*).
- **Checkout (`/checkout`)**:
  - Integración de **Mercado Pago (Modo Prueba Sandbox)** y opción de **Transferencia Bancaria (CBU/Alias)**.

### Panel de Administración (CRM) (`/admin`)
- **Acceso Protegido por Rol**:
  - **Administrador**: `admin@vitalsur.com.ar` / `admin123`
  - **Colaborador**: `colaborador@vitalsur.com.ar` / `varela123`
- **9 Módulos Completos**:
  1. **Dashboard**: Ventas del día, semana y mes con contadores animados, ticket promedio, gráfico vectorial semanal, más vendidos y alertas de stock bajo.
  2. **Pedidos en Tiempo Real**: Notificación visual de nuevos pedidos, 7 estados (`nuevo`, `pago_pendiente`, `pagado`, `en_preparacion`, `despachado`, `entregado`, `cancelado`), carga de seguimiento de Correo Argentino, notas internas e **impresión de Etiqueta de Envío / Remito**.
  3. **Productos**: Alta, baja, modificación, precios de lista/oferta/costo, variantes e **importación/exportación CSV**.
  4. **Categorías**: Crear, editar, ordenar, anidar subcategorías, asignar ícono SVG y activar/desactivar.
  5. **Ventas**: Historial filtrable, cálculo de ganancia neta estimada y exportación CSV/Excel.
  6. **Clientes**: Ficha con historial de compras, total gastado, notas y etiquetas.
  7. **Inventario**: Kardex de movimientos de stock, alertas de stock mínimo y ajustes manuales.
  8. **Cupones**: Descuentos por porcentaje o monto fijo con vigencia y topes.
  9. **Configuración**: Edición en vivo de costo de envío, umbral de envío gratis, datos de Florencio Varela, textos del home y WhatsApp.

---

## 2. Instalación y Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Copiar variables de entorno (opcional para conexión externa a PostgreSQL/Supabase; el proyecto incluye persistencia transaccional local automática en `data/vitalsur-db.json`):
   ```bash
   cp .env.example .env.local
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador:
   - Tienda pública: `http://localhost:3000`
   - Catálogo: `http://localhost:3000/productos`
   - Carrito: `http://localhost:3000/carrito`
   - Checkout: `http://localhost:3000/checkout`
   - Panel CRM: `http://localhost:3000/admin`

---

## 3. Base de Datos con Prisma y Despliegue en Producción

El esquema completo para PostgreSQL / Supabase se encuentra en `prisma/schema.prisma`.

- Para sincronizar el esquema con una instancia PostgreSQL o Supabase:
  ```bash
  npx prisma generate
  npx prisma db push
  ```

- Para compilar y verificar para producción (Vercel, Railway o servidor propio):
  ```bash
  npm run build
  npm run start
  ```

