import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function HelpTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Ajuda"
          className="grid size-6 shrink-0 place-items-center rounded-full text-[#8A958B] transition hover:bg-[#E8F0E8] hover:text-[#285A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#658B71]"
        >
          <HelpCircle className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" align="start" className="max-w-[240px] rounded-lg border border-[#D5DDD4] bg-[#FCFBF7] p-3 text-[12px] leading-5 text-[#405347] shadow-[0_10px_30px_rgba(23,63,52,0.12)]">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
