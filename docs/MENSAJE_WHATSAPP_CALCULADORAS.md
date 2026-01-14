# Mensaje de WhatsApp - Explicación de Calculadoras

---

Hola [Nombre del cliente] 👋

Te explico paso a paso cómo funcionan las calculadoras de precios en el sistema:

## 📊 CALCULADORA DE GRAMOS

Esta calculadora se usa para productos que se calculan por gramos de oro.

**Parámetros globales (se configuran una vez):**
• Cotización del oro (MXN por gramo)
• Margen de utilidad (%)
• IVA (16%)
• Comisión Stripe (3.6% + $3 MXN fijo)

**Parámetros por subcategoría:**
• Gramos de oro
• Factor
• Mano de obra (por gramo)
• Costo de piedra (por gramo)
• Comisión de venta (por gramo)
• Costo de envío

**Fórmula paso a paso:**

1️⃣ **Costo del oro:**
   Cotización × Gramos × Factor

2️⃣ **Costo de materiales:**
   Gramos × (Mano de obra + Costo de piedra)

3️⃣ **Subtotal antes de utilidad:**
   Costo del oro + Costo de materiales

4️⃣ **Subtotal con utilidad:**
   Subtotal anterior × (1 + Margen de utilidad)

5️⃣ **Comisión de venta:**
   Gramos × Comisión de venta

6️⃣ **Subtotal con comisiones:**
   Subtotal con utilidad + Comisión de venta + Costo de envío

7️⃣ **Subtotal con IVA:**
   Subtotal con comisiones × (1 + IVA)

8️⃣ **Precio final:**
   (Subtotal con IVA × 1.036) + $3 MXN
   (Incluye comisión Stripe 3.6% + $3 fijo)

---

## 💎 CALCULADORA DE BROQUEL

Esta calculadora se usa para productos tipo broquel (por piezas).

**Parámetros globales:**
• Cotización del oro (MXN por gramo)
• Margen de utilidad (%)
• IVA (16%)
• Comisión Stripe (3.6% + $3 MXN fijo)

**Parámetros por subcategoría:**
• Piezas (PZ)
• Gramos de oro por pieza
• Kilataje (10k, 14k, 18k, etc.)
• Merma (%)
• Mano de obra
• Costo de piedra
• Comisión de venta (por pieza)
• Costo de envío

**Fórmula paso a paso:**

1️⃣ **Costo del oro por pieza:**
   Cotización × (Kilataje ÷ 24) × Gramos de oro

2️⃣ **Costo del oro con merma:**
   Costo del oro × (1 + Merma%)

3️⃣ **Subtotal antes de utilidad (por pieza):**
   Costo del oro con merma + Mano de obra + Costo de piedra

4️⃣ **Subtotal por todas las piezas:**
   Subtotal anterior × Número de piezas (PZ)

5️⃣ **Subtotal con utilidad:**
   Subtotal por piezas × (1 + Margen de utilidad)

6️⃣ **Comisión de venta:**
   Número de piezas × Comisión de venta

7️⃣ **Subtotal con comisión:**
   Subtotal con utilidad + Comisión de venta

8️⃣ **Subtotal con envío:**
   Subtotal con comisión + Costo de envío

9️⃣ **Subtotal con IVA:**
   Subtotal con envío × (1 + IVA)

🔟 **Precio final:**
   (Subtotal con IVA × 1.036) + $3 MXN
   (Incluye comisión Stripe 3.6% + $3 fijo)

---

## 📝 EJEMPLO PRÁCTICO - CALCULADORA DE GRAMOS

**Parámetros:**
• Cotización: $2,650 MXN/gr
• Utilidad: 30%
• IVA: 16%
• Gramos: 5 gr
• Factor: 0.442
• Mano obra: $15/gr
• Piedra: $0
• Comisión venta: $30/gr
• Envío: $800

**Cálculo:**
1. Costo oro = $2,650 × 5 × 0.442 = $5,851.50
2. Costo materiales = 5 × ($15 + $0) = $75
3. Subtotal = $5,851.50 + $75 = $5,926.50
4. Con utilidad = $5,926.50 × 1.30 = $7,704.45
5. Comisión = 5 × $30 = $150
6. Con comisiones = $7,704.45 + $150 + $800 = $8,654.45
7. Con IVA = $8,654.45 × 1.16 = $10,039.16
8. **Precio final = ($10,039.16 × 1.036) + $3 = $10,403.57**

---

## 📝 EJEMPLO PRÁCTICO - CALCULADORA DE BROQUEL

**Parámetros:**
• Cotización: $2,650 MXN/gr
• Utilidad: 8%
• IVA: 16%
• Piezas: 2
• Gramos/pieza: 0.185 gr
• Kilataje: 10k
• Merma: 8%
• Mano obra: $20
• Piedra: $0
• Comisión venta: $30/pieza
• Envío: $800

**Cálculo:**
1. Costo oro/pieza = $2,650 × (10 ÷ 24) × 0.185 = $204.27
2. Con merma = $204.27 × 1.08 = $220.61
3. Subtotal/pieza = $220.61 + $20 + $0 = $240.61
4. Por 2 piezas = $240.61 × 2 = $481.22
5. Con utilidad = $481.22 × 1.08 = $519.72
6. Comisión = 2 × $30 = $60
7. Con comisión = $519.72 + $60 = $579.72
8. Con envío = $579.72 + $800 = $1,379.72
9. Con IVA = $1,379.72 × 1.16 = $1,600.48
10. **Precio final = ($1,600.48 × 1.036) + $3 = $1,661.10**

---

## 💡 PUNTOS IMPORTANTES:

✅ Los parámetros globales se configuran en el botón "Configuración" de cada calculadora

✅ Los parámetros por subcategoría se configuran individualmente para cada tipo de producto

✅ El sistema calcula automáticamente el precio final cuando actualizas cualquier valor

✅ Puedes actualizar precios de múltiples productos a la vez usando el botón "Actualizar todos los productos"

✅ Las comisiones de Stripe ya están incluidas en el precio final

---

¿Tienes alguna duda sobre cómo funciona alguna de las calculadoras? Estoy aquí para ayudarte 😊
