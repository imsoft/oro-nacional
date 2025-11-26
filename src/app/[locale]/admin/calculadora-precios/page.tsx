"use client";

import { Calculator, Scale, Gem } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PriceCalculatorIndexPage() {
  const router = useRouter();

  const calculatorTypes = [
    {
      id: "gramo",
      title: "Calculadora por Gramo",
      description: "Calcula precios basados en el peso del oro y factores de costo",
      icon: Scale,
      href: "/admin/calculadora-precios/gramo",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverBg: "hover:bg-blue-100",
    },
    {
      id: "broquel",
      title: "Calculadora por Broquel",
      description: "Calcula precios para productos tipo broquel con precio fijo por pieza",
      icon: Gem,
      href: "/admin/calculadora-precios/broquel",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverBg: "hover:bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Calculator className="h-8 w-8 text-[#D4AF37]" />
          <h1 className="text-3xl font-bold text-foreground">
            Calculadora de Precios
          </h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Selecciona el tipo de calculadora que deseas utilizar
        </p>
      </div>

      {/* Calculator Options Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {calculatorTypes.map((calc) => {
          const Icon = calc.icon;
          return (
            <Card
              key={calc.id}
              className={`cursor-pointer transition-all ${calc.borderColor} ${calc.hoverBg} hover:shadow-lg border-2`}
              onClick={() => router.push(calc.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${calc.bgColor}`}>
                    <Icon className={`h-8 w-8 ${calc.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{calc.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {calc.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="border-[#D4AF37]/20 bg-[#D4AF37]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-[#D4AF37]" />
            Información
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Por Gramo:</strong> Utiliza esta calculadora para productos cuyo precio
            se calcula en base al peso del oro, factores de producción, y comisiones variables.
          </p>
          <p>
            <strong className="text-foreground">Por Broquel:</strong> Utiliza esta calculadora para productos con
            precio fijo por pieza, como broqueles y aretes pequeños.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
