-- =============================================
-- Sistema de Pedidos/Órdenes
-- =============================================

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Información del cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  -- Dirección de envío
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'México',

  -- Información del pedido
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,

  -- Estado del pedido
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Tarjeta', 'Transferencia', 'Efectivo')),
  payment_status TEXT DEFAULT 'Pendiente' CHECK (payment_status IN ('Pendiente', 'Pagado', 'Fallido', 'Reembolsado')),

  -- Notas
  customer_notes TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de items del pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Información del producto (snapshot en el momento del pedido)
  product_name TEXT NOT NULL,
  product_slug TEXT,
  product_sku TEXT,
  product_image TEXT,

  -- Detalles del item
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  size TEXT,
  material TEXT,

  -- Subtotal del item
  subtotal DECIMAL(10, 2) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para orders
-- Los usuarios pueden ver sus propios pedidos
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR deleted_at IS NULL);

-- Los usuarios autenticados pueden crear pedidos
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo admins pueden actualizar pedidos (esto se manejará en el backend)
CREATE POLICY "Service role can update orders"
  ON orders FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role' OR auth.uid() = user_id);

-- Solo admins pueden eliminar (soft delete)
CREATE POLICY "Service role can delete orders"
  ON orders FOR DELETE
  USING (auth.jwt()->>'role' = 'service_role');

-- Políticas para order_items
-- Los usuarios pueden ver items de sus propios pedidos
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.deleted_at IS NULL)
    )
  );

-- Los usuarios pueden insertar items en sus pedidos
CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Función para generar número de pedido único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_number BOOLEAN;
BEGIN
  LOOP
    -- Generar número de pedido: ORO-YYYYMMDD-XXXX
    new_number := 'ORO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Verificar si ya existe
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO exists_number;

    -- Si no existe, salir del loop
    EXIT WHEN NOT exists_number;
  END LOOP;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE orders IS 'Tabla de pedidos/órdenes de compra';
COMMENT ON TABLE order_items IS 'Tabla de items/productos dentro de cada pedido';
COMMENT ON COLUMN orders.order_number IS 'Número único de pedido generado automáticamente';
COMMENT ON COLUMN orders.status IS 'Estado del pedido: Pendiente, Procesando, Enviado, Entregado, Cancelado';
COMMENT ON COLUMN orders.payment_status IS 'Estado del pago: Pendiente, Pagado, Fallido, Reembolsado';
