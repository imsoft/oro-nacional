-- ============================================
-- DATOS SEED PARA BLOG - ORO NACIONAL
-- ============================================
-- Este script inserta posts de ejemplo para el blog
-- IMPORTANTE: Necesitas tener un usuario admin creado primero
-- Ejecuta este script DESPUÉS de seed-data.sql

-- ============================================
-- NOTA: Reemplaza 'TU-ADMIN-USER-ID' con el UUID real de tu usuario admin
-- ============================================
-- Para obtener tu admin user ID, ejecuta:
-- SELECT id, email FROM auth.users WHERE email = 'tu-email@admin.com';
-- ============================================

-- Variable para almacenar el author_id
-- REEMPLAZA ESTE UUID CON TU USER ID REAL
DO $$
DECLARE
  admin_user_id UUID := 'TU-ADMIN-USER-ID'; -- ⚠️ CAMBIAR ESTO
  guias_cat_id UUID;
  cuidado_cat_id UUID;
  tendencias_cat_id UUID;
  historia_cat_id UUID;
  eventos_cat_id UUID;
BEGIN

-- Obtener IDs de categorías
SELECT id INTO guias_cat_id FROM public.blog_categories WHERE slug = 'guias-de-compra';
SELECT id INTO cuidado_cat_id FROM public.blog_categories WHERE slug = 'cuidado-de-joyas';
SELECT id INTO tendencias_cat_id FROM public.blog_categories WHERE slug = 'tendencias';
SELECT id INTO historia_cat_id FROM public.blog_categories WHERE slug = 'historia-y-cultura';
SELECT id INTO eventos_cat_id FROM public.blog_categories WHERE slug = 'eventos-especiales';

-- ============================================
-- POST 1: Guía para elegir anillo de compromiso
-- ============================================
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category_id,
  author_id,
  status,
  published_at
) VALUES (
  'Cómo Elegir el Anillo de Compromiso Perfecto en 2025',
  'como-elegir-anillo-compromiso-perfecto-2025',
  'Descubre los 7 factores clave para seleccionar el anillo de compromiso ideal. Guía completa con consejos de expertos joyeros de Guadalajara.',
  E'# Cómo Elegir el Anillo de Compromiso Perfecto en 2025\n\nElegir un anillo de compromiso es una de las decisiones más importantes que tomarás. En Oro Nacional, con más de 30 años de experiencia, te compartimos nuestra guía definitiva.\n\n## 1. Conoce las 4 C del Diamante\n\n- **Corte (Cut)**: Determina el brillo del diamante\n- **Claridad (Clarity)**: Pureza de la piedra\n- **Color**: Los grados D-F son los más valiosos\n- **Quilates (Carat)**: El peso de la piedra\n\n## 2. Elige el Metal Correcto\n\nEn Oro Nacional trabajamos con:\n- Oro amarillo 14k y 18k: Clásico y duradero\n- Oro blanco 18k: Moderno y elegante\n- Oro rosa 14k: Romántico y en tendencia\n\n## 3. Conoce su Talla\n\nTip de experto: Pide prestado uno de sus anillos actuales o pregunta a una amiga cercana.\n\n## 4. Establece tu Presupuesto\n\nEn Oro Nacional ofrecemos opciones desde $15,000 hasta $100,000 MXN con planes de financiamiento.\n\n## 5. Considera su Estilo Personal\n\n- ¿Prefiere lo clásico o moderno?\n- ¿Usa joyería dorada o plateada?\n- ¿Le gustan los diseños minimalistas o elaborados?\n\n## 6. Certificación y Garantía\n\nTodos nuestros anillos incluyen:\n- Certificado de autenticidad\n- Garantía de por vida en manufactura\n- Grabado personalizado sin costo\n\n## Visítanos en Guadalajara\n\nNuestros maestros joyeros estarán encantados de asesorarte personalmente. Agenda tu cita hoy mismo.',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200',
  guias_cat_id,
  admin_user_id,
  'published',
  NOW() - INTERVAL '7 days'
);

-- ============================================
-- POST 2: Cuidado de joyería de oro
-- ============================================
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category_id,
  author_id,
  status,
  published_at
) VALUES (
  '5 Secretos para Mantener tu Joyería de Oro Como Nueva',
  '5-secretos-mantener-joyeria-oro-nueva',
  'Aprende cómo cuidar correctamente tus piezas de oro. Tips profesionales de nuestros expertos en Oro Nacional Guadalajara.',
  E'# 5 Secretos para Mantener tu Joyería de Oro Como Nueva\n\nTus joyas de oro son una inversión que puede durar generaciones si las cuidas adecuadamente. Aquí te compartimos nuestros secretos profesionales.\n\n## 1. Limpieza Regular en Casa\n\n### Método suave (semanal):\n1. Mezcla agua tibia con jabón neutro\n2. Sumerge la joyería por 15 minutos\n3. Usa un cepillo de dientes suave\n4. Enjuaga con agua limpia\n5. Seca con paño de microfibra\n\n⚠️ **Nunca uses**:\n- Cloro o blanqueadores\n- Pasta de dientes\n- Químicos abrasivos\n\n## 2. Almacenamiento Correcto\n\n- Guarda cada pieza por separado\n- Usa bolsas de tela o compartimentos individuales\n- Evita la humedad excesiva\n- Mantén alejado de perfumes y cosméticos\n\n## 3. Cuándo Quitarte las Joyas\n\nRetira tu joyería de oro antes de:\n- Hacer ejercicio o deportes\n- Nadar (el cloro daña el oro)\n- Aplicar cremas o perfumes\n- Limpiar con productos químicos\n- Dormir\n\n## 4. Mantenimiento Profesional\n\nVisita Oro Nacional cada 6 meses para:\n- Limpieza profesional ultrasónica\n- Revisión de monturas y cierres\n- Pulido y restauración\n- **¡Servicio gratuito para nuestros clientes!**\n\n## 5. Seguro para tus Joyas\n\nConsidera asegurar piezas valiosas. Te proporcionamos:\n- Certificado de autenticidad\n- Avalúo profesional\n- Registro fotográfico\n\n## Cuidados Especiales por Tipo de Joya\n\n### Anillos con diamantes:\n- Revisa la montura mensualmente\n- Evita golpes directos\n\n### Cadenas y collares:\n- Desenreda inmediatamente\n- Guarda colgado si es posible\n\n### Aretes:\n- Limpia los postes regularmente\n- Revisa los cierres\n\n¿Necesitas una limpieza profesional? Visítanos en Guadalajara.',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200',
  cuidado_cat_id,
  admin_user_id,
  'published',
  NOW() - INTERVAL '14 days'
);

-- ============================================
-- POST 3: Tendencias en joyería 2025
-- ============================================
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category_id,
  author_id,
  status,
  published_at
) VALUES (
  'Tendencias en Joyería 2025: Lo Que Está de Moda',
  'tendencias-joyeria-2025-moda',
  'Descubre las tendencias más hot en joyería para 2025. Desde capas de collares hasta el regreso del oro amarillo.',
  E'# Tendencias en Joyería 2025: Lo Que Está de Moda\n\nLa joyería en 2025 es una mezcla perfecta entre tradición y modernidad. En Oro Nacional te mostramos qué está en tendencia.\n\n## 1. El Regreso Triunfal del Oro Amarillo\n\nDespués de años de dominio del oro blanco, el oro amarillo vuelve con fuerza:\n- Cadenas gruesas estilo Cuban link\n- Aretes de aro XXL\n- Anillos statement chunky\n\n## 2. Layering: El Arte de las Capas\n\n### Collares en capas:\n- Combina 3-4 cadenas de diferentes longitudes\n- Mezcla oro amarillo con oro rosa\n- Añade un dije especial como punto focal\n\n### Anillos apilables:\n- 3-5 anillos delgados en un dedo\n- Combina lisos con texturados\n- Juega con diferentes tonos de oro\n\n## 3. Joyería Sustentable\n\nLa consciencia ambiental llega a la joyería:\n- Oro reciclado certificado\n- Diamantes de laboratorio\n- Procesos artesanales tradicionales\n\n*En Oro Nacional trabajamos con oro reciclado y apoyamos la minería responsable.*\n\n## 4. Personalización Extrema\n\n- Grabados con coordenadas especiales\n- Cadenas con nombre en diseños modernos\n- Anillos con huellas digitales\n- Combinación de piedras de nacimiento\n\n## 5. El Poder del Oro Rosa\n\nEl oro rosa sigue siendo el favorito:\n- Anillos de compromiso en oro rosa\n- Combinaciones bicolor (rosa + blanco)\n- Acabados mate y pulido\n\n## 6. Diseños Inspirados en la Naturaleza\n\n- Hojas y flores estilizadas\n- Formas orgánicas asimétricas\n- Texturas que imitan piedras naturales\n\n## 7. Joyería Unisex\n\nLa moda sin género llega a las joyas:\n- Cadenas gruesas para todos\n- Anillos signet personalizados\n- Aretes de aro para hombres\n\n## Nuestra Colección 2025\n\nEn Oro Nacional ya tenemos disponible:\n- ✨ Colección Primavera: Diseños florales\n- 🌙 Línea Luna: Joyería celestial\n- 💫 Serie Artesanal: Técnicas jaliscienses modernas\n\n**Visítanos en Guadalajara para ver la colección completa**',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200',
  tendencias_cat_id,
  admin_user_id,
  'published',
  NOW() - INTERVAL '3 days'
);

-- ============================================
-- POST 4: Historia de la joyería jalisciense
-- ============================================
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category_id,
  author_id,
  status,
  published_at
) VALUES (
  'La Tradición Joyera de Jalisco: 100 Años de Historia',
  'tradicion-joyera-jalisco-100-anos-historia',
  'Conoce la rica historia de la joyería artesanal en Guadalajara. Desde sus orígenes hasta Oro Nacional.',
  E'# La Tradición Joyera de Jalisco: 100 Años de Historia\n\nGuadalajara es reconocida como uno de los centros joyeros más importantes de México. Descubre por qué.\n\n## Los Inicios: Siglo XIX\n\nLa tradición joyera en Jalisco comenzó con maestros artesanos que:\n- Trabajaban el oro con técnicas españolas\n- Creaban piezas únicas para familias adineradas\n- Transmitían el conocimiento de generación en generación\n\n## La Época Dorada: 1920-1960\n\nGuadalajara se consolida como centro joyero:\n- Surgen los primeros talleres especializados\n- Se desarrollan técnicas únicas jaliscienses\n- Nace la famosa "esclava tapatía"\n\n## La Esclava: Símbolo de Jalisco\n\nLa esclava es más que una joya:\n- Representa compromiso y unión\n- Diseño exclusivo de la región\n- Técnica artesanal única\n- Cada pieza es única\n\n### Características de una esclava auténtica:\n1. Oro de 14k o 18k\n2. Peso significativo (15-30 gramos)\n3. Cierre de seguridad robusto\n4. Grabado personalizado\n\n## Oro Nacional: 30 Años de Tradición\n\nNuestra historia comienza en 1990:\n- Fundada por maestros joyeros de Guadalajara\n- Compromiso con la artesanía tradicional\n- Incorporación de diseños modernos\n- Más de 10,000 clientes satisfechos\n\n## Técnicas Artesanales que Preservamos\n\n### 1. Filigrana\nTrabajo delicado con hilos de oro\n\n### 2. Repujado\nRelieve en láminas de oro\n\n### 3. Engaste\nMontaje de piedras preciosas\n\n### 4. Soldadura\nUnión invisible de piezas\n\n## El Futuro de la Joyería Jalisciense\n\nEn Oro Nacional combinamos:\n- ✓ Técnicas tradicionales de 100 años\n- ✓ Diseños contemporáneos\n- ✓ Tecnología de vanguardia\n- ✓ Compromiso con la calidad\n\n**Ven a conocer nuestra historia en persona**',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1200',
  historia_cat_id,
  admin_user_id,
  'published',
  NOW() - INTERVAL '21 days'
);

-- ============================================
-- POST 5: Guía para bodas
-- ============================================
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category_id,
  author_id,
  status,
  published_at
) VALUES (
  'Guía Completa: Joyería para Tu Boda en Guadalajara',
  'guia-completa-joyeria-boda-guadalajara',
  'Todo lo que necesitas saber sobre argollas de matrimonio, aretes para novia y joyería para el gran día.',
  E'# Guía Completa: Joyería para Tu Boda en Guadalajara\n\n¿Te vas a casar? ¡Felicidades! Aquí está tu guía completa para la joyería de tu boda.\n\n## Timeline: Cuándo Comprar Qué\n\n### 6 meses antes:\n- ✓ Anillo de compromiso (si aún no lo tienen)\n- ✓ Comenzar a ver diseños de argollas\n\n### 3 meses antes:\n- ✓ Ordenar las argollas de matrimonio\n- ✓ Seleccionar aretes de la novia\n- ✓ Joyería para las damas de honor\n\n### 1 mes antes:\n- ✓ Recoger y probar las argollas\n- ✓ Confirmar grabados\n- ✓ Limpieza profesional del anillo de compromiso\n\n## Las Argollas de Matrimonio\n\n### Para Ella:\n\nOpciones populares:\n1. **Lisa tradicional**: 3-4mm, oro amarillo 14k\n2. **Con diamantes**: Baño de pequeños diamantes\n3. **A juego con el compromiso**: Mismo metal y diseño\n\n### Para Él:\n\nTendencias actuales:\n1. **Lisa pulida**: 5-6mm, acabado brillante\n2. **Mate moderna**: Acabado cepillado\n3. **Dos tonos**: Combinación oro blanco/amarillo\n\n### Consejos de Experto:\n- Compren las dos argollas juntas (descuento especial)\n- Consideren el ancho: ella 3-4mm, él 5-6mm\n- El grabado es GRATIS en Oro Nacional\n- Prueben el confort: bordes redondeados\n\n## Joyería para la Novia\n\n### Aretes:\n- **Ceremonia religiosa**: Discretos, máximo 3cm\n- **Ceremonia civil**: Pueden ser más largos\n- **Recepción**: ¡Todo se vale!\n\n### Collar:\nRegla de oro:\n- Vestido con escote: collar corto o gargantilla\n- Vestido strapless: collar más largo o nada\n- Vestido con cuello alto: solo aretes\n\n### Pulsera/Esclava:\nPerfecto para:\n- Vestidos sin mangas\n- Complementar el conjunto\n- Algo prestado/algo nuevo\n\n## Joyería para el Novio\n\n- Argolla de matrimonio\n- Mancuernillas (opcionales)\n- Reloj especial\n- Prendedor de solapa (opcional)\n\n## Joyería para las Madrinas\n\nOpciones de regalo:\n1. **Aretes a juego**: Mismo diseño en diferente color\n2. **Pulseras personalizadas**: Con inicial grabada\n3. **Collares delicados**: Que puedan usar después\n\n## Presupuesto Sugerido (MXN)\n\n- Argollas pareja: $15,000 - $30,000\n- Aretes novia: $8,000 - $20,000\n- Collar novia: $10,000 - $25,000\n- Regalos madrinas (c/u): $3,000 - $8,000\n\n## Paquetes Especiales Oro Nacional\n\n### Paquete Básico ($35,000):\n- 2 Argollas oro 14k\n- Aretes novia\n- Limpieza anillo compromiso\n\n### Paquete Premium ($60,000):\n- 2 Argollas oro 18k con diamantes\n- Aretes y collar novia\n- 3 regalos damas de honor\n- Estuche especial\n\n## Servicios Incluidos\n\n✨ Grabado personalizado GRATIS\n✨ Ajuste de talla sin costo (primer año)\n✨ Limpieza profesional de por vida\n✨ Garantía de manufactura vitalicia\n\n**Agenda tu cita en Guadalajara: (33) 1234-5678**',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200',
  eventos_cat_id,
  admin_user_id,
  'published',
  NOW() - INTERVAL '30 days'
);

END $$;

-- ============================================
-- TAGS DE EJEMPLO
-- ============================================
INSERT INTO public.blog_tags (name, slug) VALUES
  ('Anillos de Compromiso', 'anillos-compromiso'),
  ('Bodas', 'bodas'),
  ('Cuidado', 'cuidado'),
  ('Oro Amarillo', 'oro-amarillo'),
  ('Oro Rosa', 'oro-rosa'),
  ('Oro Blanco', 'oro-blanco'),
  ('Diamantes', 'diamantes'),
  ('Tendencias 2025', 'tendencias-2025'),
  ('Jalisco', 'jalisco'),
  ('Artesanía', 'artesania')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
--
-- 1. DEBES reemplazar 'TU-ADMIN-USER-ID' con tu UUID real de usuario admin
--
-- 2. Para obtener tu admin user ID:
--    SELECT id, email FROM auth.users WHERE email = 'tu-email@admin.com';
--
-- 3. Para relacionar tags con posts, usa la tabla blog_post_tags:
--    INSERT INTO public.blog_post_tags (post_id, tag_id)
--    VALUES ('uuid-del-post', 'uuid-del-tag');
--
-- 4. Las imágenes featured_image usan URLs de Unsplash como placeholder
--    Reemplázalas con URLs de tu bucket de Supabase
--
-- 5. El contenido usa formato Markdown (E'...')
--
-- ============================================
