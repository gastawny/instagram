import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  pagina: number;
  total: number;
  limite: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({
  pagina,
  total,
  limite,
  onPrev,
  onNext,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / limite);

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={pagina <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        {pagina} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={pagina >= totalPages}
      >
        Próximo
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
