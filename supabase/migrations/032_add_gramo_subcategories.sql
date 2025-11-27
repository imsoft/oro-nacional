-- Migration: Add subcategories to "Gramo" internal category
-- Description: Insert predefined subcategories for the "Gramo" internal category

-- Insert subcategories for "Gramo" category (ID: a5f2deef-9c62-4899-bc34-216c7b219895)
INSERT INTO internal_subcategories (
  internal_category_id,
  name,
  description,
  is_active,
  display_order
) VALUES
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'ANILLO VACIADO 10 KILATES', 'Anillo vaciado de 10 kilates', true, 1),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'ARGOLLAS CONFORT 10 KILATES', 'Argollas confort de 10 kilates', true, 2),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'CADENA AMARILLA 10 KILATES', 'Cadena amarilla de 10 kilates', true, 3),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'CADENA HECHA A MANO/ HUECA NACIONAL 10 K', 'Cadena hecha a mano/hueca nacional de 10 kilates', true, 4),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'CADENA RODIO/FLORENTINA 10 KILATES', 'Cadena rodio/florentina de 10 kilates', true, 5),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'DIJE 10 KILATES', 'Dije de 10 kilates', true, 6),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'DIJE VACIADO 10 KILATES', 'Dije vaciado de 10 kilates', true, 7),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'HUGGIE CP/ARRACADA CP 10 KILATES', 'Huggie CP/Arracada CP de 10 kilates', true, 8),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'HUGGIE/ARRACADA VACIADA 10 KILATES', 'Huggie/Arracada vaciada de 10 kilates', true, 9),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'MEDALLA CP 10 KILATES', 'Medalla CP de 10 kilates', true, 10),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'MEDALLA SP/VACIADA 10 KILATES', 'Medalla SP/Vaciada de 10 kilates', true, 11),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'ESCLAVA/PULSO HECHO A MANO 10 KILATES', 'Esclava/Pulso hecho a mano de 10 kilates', true, 12),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'ESCLAVA/PULSO HUECO 10 KILATES', 'Esclava/Pulso hueco de 10 kilates', true, 13),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'ESCLAVA/PULSO NACIONAL 10 KILATES', 'Esclava/Pulso nacional de 10 kilates', true, 14),
  ('a5f2deef-9c62-4899-bc34-216c7b219895', 'SEMANARIO 10 KILATES', 'Semanario de 10 kilates', true, 15)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE internal_subcategories IS 'Subcategorías internas agregadas para la categoría "Gramo" con productos de 10 kilates';

