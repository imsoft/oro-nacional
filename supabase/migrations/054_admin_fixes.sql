-- Migration: Admin fixes
-- Description:
--   - subcategory_broquel_pricing.carats era INTEGER, por lo que kilatajes con decimales
--     (ej. 14.5) fallaban al guardar desde la calculadora de Broquel. Se cambia a NUMERIC(5,2).
-- Version: 054
-- Notes: Idempotente; se puede ejecutar varias veces sin efecto adicional.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subcategory_broquel_pricing'
      AND column_name = 'carats'
      AND data_type <> 'numeric'
  ) THEN
    ALTER TABLE public.subcategory_broquel_pricing
      ALTER COLUMN carats TYPE NUMERIC(5, 2) USING carats::NUMERIC(5, 2);
  END IF;
END $$;

COMMENT ON COLUMN public.subcategory_broquel_pricing.carats IS 'Kilataje (admite decimales, ej. 14.5)';
