"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Calendar } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";

export type InstallmentOption = 1 | 3 | 6 | 9 | 12;

// Tasas de interés según el número de meses
const INTEREST_RATES = {
  1: 0,      // Sin intereses para pago de contado
  3: 0.05,   // 5% de intereses
  6: 0.075,  // 7.5% de intereses
  9: 0.10,   // 10% de intereses
  12: 0.125, // 12.5% de intereses
};

interface InstallmentSelectorProps {
  total: number;
  selectedInstallments: InstallmentOption;
  onInstallmentChange: (installments: InstallmentOption) => void;
}

export function InstallmentSelector({
  total,
  selectedInstallments,
  onInstallmentChange,
}: InstallmentSelectorProps) {
  const t = useTranslations("checkout");
  const { formatPrice } = useCurrency();

  const installmentOptions: InstallmentOption[] = [1, 3, 6, 9, 12];

  const calculateTotalWithInterest = (installments: InstallmentOption) => {
    const interestRate = INTEREST_RATES[installments];
    return total * (1 + interestRate);
  };

  const calculateMonthlyPayment = (installments: InstallmentOption) => {
    const totalWithInterest = calculateTotalWithInterest(installments);
    return totalWithInterest / installments;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-[#D4AF37]" />
        <Label className="text-base font-semibold">
          {t("paymentOptions")}
        </Label>
      </div>

      <RadioGroup
        value={selectedInstallments.toString()}
        onValueChange={(value) =>
          onInstallmentChange(parseInt(value) as InstallmentOption)
        }
      >
        <div className="space-y-3">
          {installmentOptions.map((installments) => {
            const monthlyPayment = calculateMonthlyPayment(installments);
            const totalWithInterest = calculateTotalWithInterest(installments);
            const interestRate = INTEREST_RATES[installments];
            const interestAmount = totalWithInterest - total;
            const isSelected = selectedInstallments === installments;

            return (
              <div
                key={installments}
                className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#D4AF37] bg-[#D4AF37]/5"
                    : "border-border hover:border-[#D4AF37]/50"
                }`}
                onClick={() => onInstallmentChange(installments)}
              >
                <RadioGroupItem
                  value={installments.toString()}
                  id={`installment-${installments}`}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`installment-${installments}`}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {installments === 1
                            ? t("payInFull")
                            : t("installments", { count: installments })}
                        </span>
                      </div>
                      {installments > 1 && (
                        <p className="text-sm text-amber-600 font-medium">
                          {t("withInterest", { rate: (interestRate * 100).toFixed(1) })}
                        </p>
                      )}
                      {installments === 1 && (
                        <p className="text-sm text-green-600 font-medium">
                          {t("noAdditionalFees")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {installments === 1 ? (
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-[#D4AF37]">
                            {formatPrice(total)}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            Mejor precio
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-amber-600">
                            {formatPrice(monthlyPayment)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("perMonth")}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("total")}: {formatPrice(totalWithInterest)}
                          </p>
                          <p className="text-xs text-amber-600">
                            +{formatPrice(interestAmount)} intereses
                          </p>
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              </div>
            );
          })}
        </div>
      </RadioGroup>

      {/* Resumen del plan seleccionado */}
      <div className="mt-6 rounded-lg bg-muted/50 p-4 border border-border">
        <h4 className="font-semibold text-sm mb-3">{t("paymentSummary")}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("cashDiscount")}:</span>
            <span className="font-medium">
              {formatPrice(total)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("selectedPlan")}:</span>
            <span className="font-medium">
              {selectedInstallments === 1
                ? t("payInFull")
                : t("installments", { count: selectedInstallments })}
            </span>
          </div>
          {selectedInstallments > 1 && (
            <>
              <div className="flex justify-between text-amber-600">
                <span>{t("interestApplied", { rate: (INTEREST_RATES[selectedInstallments] * 100).toFixed(1) })}:</span>
                <span className="font-medium">
                  +{formatPrice(calculateTotalWithInterest(selectedInstallments) - total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("monthlyPayment")}:</span>
                <span className="font-bold text-amber-600">
                  {formatPrice(calculateMonthlyPayment(selectedInstallments))} x {selectedInstallments}
                </span>
              </div>
            </>
          )}
          <div className="pt-2 border-t border-border flex justify-between">
            <span className="font-semibold">{t("totalToPay")}:</span>
            <span className={`font-bold text-lg ${selectedInstallments === 1 ? 'text-green-600' : 'text-amber-600'}`}>
              {formatPrice(calculateTotalWithInterest(selectedInstallments))}
            </span>
          </div>
          {selectedInstallments === 1 ? (
            <p className="text-xs text-green-600 font-medium pt-1">
              ✓ Pago de contado - Sin intereses
            </p>
          ) : (
            <p className="text-xs text-amber-600 font-medium pt-1">
              ⓘ Incluye {(INTEREST_RATES[selectedInstallments] * 100).toFixed(1)}% de intereses
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
