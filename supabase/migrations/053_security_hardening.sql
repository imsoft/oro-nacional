-- Migration: Security hardening
-- Description:
--   - Helper is_store_admin() y protección del campo profiles.role
--   - Pedidos: solo el dueño o un admin pueden leerlos; solo admins (o el
--     servidor con service role) pueden crearlos/modificarlos
--   - Columnas de moneda cobrada en orders / order_items
--   - Funciones SECURITY DEFINER de administración ahora validan que quien
--     llama sea admin
--   - Tablas del panel (configuración, categorías, precios, hero) solo
--     escribibles por admins
--   - Políticas de storage válidas para product-images, blog-images y hero-images
-- Version: 053
--
-- Es idempotente: se puede ejecutar más de una vez.
-- IMPORTANTE: después de aplicarla, la creación de pedidos y el webhook de
-- Stripe deben usar SUPABASE_SERVICE_ROLE_KEY en el servidor.

-- ============================================
-- 1. Helper: is_store_admin()
-- ============================================
-- La base de datos ya tiene una función is_admin(...) con argumentos por
-- defecto creada fuera de estas migraciones; crear otra is_admin() sin
-- argumentos las vuelve ambiguas (error 42725). Por eso este helper tiene
-- nombre propio.

-- Si un intento anterior de esta migración dejó una is_admin() sin argumentos
-- junto a la original, eliminarla para que la original no quede ambigua.
DO $$
BEGIN
  IF to_regprocedure('public.is_admin()') IS NOT NULL
     AND (
       SELECT COUNT(*) FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'public' AND p.proname = 'is_admin'
     ) > 1 THEN
    BEGIN
      DROP FUNCTION public.is_admin();
    EXCEPTION WHEN dependent_objects_still_exist THEN
      RAISE NOTICE 'is_admin() está en uso; se conserva';
    END;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_store_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_store_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_store_admin() TO anon, authenticated, service_role;

-- ============================================
-- 2. Proteger profiles.role contra auto-escalamiento
-- ============================================
-- Solo un admin, el service role o una sesión directa de base de datos
-- (SQL editor / migraciones) pueden asignar o cambiar el rol.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_privileged BOOLEAN;
BEGIN
  is_privileged :=
    session_user IN ('postgres', 'supabase_admin')
    OR COALESCE(auth.role(), '') = 'service_role'
    OR public.is_store_admin();

  IF TG_OP = 'INSERT' THEN
    IF NOT is_privileged AND NEW.role IS DISTINCT FROM 'user' THEN
      NEW.role := 'user';
    END IF;
  ELSIF NEW.role IS DISTINCT FROM OLD.role AND NOT is_privileged THEN
    RAISE EXCEPTION 'No autorizado para cambiar el rol' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role_trigger ON public.profiles;
CREATE TRIGGER protect_profile_role_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- ============================================
-- 3. Pedidos: columnas de moneda cobrada
-- ============================================
-- subtotal/total/unit_price siguen en MXN (fuente de verdad para el admin).
-- currency + total_charged + unit_price_charged guardan lo que se cobró al cliente.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'MXN',
  ADD COLUMN IF NOT EXISTS total_charged NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 4),
  ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_currency_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_currency_check CHECK (currency IN ('MXN', 'USD'));
  END IF;
END $$;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS unit_price_charged NUMERIC(10, 2);

-- ============================================
-- 4. Pedidos: políticas RLS
-- ============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Owners and admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

-- El cliente ve sus pedidos; el admin ve todos.
CREATE POLICY "Owners and admins can view orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_store_admin());

-- Los pedidos se crean desde el servidor (service role, que omite RLS):
-- no hay política de INSERT para clientes.

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Owners and admins can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;

CREATE POLICY "Owners and admins can view order items"
  ON public.order_items FOR SELECT
  USING (
    public.is_store_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- generate_order_number solo se usa desde el servidor
REVOKE ALL ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO service_role;

-- ============================================
-- 5. Funciones de gestión de usuarios (solo admin)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_count INTEGER;
  total_spent DECIMAL(10, 2);
  last_order_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Cada usuario puede ver sus propias estadísticas; el admin, las de todos
  IF NOT (public.is_store_admin() OR auth.uid() = user_uuid) THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;

  SELECT
    COUNT(*),
    COALESCE(SUM(total), 0),
    MAX(created_at)
  INTO order_count, total_spent, last_order_date
  FROM orders
  WHERE user_id = user_uuid
    AND status != 'Cancelado';

  RETURN json_build_object(
    'order_count', order_count,
    'total_spent', total_spent,
    'last_order_date', last_order_date
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_users_with_stats()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  order_count BIGINT,
  total_spent DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_store_admin() THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.phone,
    p.created_at,
    COALESCE(COUNT(o.id), 0) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent
  FROM profiles p
  LEFT JOIN orders o ON p.id = o.user_id AND o.status != 'Cancelado'
  GROUP BY p.id, p.email, p.full_name, p.role, p.phone, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_role(
  user_uuid UUID,
  new_role TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_user profiles%ROWTYPE;
BEGIN
  IF NOT public.is_store_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No autorizado'
    );
  END IF;

  -- Validate role
  IF new_role NOT IN ('user', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be "user" or "admin"'
    );
  END IF;

  -- Un admin no puede quitarse el rol a sí mismo (evita dejar la tienda sin admin)
  IF user_uuid = auth.uid() AND new_role <> 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No puedes quitarte el rol de administrador a ti mismo'
    );
  END IF;

  UPDATE profiles
  SET role = new_role::TEXT,
      updated_at = NOW()
  WHERE id = user_uuid
  RETURNING * INTO updated_user;

  IF updated_user.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'user', row_to_json(updated_user)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_count_by_role()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_users INTEGER;
  admin_count INTEGER;
  user_count INTEGER;
BEGIN
  IF NOT public.is_store_admin() THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  SELECT COUNT(*) INTO user_count FROM profiles WHERE role = 'user';

  RETURN json_build_object(
    'total_users', total_users,
    'admin_count', admin_count,
    'user_count', user_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_stats(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_users_with_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_user_role(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_count_by_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_count_by_role() TO authenticated;

-- ============================================
-- 6. Estadísticas del dashboard (solo admin)
-- ============================================
-- Se conserva el cuerpo original renombrándolo a <nombre>__impl y se expone
-- un envoltorio con el nombre original que valida al admin.
DO $$
DECLARE
  fn TEXT;
BEGIN
  FOREACH fn IN ARRAY ARRAY['get_sales_stats', 'get_orders_stats', 'get_products_stats']
  LOOP
    IF to_regprocedure('public.' || fn || '__impl()') IS NULL
       AND to_regprocedure('public.' || fn || '()') IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION public.%I() RENAME TO %I', fn, fn || '__impl');
    END IF;

    IF to_regprocedure('public.' || fn || '__impl()') IS NOT NULL THEN
      EXECUTE format(
        'REVOKE ALL ON FUNCTION public.%I() FROM PUBLIC, anon, authenticated',
        fn || '__impl'
      );
      EXECUTE format(
        $f$
        CREATE OR REPLACE FUNCTION public.%I()
        RETURNS JSON
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $w$
        BEGIN
          IF NOT public.is_store_admin() THEN
            RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
          END IF;
          RETURN public.%I();
        END;
        $w$
        $f$,
        fn, fn || '__impl'
      );
      EXECUTE format('REVOKE ALL ON FUNCTION public.%I() FROM PUBLIC, anon', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I() TO authenticated', fn);
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 7. Configuración del sitio (site_settings / store_settings)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_all_settings()
RETURNS TABLE (
  id UUID,
  setting_key TEXT,
  setting_value TEXT,
  setting_type TEXT,
  description TEXT,
  is_public BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_store_admin() THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.setting_key,
    s.setting_value,
    s.setting_type,
    s.description,
    s.is_public
  FROM site_settings s
  ORDER BY s.setting_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_setting(
  key TEXT,
  value TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_setting site_settings%ROWTYPE;
BEGIN
  IF NOT public.is_store_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No autorizado'
    );
  END IF;

  UPDATE site_settings
  SET setting_value = value
  WHERE setting_key = key
  RETURNING * INTO updated_setting;

  IF updated_setting.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Setting not found'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'setting', row_to_json(updated_setting)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_settings(settings JSON)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  setting_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  IF NOT public.is_store_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No autorizado'
    );
  END IF;

  FOR setting_record IN SELECT * FROM json_each_text(settings)
  LOOP
    UPDATE site_settings
    SET setting_value = setting_record.value
    WHERE setting_key = setting_record.key;

    IF FOUND THEN
      updated_count := updated_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'updated_count', updated_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_all_settings() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_setting(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_settings(JSON) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_all_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_setting(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_settings(JSON) TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can read all settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can read all settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;

CREATE POLICY "Admins can read all settings"
  ON public.site_settings FOR SELECT
  USING (public.is_store_admin());

CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Authenticated users can update store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;

CREATE POLICY "Admins can manage store settings"
  ON public.store_settings FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- ============================================
-- 8. Categorías destacadas
-- ============================================
CREATE OR REPLACE FUNCTION public.update_category_featured(
  category_id UUID,
  featured BOOLEAN,
  category_image_url TEXT DEFAULT NULL,
  category_display_order INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_category product_categories%ROWTYPE;
BEGIN
  IF NOT public.is_store_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No autorizado'
    );
  END IF;

  UPDATE product_categories
  SET
    is_featured = featured,
    image_url = COALESCE(category_image_url, image_url),
    display_order = COALESCE(category_display_order, display_order)
  WHERE id = category_id
  RETURNING * INTO updated_category;

  IF updated_category.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Category not found'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'category', row_to_json(updated_category)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_category_featured(UUID, BOOLEAN, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_category_featured(UUID, BOOLEAN, TEXT, INTEGER) TO authenticated;

-- Tabla "categories" (legado de la migración 008); puede no existir tras la 011
DO $$
BEGIN
  IF to_regclass('public.categories') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
    DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
    DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;
    DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
    CREATE POLICY "Admins can manage categories"
      ON public.categories FOR ALL
      USING (public.is_store_admin())
      WITH CHECK (public.is_store_admin());
  END IF;
END $$;

-- ============================================
-- 9. Categorías internas y precios por subcategoría
-- ============================================
-- Las políticas de lectura existentes se conservan; solo cambia la escritura.
DROP POLICY IF EXISTS "Authenticated users can insert internal categories" ON public.internal_categories;
DROP POLICY IF EXISTS "Authenticated users can update internal categories" ON public.internal_categories;
DROP POLICY IF EXISTS "Authenticated users can delete internal categories" ON public.internal_categories;
DROP POLICY IF EXISTS "Admins can manage internal categories" ON public.internal_categories;
CREATE POLICY "Admins can manage internal categories"
  ON public.internal_categories FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Authenticated users can insert internal subcategories" ON public.internal_subcategories;
DROP POLICY IF EXISTS "Authenticated users can update internal subcategories" ON public.internal_subcategories;
DROP POLICY IF EXISTS "Authenticated users can delete internal subcategories" ON public.internal_subcategories;
DROP POLICY IF EXISTS "Admins can manage internal subcategories" ON public.internal_subcategories;
CREATE POLICY "Admins can manage internal subcategories"
  ON public.internal_subcategories FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Authenticated users can insert product-internal categories" ON public.product_internal_categories;
DROP POLICY IF EXISTS "Authenticated users can delete product-internal categories" ON public.product_internal_categories;
DROP POLICY IF EXISTS "Admins can manage product-internal categories" ON public.product_internal_categories;
CREATE POLICY "Admins can manage product-internal categories"
  ON public.product_internal_categories FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Authenticated users can manage subcategory pricing" ON public.subcategory_pricing;
DROP POLICY IF EXISTS "Admins can manage subcategory pricing" ON public.subcategory_pricing;
CREATE POLICY "Admins can manage subcategory pricing"
  ON public.subcategory_pricing FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "Authenticated users can manage subcategory broquel pricing" ON public.subcategory_broquel_pricing;
DROP POLICY IF EXISTS "Admins can manage subcategory broquel pricing" ON public.subcategory_broquel_pricing;
CREATE POLICY "Admins can manage subcategory broquel pricing"
  ON public.subcategory_broquel_pricing FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- ============================================
-- 10. Imágenes del hero
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view all hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Authenticated users can insert hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Authenticated users can update hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Authenticated users can delete hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Admins can manage hero images" ON public.hero_images;

-- "Hero images are viewable by everyone" (lectura pública de activas) se conserva.
CREATE POLICY "Admins can manage hero images"
  ON public.hero_images FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- ============================================
-- 11. Blog: los borradores solo los ve el admin
-- ============================================
DROP POLICY IF EXISTS "Cualquiera puede ver posts publicados" ON public.blog_posts;
CREATE POLICY "Cualquiera puede ver posts publicados" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR public.is_store_admin());

-- ============================================
-- 11b. Mensajes de contacto: marca de notificación enviada
-- ============================================
-- /api/email/contact la usa para enviar los correos una sola vez por mensaje.
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP WITH TIME ZONE;

-- Los mensajes anteriores ya fueron atendidos: no deben poder re-notificarse
UPDATE public.contact_messages
SET notified_at = created_at
WHERE notified_at IS NULL;

-- ============================================
-- 12. Storage: lectura pública, escritura solo admin
-- ============================================
-- Las migraciones 021/022 usaban "CREATE POLICY IF NOT EXISTS", que no es
-- sintaxis válida en Postgres; aquí se recrean correctamente.
DO $$
DECLARE
  bucket TEXT;
BEGIN
  FOREACH bucket IN ARRAY ARRAY['product-images', 'blog-images', 'hero-images']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', bucket || ' public read');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', bucket || ' admin insert');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', bucket || ' admin update');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', bucket || ' admin delete');

    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L)',
      bucket || ' public read', bucket
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR INSERT WITH CHECK (bucket_id = %L AND public.is_store_admin())',
      bucket || ' admin insert', bucket
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR UPDATE USING (bucket_id = %L AND public.is_store_admin())',
      bucket || ' admin update', bucket
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR DELETE USING (bucket_id = %L AND public.is_store_admin())',
      bucket || ' admin delete', bucket
    );
  END LOOP;
END $$;

-- Políticas antiguas del bucket hero-images que permitían escribir a cualquier
-- usuario con sesión (docs/INSTRUCCIONES_HERO_IMAGES.md)
DROP POLICY IF EXISTS "Authenticated users can upload hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete hero images" ON storage.objects;

-- ============================================
-- 13. Diagnóstico (ejecutar aparte)
-- ============================================
-- Las tablas profiles, products, product_categories, product_images,
-- product_sizes y product_specifications se crearon fuera de estas
-- migraciones, así que sus políticas no se tocan aquí. Esta consulta lista
-- las políticas que dejan escribir a cualquier usuario; no debería devolver
-- filas de esas tablas:
--
-- SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname IN ('public', 'storage')
--   AND cmd <> 'SELECT'
--   AND (
--     (cmd = 'INSERT' AND with_check IN ('true', '(auth.role() = ''authenticated''::text)'))
--     OR (cmd <> 'INSERT' AND qual IN ('true', '(auth.role() = ''authenticated''::text)'))
--   )
-- ORDER BY tablename, policyname;
