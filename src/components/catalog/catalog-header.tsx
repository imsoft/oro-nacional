"use client";

import { Search, Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CatalogHeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onSearch?: (query: string) => void;
  onSort?: (sortBy: string) => void;
  totalProducts: number;
  onToggleMobileFilters?: () => void;
}

const CatalogHeader = ({
  viewMode,
  onViewModeChange,
  onSearch,
  onSort,
  totalProducts,
  onToggleMobileFilters,
}: CatalogHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Catálogo de Joyería de Oro
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalProducts} productos disponibles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewModeChange("grid")}
            className={
              viewMode === "grid"
                ? "bg-[#D4AF37] text-white hover:bg-[#B8941E] hover:text-white"
                : ""
            }
          >
            <Grid3x3 className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewModeChange("list")}
            className={
              viewMode === "list"
                ? "bg-[#D4AF37] text-white hover:bg-[#B8941E] hover:text-white"
                : ""
            }
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar anillos, collares, aretes..."
            className="pl-10 pr-4"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        <Select onValueChange={onSort}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Destacados</SelectItem>
            <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="newest">Más Recientes</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="lg:hidden"
          onClick={onToggleMobileFilters}
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          Filtros
        </Button>
      </div>
    </div>
  );
};

export default CatalogHeader;
