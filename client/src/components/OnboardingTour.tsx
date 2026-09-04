import { useState } from "react";
import { ArrowRight, Check, Landmark, LayoutDashboard, CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";

const TOUR_KEY = "delibera.tour.done.v1";

const steps = [
  {
    icon: LayoutDashboard,
    title: "Painel operacional",
    body: "Comece pelo painel: métricas, próximas reuniões e pendências em um só lugar. Cada card de métrica leva ao módulo correspondente.",
    route: "/dashboard",
  },
  {
    icon: Landmark,
    title: "Conselhos e membros",
    body: "Organize instâncias colegiadas, composição e mandatos. Use a busca para localizar conselhos por nome ou sigla.",
    route: "/conselhos",
  },
  {
    icon: CalendarDays,
    title: "Ciclo da reunião",
    body: "Conduza cada encontro do agendamento à publicação da ata: reuniões, pautas, votações, atas e resoluções.",
    route: "/reunioes",
  },
];

export function isTourDone() {
  try {
    return localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return false;
  }
}

export function markTourDone() {
  try {
    localStorage.setItem(TOUR_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function OnboardingTour() {
  const [open, setOpen] = useState(!isTourDone());
  const [index, setIndex] = useState(0);
  const [, setLocation] = useLocation();

  const step = steps[index];
  const Icon = step.icon;

  const close = () => {
    markTourDone();
    setOpen(false);
  };

  const next = () => {
    markTourDone();
    if (index < steps.length - 1) {
      setIndex(index + 1);
    } else {
      close();
    }
  };

  const goTo = () => {
    markTourDone();
    setLocation(step.route);
    setOpen(false);
  };

  const skip = () => {
    markTourDone();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) skip(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#E8F0E8] text-[#285A43]">
              <Sparkles className="size-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9533A]">
              Boas-vindas
            </span>
          </div>
          <DialogTitle className="flex items-center gap-2 font-editorial text-xl font-semibold text-[#193B32]">
            <Icon className="size-5 text-[#285A43]" />
            {step.title}
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-6">
            {step.body}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <Progress value={((index + 1) / steps.length) * 100} className="h-1.5 flex-1 bg-[#E0E6DF]" />
          <span className="text-[11px] font-bold text-[#718072]">
            {index + 1} / {steps.length}
          </span>
        </div>
        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <button onClick={skip} className="text-[12px] font-bold text-[#718072] hover:text-[#285A43]">
            Pular
          </button>
          <div className="flex items-center gap-2">
            <Button onClick={goTo} variant="outline" className="h-10 rounded-xl border-[#CBD4CA] bg-white text-[12px] font-bold text-[#285A43] hover:bg-[#EAF1E9]">
              Abrir módulo
            </Button>
            {index < steps.length - 1 ? (
              <Button onClick={next} className="h-10 rounded-xl bg-[#173F34] px-4 text-[12px] font-semibold text-white hover:bg-[#245446]">
                Próximo <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            ) : (
              <Button onClick={close} className="h-10 rounded-xl bg-[#173F34] px-4 text-[12px] font-semibold text-white hover:bg-[#245446]">
                <Check className="mr-1.5 size-3.5" /> Concluir
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
