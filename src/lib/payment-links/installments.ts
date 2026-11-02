// =============================================
// Pagos a meses con intereses — cálculo compartido
// =============================================
// Lo usan el admin (vista previa), la página de pago y el servidor (monto
// real del cobro), para que los tres den exactamente el mismo número.
//
// Stripe México cobra a la tienda una comisión extra por cada plan de meses
// (más IVA). Con "meses con intereses" ese costo se traslada al cliente: el
// total se calcula para que, después de la comisión del plan, a la tienda le
// quede el precio base (solo absorbe la comisión ordinaria de Stripe).

/** IVA que Stripe cobra sobre sus comisiones. */
export const STRIPE_FEE_VAT = 0.16;

/**
 * Planes activos en Stripe (Configuración → Métodos de pago → Meses).
 * Si se activa o desactiva un plan en Stripe, actualizar esta lista.
 */
export const INSTALLMENT_PLANS = [
  { months: 3, rate: 0.05, minMXN: 300 },
  { months: 6, rate: 0.075, minMXN: 600 },
  { months: 12, rate: 0.125, minMXN: 1200 },
] as const;

export type InstallmentMonths = (typeof INSTALLMENT_PLANS)[number]['months'];

export function getInstallmentPlan(months: number | null | undefined) {
  return INSTALLMENT_PLANS.find((plan) => plan.months === months) ?? null;
}

const ceil2 = (n: number) => Math.ceil(n * 100 - 1e-9) / 100;
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Total a cobrar a meses a partir del precio base (MXN).
 * total = base / (1 − tasa × 1.16): la comisión del plan + IVA sobre ese
 * total es exactamente el incremento que se le suma al cliente.
 */
export function getFinancedTotal(base: number, months: number) {
  const plan = getInstallmentPlan(months);
  if (!plan || !(base > 0)) return null;

  const total = ceil2(base / (1 - plan.rate * (1 + STRIPE_FEE_VAT)));
  return {
    plan,
    base: round2(base),
    total,
    financing: round2(total - base),
    monthly: round2(total / plan.months),
    meetsMinimum: total >= plan.minMXN,
  };
}

/**
 * Desglose estimado de lo que cobra Stripe y lo que le queda a la tienda.
 * La cuota fija de Stripe está en MXN; para USD se convierte con el tipo de cambio.
 */
export function getStripeBreakdown(params: {
  total: number;
  currency: 'MXN' | 'USD';
  fees: { percentage: number; fixedFeeMXN: number };
  exchangeRate: number;
  installmentRate?: number;
}) {
  const { total, currency, fees, exchangeRate, installmentRate = 0 } = params;
  const fixedFee = currency === 'USD' ? fees.fixedFeeMXN / exchangeRate : fees.fixedFeeMXN;
  const ordinaryCommission = total > 0 ? total * fees.percentage + fixedFee : 0;
  const ordinaryFee = ordinaryCommission * (1 + STRIPE_FEE_VAT);
  const financingFee = total * installmentRate * (1 + STRIPE_FEE_VAT);
  return {
    ordinaryCommission,
    ordinaryVat: ordinaryCommission * STRIPE_FEE_VAT,
    ordinaryFee,
    financingFee,
    net: Math.max(0, total - ordinaryFee - financingFee),
    percentageLabel: `${(fees.percentage * 100).toFixed(1)}%`,
    fixedFee,
  };
}
