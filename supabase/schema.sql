-- ========================================================================
-- VITAL SUR - ESQUEMA COMPLETO PARA SUPABASE / POSTGRESQL
-- Tienda de Suplementos Deportivos y Panel CRM (Florencio Varela, Buenos Aires)
-- ========================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- 2. TABLA: store_settings (Configuración General de la Tienda y Reglas)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    store_name VARCHAR(120) NOT NULL DEFAULT 'Vital Sur',
    tagline VARCHAR(255) NOT NULL DEFAULT 'Suplementos deportivos y bienestar natural desde Florencio Varela',
    address VARCHAR(255) NOT NULL DEFAULT 'Florencio Varela, Zona Sur, Provincia de Buenos Aires (Tienda Online)',
    phone VARCHAR(50) NOT NULL DEFAULT '+54 9 11 3406-2942',
    whatsapp_number VARCHAR(50) NOT NULL DEFAULT '5491134062942',
    email VARCHAR(120) NOT NULL DEFAULT 'hola@vitalsur.com.ar',
    instagram VARCHAR(100) NOT NULL DEFAULT '@vitalsur.suplementos',
    facebook VARCHAR(100) NOT NULL DEFAULT '/vitalsur.varela',
    shipping_cost INTEGER NOT NULL DEFAULT 8999,
    free_shipping_threshold INTEGER NOT NULL DEFAULT 80000,
    shipping_carrier VARCHAR(100) NOT NULL DEFAULT 'Correo Argentino',
    promo_banner_text VARCHAR(255) NOT NULL DEFAULT 'Envíos a todo el país por Correo Argentino | Envío GRATIS en compras superiores a $80.000',
    hero_title VARCHAR(255) NOT NULL DEFAULT 'Nutrición honesta y energía real para potenciar cada entrenamiento',
    hero_subtitle TEXT NOT NULL DEFAULT 'Somos tu tienda de suplementos deportivos y bienestar en Florencio Varela, Zona Sur. Fórmulas de pureza certificada, asesoramiento cercano y envíos a toda la Argentina.',
    mp_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    mp_public_key VARCHAR(255) NOT NULL DEFAULT 'TEST-8f92a3b0-41d2-4e89-9a1b-vitalsur2026',
    transfer_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    transfer_discount_pct INTEGER NOT NULL DEFAULT 10,
    bank_alias VARCHAR(100) NOT NULL DEFAULT 'VITALSUR.VARELA.MP',
    bank_cbu VARCHAR(50) NOT NULL DEFAULT '0000003100084920192814',
    bank_holder VARCHAR(150) NOT NULL DEFAULT 'Vital Sur Nutrición S.R.L. - CUIT 30-71849201-9',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 3. TABLA: categories (Categorías y Subcategorías Anidadas)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(60) NOT NULL DEFAULT 'dumbbell',
    sort_order INTEGER NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    parent_id VARCHAR(80) REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);

-- ========================================================================
-- 4. TABLA: products (Catálogo de Suplementos Deportivos)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(80) PRIMARY KEY,
    sku VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    brand VARCHAR(120) NOT NULL DEFAULT 'Vital Sur Lab',
    category_id VARCHAR(80) NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    subcategory_id VARCHAR(80) REFERENCES public.categories(id) ON DELETE SET NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    usage_instructions TEXT NOT NULL,
    price INTEGER NOT NULL,
    sale_price INTEGER,
    cost INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    flavors JSONB NOT NULL DEFAULT '["Clásico"]'::jsonb,
    sizes JSONB NOT NULL DEFAULT '["Estándar"]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    illustration_type VARCHAR(60) NOT NULL DEFAULT 'jar',
    accent_color VARCHAR(30) NOT NULL DEFAULT '#2E9E6B',
    sold_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(active, featured);

-- ========================================================================
-- 5. TABLA: customers (Directorio de Clientes CRM)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(60),
    dni VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(30),
    total_spent BIGINT NOT NULL DEFAULT 0,
    orders_count INTEGER NOT NULL DEFAULT 0,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    last_order_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- ========================================================================
-- 6. TABLA: orders (Pedidos y Ventas con Envíos por Correo Argentino)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(80) PRIMARY KEY,
    order_number VARCHAR(60) NOT NULL UNIQUE,
    status VARCHAR(40) NOT NULL DEFAULT 'nuevo',
    payment_method VARCHAR(40) NOT NULL DEFAULT 'mercado_pago',
    payment_reference VARCHAR(120),
    subtotal INTEGER NOT NULL,
    discount INTEGER NOT NULL DEFAULT 0,
    coupon_code VARCHAR(60),
    shipping_cost INTEGER NOT NULL DEFAULT 8999,
    total INTEGER NOT NULL,
    estimated_cost INTEGER NOT NULL DEFAULT 0,
    tracking_number VARCHAR(100),
    internal_notes TEXT,
    customer_id VARCHAR(80) REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(60) NOT NULL,
    customer_dni VARCHAR(30) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(30) NOT NULL,
    shipping_notes TEXT,
    is_unread BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ========================================================================
-- 7. TABLA: order_items (Ítems de Cada Pedido)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id VARCHAR(80) PRIMARY KEY,
    order_id VARCHAR(80) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(80) REFERENCES public.products(id) ON DELETE SET NULL,
    sku VARCHAR(80) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    flavor VARCHAR(100) NOT NULL DEFAULT 'Clásico',
    size VARCHAR(100) NOT NULL DEFAULT 'Estándar',
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    unit_cost INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ========================================================================
-- 8. TABLA: stock_movements (Kardex e Historial de Inventario)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id VARCHAR(80) PRIMARY KEY,
    product_id VARCHAR(80) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(80) NOT NULL,
    type VARCHAR(50) NOT NULL, -- ENTRADA, SALIDA_VENTA, AJUSTE_MANUAL, DEVOLUCION
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT,
    created_by VARCHAR(100) NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON public.stock_movements(created_at DESC);

-- ========================================================================
-- 9. TABLA: coupons (Cupones y Promociones)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id VARCHAR(80) PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(30) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE | FIXED
    discount_value INTEGER NOT NULL,
    min_purchase INTEGER NOT NULL DEFAULT 0,
    max_uses INTEGER NOT NULL DEFAULT 100,
    used_count INTEGER NOT NULL DEFAULT 0,
    expires_at VARCHAR(40) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- ========================================================================
-- 10. TABLA: staff_users (Usuarios y Roles de Administración CRM)
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.staff_users (
    id VARCHAR(80) PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(40) NOT NULL DEFAULT 'COLLABORATOR', -- ADMIN | COLLABORATOR
    role_label VARCHAR(60) NOT NULL DEFAULT 'Colaborador',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 11. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE updated_at
-- ========================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER tr_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_categories_updated_at ON public.categories;
CREATE TRIGGER tr_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_customers_updated_at ON public.customers;
CREATE TRIGGER tr_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ========================================================================
-- 12. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ========================================================================
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para la tienda
CREATE POLICY "Public Read Store Settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Active Categories" ON public.categories FOR SELECT USING (active = true);
CREATE POLICY "Public Read Active Products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Public Read Active Coupons" ON public.coupons FOR SELECT USING (active = true);

-- Políticas de inserción pública en checkout
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Customers" ON public.customers FOR INSERT WITH CHECK (true);

-- Permisos totales para service_role (Panel Admin / API Server)
CREATE POLICY "Service Role Full Access Store Settings" ON public.store_settings USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service Role Full Access Categories" ON public.categories USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service Role Full Access Products" ON public.products USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service Role Full Access Customers" ON public.customers USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service Role Full Access Orders" ON public.orders USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service Role Full Access Order Items" ON public.order_items USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service Role Full Access Stock Movements" ON public.stock_movements USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service Role Full Access Coupons" ON public.coupons USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service Role Full Access Staff Users" ON public.staff_users USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ========================================================================
-- 13. SEED INICIAL: CONFIGURACIÓN Y CATEGORÍAS (CERO PRODUCTOS MOCK)
-- ========================================================================

-- Insertar configuración inicial de Vital Sur
INSERT INTO public.store_settings (
    id, store_name, tagline, address, phone, whatsapp_number, email, instagram, facebook,
    shipping_cost, free_shipping_threshold, shipping_carrier, promo_banner_text,
    hero_title, hero_subtitle, mp_enabled, transfer_enabled, transfer_discount_pct,
    bank_alias, bank_cbu, bank_holder
) VALUES (
    'default',
    'Vital Sur',
    'Suplementos deportivos y bienestar natural desde Florencio Varela',
    'Florencio Varela, Zona Sur, Provincia de Buenos Aires (Tienda Online)',
    '+54 9 11 3406-2942',
    '5491134062942',
    'hola@vitalsur.com.ar',
    '@vitalsur.suplementos',
    '/vitalsur.varela',
    8999,
    80000,
    'Correo Argentino',
    'Envíos a todo el país por Correo Argentino | Envío GRATIS en compras superiores a $80.000',
    'Nutrición honesta y energía real para potenciar cada entrenamiento',
    'Somos tu tienda de suplementos deportivos y bienestar en Florencio Varela, Zona Sur. Fórmulas de pureza certificada, asesoramiento cercano y envíos a toda la Argentina.',
    TRUE,
    TRUE,
    10,
    'VITALSUR.VARELA.MP',
    '0000003100084920192814',
    'Vital Sur Nutrición S.R.L. - CUIT 30-71849201-9'
) ON CONFLICT (id) DO NOTHING;

-- Insertar Categorías Base Oficiales de Vital Sur
INSERT INTO public.categories (id, name, slug, description, icon_name, sort_order, active, parent_id)
VALUES
('cat-proteinas', 'Proteínas', 'proteinas', 'Aislados y concentrados de alta biodisponibilidad para desarrollo y recuperación muscular.', 'dumbbell', 1, true, null),
('cat-creatinas', 'Creatinas y Fuerza', 'creatinas', 'Creatina monohidratada micronizada de máxima pureza para potencia y rendimiento explosivo.', 'zap', 2, true, null),
('cat-aminoacidos', 'Aminoácidos', 'aminoacidos', 'BCAA, EAA y L-Glutamina para proteger tus fibras musculares y acelerar la recuperación.', 'activity', 3, true, null),
('cat-pre-entreno', 'Pre-Entreno y Energía', 'pre-entreno', 'Fórmulas con beta-alanina, citrulina y cafeína natural para entrenar con foco total.', 'flame', 4, true, null),
('cat-vitaminas', 'Vitaminas y Bienestar', 'vitaminas-salud', 'Magnesio, Omega 3, colágeno hidrolizado y multivitamínicos para tu salud diaria.', 'shield-plus', 5, true, null),
('cat-quemadores', 'Definición y Metabolismo', 'quemadores', 'Termogénicos naturales con té verde, L-carnitina y guaraná para acompañar tu plan nutricional.', 'heart-pulse', 6, true, null),
('cat-accesorios', 'Accesorios y Combos', 'accesorios', 'Shakers libres de BPA, cintas de agarre y accesorios deportivos.', 'cup-soda', 7, true, null),
('subcat-whey', 'Whey Protein Concentrada e Isolada', 'whey-protein', 'Proteínas de suero lácteo de rápida absorción.', 'dumbbell', 1, true, 'cat-proteinas'),
('subcat-plant', 'Proteínas Vegetales', 'proteina-vegetal', 'Fórmulas a base de arveja y arroz orgánico aptas para veganos.', 'leaf', 2, true, 'cat-proteinas'),
('subcat-creatina-micro', 'Creatina Monohidrato 200 Mesh', 'creatina-micronizada', 'Disolución instantánea y pureza de laboratorio.', 'sparkles', 1, true, 'cat-creatinas')
ON CONFLICT (id) DO NOTHING;

-- Insertar Usuarios de Staff Iniciales
INSERT INTO public.staff_users (id, email, name, role, role_label)
VALUES
('staff-1', 'admin@vitalsur.com.ar', 'Martín Morales (Administrador)', 'ADMIN', 'Administrador General'),
('staff-2', 'colaborador@vitalsur.com.ar', 'Sofía Duarte (Atención y Despacho)', 'COLLABORATOR', 'Colaboradora de Depósito')
ON CONFLICT (id) DO NOTHING;

