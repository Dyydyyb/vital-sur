# Guía de Implementación de Supabase para Vital Sur

Esta guía te explica paso a paso cómo conectar la base de datos PostgreSQL de **Supabase** a la tienda online y CRM de **Vital Sur**.

---

## 1. Crear el Proyecto en Supabase
1. Ingresá a [supabase.com](https://supabase.com) e iniciá sesión o registrate gratis.
2. Hacé clic en **"New Project"**.
3. Completá los datos del proyecto:
   - **Name**: `vital-sur-db` (o el nombre que prefieras).
   - **Database Password**: generá una contraseña segura y guardala.
   - **Region**: elegí `sa-east-1 (São Paulo)` para la menor latencia desde Argentina y Buenos Aires.
4. Hacé clic en **"Create new project"** y esperá 1 a 2 minutos mientras se aprovisiona la base de datos.

---

## 2. Ejecutar el Script de Tablas y Seguridad
1. En el panel izquierdo de tu proyecto en Supabase, hacé clic en **"SQL Editor"** (ícono de terminal `>_`).
2. Hacé clic en **"New query"**.
3. Abrí el archivo [`supabase/schema.sql`](./schema.sql) de este repositorio, copiá todo su contenido y pegalo en el editor de Supabase.
4. Hacé clic en el botón verde **"Run"** (o presioná `Ctrl + Enter`).
5. Verificá que en la parte inferior aparezca `Success. No rows returned`.

### Qué crea este script:
- `store_settings`: Configuración editable de la tienda (costo de envío $8.999, umbral gratis $80.000, Correo Argentino, WhatsApp 54 9 11 3406-2942, medios de pago).
- `categories`: Taxonomía oficial de suplementos (Proteínas, Creatinas, Aminoácidos, Salud & Bienestar, Pre-entreno, Accesorios).
- `products`: Catálogo listo para cargar productos reales (inicia limpio en 0).
- `customers`: Directorio CRM de clientes y compradores.
- `orders` y `order_items`: Pedidos en tiempo real con campo para número de seguimiento de Correo Argentino.
- `stock_movements`: Kardex de inventario y trazabilidad.
- `coupons`: Sistema de descuentos por porcentaje o monto fijo.
- `staff_users`: Usuarios de administración (`admin@vitalsur.com.ar` y `colaborador@vitalsur.com.ar`).
- **Row Level Security (RLS)**: Políticas automáticas para que el público pueda consultar productos y crear pedidos, mientras que las operaciones sensibles quedan protegidas.

---

## 3. Obtener tus Credenciales de Supabase
1. En el panel de Supabase, andá a **Project Settings** (el engranaje abajo a la izquierda) y hacé clic en **API**.
2. Copiá:
   - **Project URL** (ejemplo: `https://xyzcompany.supabase.co`).
   - **anon / public** API Key (la clave pública para el navegador).
   - **service_role** API Key (la clave secreta para operaciones administrativas del backend).

---

## 4. Configurar las Variables de Entorno en el Proyecto
Abrí el archivo `.env.local` en la raíz de `vital-sur` y pegá tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anon"
SUPABASE_SERVICE_ROLE_KEY="tu-clave-service-role"
```

---

## 5. ¡Listo!
El sistema detecta automáticamente cuando las variables están presentes:
- Las lecturas y escrituras sincronizan en tiempo real con Supabase.
- Si las variables están vacías, el sistema utiliza el almacenamiento local seguro (`data/vitalsur-db.json`) como fallback transparente sin interrumpir el funcionamiento ni el desarrollo.

