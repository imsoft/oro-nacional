"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Calendar } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";

export type InstallmentOption = 1 | 3 | 6 | 9 | 12;

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

  const calculateMonthlyPayment = (installments: InstallmentOption) => {
    return total / installments;
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
                        <p className="text-sm text-muted-foreground">
                          {t("noInterest")}
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
                            {t("saveOnProcessing")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-lg font-bold">
                            {formatPrice(monthlyPayment)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("perMonth")}
                          </p>
                          <p className="text-xs font-medium text-[#D4AF37]">
                            {t("total")}: {formatPrice(total)}
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
            <span className="text-muted-foreground">{t("subtotal")}:</span>
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("monthlyPayment")}:</span>
              <span className="font-bold text-[#D4AF37]">
                {formatPrice(calculateMonthlyPayment(selectedInstallments))}
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-border flex justify-between">
            <span className="font-semibold">{t("totalToPay")}:</span>
            <span className="font-bold text-lg text-[#D4AF37]">
              {formatPrice(total)}
            </span>
          </div>
          {selectedInstallments > 1 && (
            <p className="text-xs text-green-600 font-medium pt-1">
              ✓ {t("zeroInterest")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
