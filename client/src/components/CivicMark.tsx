/**
 * Caderno Cívico: selo institucional de alta legibilidade; verde Conselho e argila discreta.
 */
import { cn } from "@/lib/utils";

type CivicMarkProps = {
  className?: string;
  label?: boolean;
  inverted?: boolean;
};

export function CivicMark({ className, label = true, inverted = false }: CivicMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-[14px] border shadow-[0_8px_20px_rgba(23,63,52,0.10)]",
          inverted ? "border-white/15 bg-white/10" : "border-[#D5DDD4] bg-[#FDFBF6]"
        )}
      >
        <img
          src="/conselhoos-mark.svg"
          alt="Selo ConselhoOS"
          className="size-7 object-contain"
        />
      </div>
      {label && (
        <div className={cn("leading-none", inverted ? "text-[#FCFAF4]" : "text-[#173F34]")}>
          <p className="font-editorial text-[21px] font-semibold tracking-[-0.045em]">Conselho<span className="text-[#C46C4B]">OS</span></p>
          <p className={cn("mt-1 text-[9px] font-bold uppercase tracking-[0.17em]", inverted ? "text-white/55" : "text-[#6D786F]")}>Governança colegiada</p>
        </div>
      )}
    </div>
  );
}
