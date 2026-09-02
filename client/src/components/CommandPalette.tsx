import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderOpen,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Settings2,
  ShieldCheck,
  UsersRound,
  Vote,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CommandEntry = {
  id: string;
  label: string;
  hint?: string;
  route: string;
  group: "Navegação" | "Ações";
  icon: typeof LayoutDashboard;
};

const navigationEntries: CommandEntry[] = [
  { id: "painel", label: "Painel", hint: "Visão geral", route: "/dashboard", group: "Navegação", icon: LayoutDashboard },
  { id: "conselhos", label: "Conselhos", hint: "Instâncias ativas", route: "/conselhos", group: "Navegação", icon: Landmark },
  { id: "membros", label: "Membros", hint: "Pessoas e representações", route: "/membros", group: "Navegação", icon: UsersRound },
  { id: "mandatos", label: "Mandatos", hint: "Mandatos vigentes", route: "/mandatos", group: "Navegação", icon: ShieldCheck },
  { id: "reunioes", label: "Reuniões", hint: "Agenda e preparação", route: "/reunioes", group: "Navegação", icon: CalendarDays },
  { id: "pautas", label: "Pautas", hint: "Itens e ordem de deliberação", route: "/pautas", group: "Navegação", icon: ListChecks },
  { id: "votacoes", label: "Votações", hint: "Votos e quórum", route: "/votacoes", group: "Navegação", icon: Vote },
  { id: "atas", label: "Atas", hint: "Memória das reuniões", route: "/atas", group: "Navegação", icon: BookOpen },
  { id: "resolucoes", label: "Resoluções", hint: "Publicação normativa", route: "/resolucoes", group: "Navegação", icon: FileText },
  { id: "documentos", label: "Documentos", hint: "Acervo institucional", route: "/documentos", group: "Navegação", icon: FolderOpen },
  { id: "encaminhamentos", label: "Encaminhamentos", hint: "Prazos e responsáveis", route: "/encaminhamentos", group: "Navegação", icon: CheckCircle2 },
  { id: "relatorios", label: "Relatórios", hint: "Indicadores de gestão", route: "/relatorios", group: "Navegação", icon: BarChart3 },
  { id: "auditoria", label: "Auditoria", hint: "Trilha de auditoria", route: "/auditoria", group: "Navegação", icon: Activity },
  { id: "configuracoes", label: "Configurações", hint: "Regras institucionais", route: "/configuracoes", group: "Navegação", icon: Settings2 },
];

export function CommandPalette({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "/" && !(e.metaKey || e.ctrlKey || e.altKey)) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const entries = useMemo(
    () =>
      navigationEntries.map((entry) => ({
        ...entry,
        icon: entry.icon,
      })),
    []
  );

  const run = (entry: CommandEntry) => {
    setOpen(false);
    setLocation(entry.route);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Busca global" description="Navegue pelos módulos da plataforma">
      <CommandInput placeholder="Buscar módulo ou ação… (pressione / para focar)" />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {entries
            .filter((entry) => entry.group === "Navegação")
            .map((entry) => {
              const Icon = entry.icon;
              return (
                <CommandItem key={entry.id} value={entry.label} onSelect={() => run(entry)} className={cn("gap-2.5 px-2")}>
                  <Icon className="size-4 text-[#869188]" />
                  <span>{entry.label}</span>
                  {entry.hint && <span className="ml-2 text-xs text-[#9AA29A]">{entry.hint}</span>}
                </CommandItem>
              );
            })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações rápidas">
          <CommandItem onSelect={() => run(entries[0])}>
            <LayoutDashboard className="size-4 text-[#869188]" />
            <span>Ir para o painel</span>
            <CommandShortcut>g h</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
