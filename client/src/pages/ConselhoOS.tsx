/**
 * Caderno CÃ­vico: experiÃªncia editorial institucional, linhas de rastreabilidade e densidade organizada.
 */
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Globe2,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Vote,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CivicMark } from "@/components/CivicMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { statusStyles, metricIconTones } from "@/lib/status";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import { CommandPalette } from "@/components/CommandPalette";
import { HelpTip } from "@/components/HelpTip";
import { ModuleSkeleton } from "@/components/ModuleSkeleton";
import { SessionExpiredDialog } from "@/components/SessionExpiredDialog";
import { OnboardingTour } from "@/components/OnboardingTour";
import { Skeleton } from "@/components/ui/skeleton";

type ModuleKey = "dashboard" | "conselhos" | "membros" | "mandatos" | "reunioes" | "pautas" | "votacoes" | "atas" | "resolucoes" | "documentos" | "encaminhamentos" | "relatorios" | "auditoria" | "configuracoes";

const routeToModule: Record<string, ModuleKey> = {
  "/dashboard": "dashboard",
  "/conselhos": "conselhos",
  "/membros": "membros",
  "/mandatos": "mandatos",
  "/reunioes": "reunioes",
  "/pautas": "pautas",
  "/votacoes": "votacoes",
  "/atas": "atas",
  "/resolucoes": "resolucoes",
  "/documentos": "documentos",
  "/encaminhamentos": "encaminhamentos",
  "/relatorios": "relatorios",
  "/auditoria": "auditoria",
  "/configuracoes": "configuracoes",
};

const moduleTitles: Record<ModuleKey, { eyebrow: string; title: string; description: string }> = {
  dashboard: { eyebrow: "VisÃ£o operacional", title: "A manhÃ£ comeÃ§a com clareza.", description: "Acompanhe as reuniÃµes, decisÃµes e pendÃªncias que movimentam seus conselhos." },
  conselhos: { eyebrow: "GestÃ£o institucional", title: "Conselhos e colegiados", description: "Estruture instÃ¢ncias, competÃªncias, composiÃ§Ã£o e transparÃªncia em um sÃ³ lugar." },
  membros: { eyebrow: "GestÃ£o institucional", title: "Pessoas e representaÃ§Ãµes", description: "Consulte membros, papÃ©is, entidades representadas e participaÃ§Ã£o." },
  mandatos: { eyebrow: "GestÃ£o institucional", title: "Mandatos vigentes", description: "Acompanhe nomeaÃ§Ãµes, perÃ­odos e situaÃ§Ãµes de exercÃ­cio." },
  reunioes: { eyebrow: "OperaÃ§Ã£o colegiada", title: "ReuniÃµes", description: "Conduza cada encontro do agendamento Ã  publicaÃ§Ã£o da ata." },
  pautas: { eyebrow: "OperaÃ§Ã£o colegiada", title: "Pautas", description: "Organize assuntos, responsÃ¡veis, documentos e ordem de deliberaÃ§Ã£o." },
  votacoes: { eyebrow: "DeliberaÃ§Ã£o", title: "VotaÃ§Ãµes", description: "Registre votos com resultado, quÃ³rum e rastreabilidade." },
  atas: { eyebrow: "DocumentaÃ§Ã£o", title: "Atas", description: "Elabore, revise, aprove e publique a memÃ³ria das reuniÃµes." },
  resolucoes: { eyebrow: "DocumentaÃ§Ã£o", title: "ResoluÃ§Ãµes", description: "Controle numeraÃ§Ã£o, conteÃºdo, aprovaÃ§Ã£o e publicaÃ§Ã£o oficial." },
  documentos: { eyebrow: "Acervo", title: "Documentos", description: "Encontre o contexto e a versÃ£o certa de cada arquivo." },
  encaminhamentos: { eyebrow: "Acompanhamento", title: "Encaminhamentos", description: "Conecte decisÃµes a responsÃ¡veis, prazos e evidÃªncias de conclusÃ£o." },
  relatorios: { eyebrow: "InteligÃªncia", title: "RelatÃ³rios", description: "Transforme atividade colegiada em indicadores de gestÃ£o e transparÃªncia." },
  auditoria: { eyebrow: "GovernanÃ§a", title: "Trilha de auditoria", description: "Consulte aÃ§Ãµes relevantes e preserva a histÃ³ria de cada alteraÃ§Ã£o." },
  configuracoes: { eyebrow: "AdministraÃ§Ã£o", title: "ConfiguraÃ§Ãµes", description: "Defina regras institucionais, perfis e padrÃµes de publicaÃ§Ã£o." },
};

const moduleHelp: Record<ModuleKey, string> = {
  dashboard: "Acompanhe reuniões, decisões e pendências que movimentam seus conselhos.",
  conselhos: "Estruture instâncias, competências, composição e transparência em um só lugar.",
  membros: "Consulte membros, papéis, entidades representadas e participação.",
  mandatos: "Acompanhe nomeações, períodos e situações de exercício.",
  reunioes: "Conduza cada encontro do agendamento à publicação da ata.",
  pautas: "Organize assuntos, responsáveis, documentos e ordem de deliberação.",
  votacoes: "Registre votos com resultado, quórum e rastreabilidade.",
  atas: "Elabore, revise, aprove e publique a memória das reuniões.",
  resolucoes: "Controle numeração, conteúdo, aprovação e publicação oficial.",
  documentos: "Encontre o contexto e a versão certa de cada arquivo.",
  encaminhamentos: "Conecte decisões a responsáveis, prazos e evidências de conclusão.",
  relatorios: "Transforme atividade colegiada em indicadores de gestão e transparência.",
  auditoria: "Consulte ações relevantes e preserve a história de cada alteração.",
  configuracoes: "Defina regras institucionais, perfis e padrões de publicação.",
};

const chartData = [
  { month: "Mar", meetings: 6 },
  { month: "Abr", meetings: 8 },
  { month: "Mai", meetings: 7 },
  { month: "Jun", meetings: 11 },
  { month: "Jul", meetings: 9 },
  { month: "Ago", meetings: 14 },
];

const attendanceData = [
  { name: "PresenÃ§a", value: 88, color: "#173F34" },
  { name: "AusÃªncias", value: 12, color: "#E7E4DA" },
];

const meetings = [
  { day: "28", month: "AGO", title: "24Âª ReuniÃ£o OrdinÃ¡ria", council: "Conselho Municipal de SaÃºde", time: "14:00 â€” 16:30", status: "Confirmada", tone: "confirmed" },
  { day: "30", month: "AGO", title: "CÃ¢mara TÃ©cnica de OrÃ§amento", council: "Conselho de Desenvolvimento Urbano", time: "09:00 â€” 11:00", status: "Pauta em revisÃ£o", tone: "review" },
  { day: "02", month: "SET", title: "SessÃ£o deliberativa", council: "Conselho de EducaÃ§Ã£o", time: "14:00 â€” 17:00", status: "ConvocaÃ§Ã£o pendente", tone: "pending" },
];

const councils = [
  { acronym: "CMS", name: "Conselho Municipal de SaÃºde", members: 24, meetings: "14 este ano", updated: "Atualizado hoje", color: "#173F34" },
  { acronym: "CMDH", name: "Conselho Municipal dos Direitos Humanos", members: 18, meetings: "8 este ano", updated: "Atualizado ontem", color: "#A9533A" },
  { acronym: "CMU", name: "Conselho Municipal de Desenvolvimento Urbano", members: 20, meetings: "11 este ano", updated: "Atualizado em 26 ago.", color: "#768C75" },
  { acronym: "CME", name: "Conselho Municipal de EducaÃ§Ã£o", members: 22, meetings: "9 este ano", updated: "Atualizado em 25 ago.", color: "#B5974E" },
];

const documents = [
  { type: "ATA", title: "Ata da 23Âª ReuniÃ£o OrdinÃ¡ria", context: "Conselho Municipal de SaÃºde Â· 14 ago. 2026", status: "Publicado", file: "PDF Â· 1,8 MB" },
  { type: "RES", title: "ResoluÃ§Ã£o nÂº 18/2026", context: "Conselho de EducaÃ§Ã£o Â· 12 ago. 2026", status: "Publicado", file: "PDF Â· 842 KB" },
  { type: "PAUTA", title: "Pauta da 24Âª ReuniÃ£o OrdinÃ¡ria", context: "Conselho Municipal de SaÃºde Â· 28 ago. 2026", status: "Em revisÃ£o", file: "DOCX Â· 364 KB" },
  { type: "REL", title: "RelatÃ³rio de presenÃ§a â€” 2Âº trimestre", context: "GestÃ£o institucional Â· 10 ago. 2026", status: "Interno", file: "XLSX Â· 210 KB" },
];

function ActionButton({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <Button onClick={onClick} className={cn("h-10 rounded-xl bg-[#173F34] px-4 text-[13px] font-semibold text-white shadow-[0_7px_16px_rgba(23,63,52,0.18)] hover:bg-[#245446]", className)}>
      {children}
    </Button>
  );
}

function StatusPill({ children, tone = "confirmed" }: { children: React.ReactNode; tone?: "confirmed" | "review" | "pending" | "neutral" | "private" | "danger" }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-bold tracking-[0.02em] before:size-1.5 before:rounded-full", statusStyles[tone])}>{children}</span>;
}

function Metric({ label, value, change, icon: Icon, tone = "green", onClick }: { label: string; value: string; change: string; icon: typeof CalendarDays; tone?: "green" | "clay" | "gold" | "sage"; onClick?: () => void }) {
  const tones = metricIconTones;
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#607068]">{label}</p>
          <p className="mt-2 font-editorial text-[31px] font-semibold leading-none tracking-[-0.055em] text-[#193B32]">{value}</p>
        </div>
        <div className={cn("grid size-9 place-items-center rounded-xl", tones[tone])}><Icon className="size-4" /></div>
      </div>
      <p className="mt-3 text-[13px] font-medium text-[#657268]">{change}</p>
    </>
  );
  const base = "relative overflow-hidden border-b border-[#DDE2DB] bg-[#FCFBF7] px-5 py-5 transition-colors";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={`Ver ${label}`} className={cn(base, "w-full text-left hover:bg-[#F4F7F1] focus-visible:outline-none")}>
        {inner}
      </button>
    );
  }
  return <article className={cn(base, "hover:bg-white")}>{inner}</article>;
}

function SectionHeading({ index, label, title, action }: { index: string; label: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-end gap-3">
        <span className="pb-0.5 text-[13px] font-bold tracking-[0.16em] text-[#C46C4B]">{index}</span>
        <div><p className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#607068]">{label}</p><h2 className="mt-1 font-editorial text-[23px] font-semibold tracking-[-0.035em] text-[#193B32]">{title}</h2></div>
      </div>
      {action}
    </div>
  );
}

function CivicRail({ active }: { active: ModuleKey }) {
  const context: Record<ModuleKey, [string, string, string, string]> = {
    dashboard: ["Ciclo 08/2026", "14 reuniÃµes registradas", "36 decisÃµes catalogadas", "PrÃ³ximo ato: reuniÃ£o ordinÃ¡ria Â· hoje, 14h"],
    conselhos: ["Cadastro institucional", "4 instÃ¢ncias ativas", "ComposiÃ§Ã£o verificada", "PrÃ³ximo ato: revisar mandatos com vencimento"],
    membros: ["ComposiÃ§Ã£o colegiada", "RepresentaÃ§Ãµes vinculadas", "Mandatos em controle", "PrÃ³ximo ato: confirmar substituiÃ§Ãµes"],
    mandatos: ["VigÃªncia e posse", "NomeaÃ§Ãµes registradas", "Termos vinculados", "PrÃ³ximo ato: notificar fim de mandato"],
    reunioes: ["Ciclo de reuniÃ£o", "Pauta e documentos", "ConfirmaÃ§Ãµes em andamento", "PrÃ³ximo ato: validar quÃ³rum da reuniÃ£o de hoje"],
    pautas: ["OrganizaÃ§Ã£o de pauta", "Itens ordenados", "Relatorias identificadas", "PrÃ³ximo ato: submeter pauta Ã  aprovaÃ§Ã£o"],
    votacoes: ["Registro de deliberaÃ§Ã£o", "Votos vinculados Ã  pauta", "Resultado preservado", "PrÃ³ximo ato: abrir sessÃ£o de votaÃ§Ã£o"],
    atas: ["MemÃ³ria da reuniÃ£o", "Minutas versionadas", "AprovaÃ§Ãµes registradas", "PrÃ³ximo ato: revisar ata pendente"],
    resolucoes: ["PublicaÃ§Ã£o normativa", "NumeraÃ§Ã£o preservada", "VÃ­nculo com deliberaÃ§Ã£o", "PrÃ³ximo ato: publicar resoluÃ§Ã£o aprovada"],
    documentos: ["Acervo e contexto", "ClassificaÃ§Ã£o aplicada", "Visibilidade controlada", "PrÃ³ximo ato: revisar documento em ediÃ§Ã£o"],
    encaminhamentos: ["Responsabilidade e prazo", "ResponsÃ¡veis identificados", "EvidÃªncias de conclusÃ£o", "PrÃ³ximo ato: cobrar retorno de pendÃªncia crÃ­tica"],
    relatorios: ["PrestaÃ§Ã£o de contas", "Filtros documentados", "EvidÃªncias para exportaÃ§Ã£o", "PrÃ³ximo ato: gerar relatÃ³rio do perÃ­odo"],
    auditoria: ["HistÃ³rico institucional", "AÃ§Ãµes catalogadas", "AlteraÃ§Ãµes preservadas", "PrÃ³ximo ato: consultar aprovaÃ§Ã£o mais recente"],
    configuracoes: ["Regras da organizaÃ§Ã£o", "Perfis definidos", "PolÃ­ticas de publicaÃ§Ã£o", "PrÃ³ximo ato: validar permissÃµes"],
  };
  const [protocol, base, record, next] = context[active];
  return <section className="mb-8 overflow-hidden border border-[#D5DDD4] bg-[#FCFBF7]"><div className="grid sm:grid-cols-[156px_1fr]"><div className="border-b border-[#244D42] bg-[#173F34] px-5 py-4 text-white sm:border-b-0 sm:border-r"><p className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#BFD2C1]">RÃ©gua cÃ­vica</p><p className="mt-2 font-editorial text-[18px] font-semibold tracking-[-0.035em]">{protocol}</p><p className="mt-4 text-[13px] font-bold text-[#E7DFAE]">â— Em acompanhamento</p></div><div className="grid sm:grid-cols-3"><div className="border-b border-[#DDE2DB] px-5 py-4 sm:border-b-0 sm:border-r"><p className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#637268]">01 Â· Base</p><p className="mt-2 text-[14px] font-bold text-[#294038]">{base}</p></div><div className="border-b border-[#DDE2DB] px-5 py-4 sm:border-b-0 sm:border-r"><p className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#637268]">02 Â· Registro</p><p className="mt-2 text-[14px] font-bold text-[#294038]">{record}</p></div><div className="bg-[#F3F6F0] px-5 py-4"><p className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#A9533A]">03 Â· PrÃ³ximo ato</p><p className="mt-2 text-[14px] font-bold leading-5 text-[#285A43]">{next}</p></div></div></div></section>;
}

function Footer() {
  return (
    <footer className="border-t border-[#E0E5DE] bg-[#FCFBF7] py-4">
      <div className="mx-auto max-w-[1360px] px-5 text-center text-[13px] text-[#5E6C64]">
        Desenvolvido pelo Departamento de Tecnologia da SME
      </div>
    </footer>
  );
}

function CouncilRegisterView() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const visible = useMemo(() => councils.filter((c) => `${c.acronym} ${c.name}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="space-y-7"><section className="flex flex-col gap-4 border-b border-[#DDE2DB] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#A9533A]">Livro de registros</p><p className="mt-2 font-editorial text-[28px] font-semibold tracking-[-0.045em] text-[#193B32]">InstÃ¢ncias em exercÃ­cio.</p></div><ActionButton onClick={() => toast.success("Cadastro de conselho preparado para integraÃ§Ã£o.")}><Plus className="mr-2 size-4" />Novo conselho</ActionButton></section><section className="flex items-center gap-3 border border-[#DDE2DB] bg-[#FCFBF7] p-3"><Search className="size-4 text-[#6C786E]" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Localizar por nome ou sigla" className="h-8 border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0" /></section><section className="border-y border-[#DDE2DB]"><div className="hidden grid-cols-[68px_minmax(0,1.4fr)_0.6fr_0.7fr_24px] gap-4 border-b border-[#DDE2DB] bg-[#F0F3ED] px-4 py-2 text-[13px] font-bold uppercase tracking-[0.13em] text-[#607068] sm:grid"><span>Registro</span><span>InstÃ¢ncia e contexto</span><span>ComposiÃ§Ã£o</span><span>PublicaÃ§Ã£o</span><span /></div>{visible.map((c, i) => <button key={c.acronym} onClick={() => toast.message(`${c.name}: detalhe disponÃ­vel apÃ³s a conexÃ£o da base.`)} className="group grid w-full gap-3 border-b border-[#E1E5DE] px-4 py-4 text-left last:border-b-0 hover:bg-[#F4F7F1] sm:grid-cols-[68px_minmax(0,1.4fr)_0.6fr_0.7fr_24px] sm:items-center sm:gap-4"><div className="flex items-center gap-2 sm:block"><span className="grid size-10 place-items-center rounded-full text-[13px] font-black tracking-[0.07em] text-white" style={{ background: c.color }}>{c.acronym}</span><p className="mt-2 text-[13px] font-bold tracking-[0.13em] text-[#A9533A]">0{i + 1} Â· 2026</p></div><div><p className="font-editorial text-[20px] font-semibold leading-[1.06] tracking-[-0.035em] text-[#193B32]">{c.name}</p><p className="mt-1 text-[13px] text-[#5E6C64]">Colegiado ativo Â· regimento e competÃªncias vinculados</p></div><div className="border-l border-[#E1E5DE] pl-3"><p className="text-[13px] font-bold uppercase tracking-[0.11em] text-[#89938A]">Membros</p><p className="mt-1 text-[14px] font-bold text-[#405348]">{c.members} ativos</p></div><div className="border-l border-[#E1E5DE] pl-3"><StatusPill tone="confirmed">Atualizado</StatusPill><p className="mt-2 text-[13px] font-medium text-[#647166]">{c.updated}</p></div><ChevronRight className="size-4 justify-self-end text-[#9AA39A] transition-transform group-hover:translate-x-1 group-hover:text-[#285A43]" /></button>)}</section><button onClick={() => setLocation("/membros")} className="group flex w-full items-center justify-between border-b border-[#DDE2DB] py-4 text-left"><span className="text-[14px] font-bold text-[#536358]">Consultar composiÃ§Ã£o e mandatos</span><ArrowRight className="size-4 text-[#285A43] transition-transform group-hover:translate-x-1" /></button></div>;
}

function AccountabilityReportView() {
  const [active, setActive] = useState("ReuniÃµes");
  const reports = ["ReuniÃµes", "PresenÃ§a", "DeliberaÃ§Ãµes", "ResoluÃ§Ãµes", "PendÃªncias"];
  return <div className="space-y-7"><section className="grid gap-7 border-b border-[#DDE2DB] pb-7 lg:grid-cols-[0.95fr_1.45fr]"><div><p className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#A9533A]">Leitura de gestÃ£o</p><h2 className="mt-2 font-editorial text-[29px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#193B32]">Dados que sustentam a prestaÃ§Ã£o de contas.</h2><p className="mt-4 text-[13px] leading-6 text-[#657268]">Selecione o assunto e o perÃ­odo antes de registrar uma anÃ¡lise para consulta ou exportaÃ§Ã£o.</p></div><div className="grid gap-3 sm:grid-cols-2"><label><span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#607068]">Conselho</span><div className="mt-2 flex h-11 items-center justify-between border border-[#D5DDD4] bg-[#FCFBF7] px-3 text-[14px] font-semibold text-[#526358]">Todos os conselhos <ChevronDown className="size-4" /></div></label><label><span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#607068]">PerÃ­odo</span><div className="mt-2 flex h-11 items-center justify-between border border-[#D5DDD4] bg-[#FCFBF7] px-3 text-[14px] font-semibold text-[#526358]">Jan â€” Ago 2026 <CalendarDays className="size-4" /></div></label><div className="sm:col-span-2"><ActionButton onClick={() => toast.success("RelatÃ³rio gerado na visualizaÃ§Ã£o.")}><BarChart3 className="mr-2 size-4" />Gerar anÃ¡lise</ActionButton></div></div></section><section className="grid gap-7 lg:grid-cols-[225px_minmax(0,1fr)]"><nav className="flex gap-1 overflow-x-auto border-b border-[#DDE2DB] pb-2 lg:block lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">{reports.map((r, i) => <button key={r} onClick={() => setActive(r)} className={cn("flex shrink-0 items-center gap-3 px-3 py-2.5 text-left text-[14px] font-bold transition lg:w-full", active === r ? "bg-[#E8F0E8] text-[#285A43]" : "text-[#6F7B70] hover:bg-[#F2F4EF]")}><span className="text-[13px] text-[#A9533A]">0{i + 1}</span>{r}</button>)}</nav><article className="relative overflow-hidden border border-[#DDE2DB] bg-[#FCFBF7] p-5 pl-7 sm:p-6 sm:pl-9"><span className="absolute inset-y-0 left-0 w-1 bg-[#173F34]" /><div className="flex flex-wrap justify-between gap-3"><div><p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#607068]">Caderno de evidÃªncias Â· 08/2026</p><h3 className="mt-1 font-editorial text-[24px] font-semibold tracking-[-0.04em] text-[#193B32]">{active} por perÃ­odo</h3></div><div className="text-right"><StatusPill tone="confirmed">Pronto para exportar</StatusPill><p className="mt-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#637268]">Protocolo 2026-08-REL</p></div></div><div className="mt-7 grid gap-px border border-[#DDE2DB] bg-[#DDE2DB] sm:grid-cols-3">{[["01 Â· Total", active === "PresenÃ§a" ? "88%" : "36"], ["02 Â· VariaÃ§Ã£o", "+12%"], ["03 Â· PerÃ­odo", "8 meses"]].map(([label, value]) => <div key={label} className="bg-[#F7F8F4] p-4"><p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#607068]">{label}</p><p className="mt-2 font-editorial text-[27px] font-semibold tracking-[-0.05em] text-[#193B32]">{value}</p></div>)}</div><div className="mt-7 border-y border-[#DDE2DB] bg-[#F8F9F5] px-4 pb-2 pt-5"><div className="mb-3 flex justify-between text-[13px] font-bold uppercase tracking-[0.13em] text-[#829082]"><span>Ritmo mensurado</span><span>Jan â†’ Ago</span></div><div className="flex h-32 items-end gap-2">{[34,55,42,75,58,89,66,96,74,86,61,84].map((h, i) => <div key={i} className="flex-1 bg-[#D6E2D5] transition hover:bg-[#285A43]" style={{ height: `${h}%` }} />)}</div></div><div className="mt-4 flex flex-wrap justify-between gap-3 text-[13px] text-[#6E7A70]"><span>Fonte: registros do ConselhoOS Â· dados demonstrativos.</span><button onClick={() => toast.message("A exportaÃ§Ã£o em PDF serÃ¡ processada apÃ³s a conexÃ£o do backend.")} className="inline-flex items-center gap-1.5 font-bold text-[#285A43]">Exportar PDF <Download className="size-3.5" /></button></div></article></section></div>;
}

function Dashboard() {
  const [, setLocation] = useLocation();
  const [range, setRange] = useState<"6m" | "12m">("6m");
  const monthlyData = range === "6m" ? chartData : [...chartData, { month: "Set", meetings: 12 }, { month: "Out", meetings: 15 }, { month: "Nov", meetings: 13 }, { month: "Dez", meetings: 17 }];
  return (
    <div className="space-y-8">
      <section className="grid overflow-hidden border border-[#DDE2DB] bg-[#FCFBF7] lg:grid-cols-[1fr_286px]">
        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4"><StatusPill tone="confirmed">Ciclo ativo</StatusPill><span className="text-[13px] font-medium text-[#607068]">Quinta-feira, 28 de agosto</span></div>
          <div className="mt-6 max-w-xl"><p className="font-editorial text-[31px] font-semibold leading-[1.04] tracking-[-0.05em] text-[#193B32]">A manhÃ£ comeÃ§a com <em className="font-normal text-[#A9533A]">clareza.</em></p><p className="mt-3 max-w-md text-[14px] leading-6 text-[#657268]">HÃ¡ trÃªs encontros na agenda e duas deliberaÃ§Ãµes aguardando encaminhamento. Escolha por onde continuar.</p></div>
          <div className="mt-7 flex flex-wrap items-center gap-3"><ActionButton onClick={() => toast.success("A criaÃ§Ã£o de reuniÃ£o estÃ¡ pronta para ser conectada ao banco de dados.")}><Plus className="mr-2 size-4" />Criar reuniÃ£o</ActionButton><button onClick={() => setLocation("/encaminhamentos")} className="inline-flex h-10 items-center gap-2 px-1 text-[13px] font-semibold text-[#285A43] transition hover:text-[#A9533A]">Ver pendÃªncias <ArrowRight className="size-4" /></button></div>
        </div>
        <aside className="relative overflow-hidden bg-[#173F34] p-6 text-white">
          <div className="paper-stamp absolute -right-10 -top-9 size-40 rounded-full border border-white/15" />
          <p className="relative text-[13px] font-bold uppercase tracking-[0.16em] text-[#C9D7C9]">PrÃ³ximo marco</p>
          <div className="relative mt-7"><div className="font-editorial text-[47px] font-semibold leading-none tracking-[-0.07em]">14:00</div><p className="mt-2 text-[13px] font-semibold">24Âª ReuniÃ£o OrdinÃ¡ria</p><p className="mt-1 max-w-[210px] text-[14px] leading-5 text-[#DCE9DD]">Conselho Municipal de SaÃºde Â· Sala PlenÃ¡ria</p></div>
          <button onClick={() => setLocation("/reunioes")} className="relative mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-[#EAD99B] hover:text-white">Abrir preparaÃ§Ã£o <ArrowUpRight className="size-3.5" /></button>
        </aside>
      </section>

      <section className="grid border-l border-t border-[#DDE2DB] sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="ReuniÃµes" value="14" change="+ 3 neste mÃªs" icon={CalendarDays} tone="green" onClick={() => setLocation("/reunioes")} />
        <Metric label="PresenÃ§a mÃ©dia" value="88%" change="Meta anual: 85%" icon={UsersRound} tone="sage" onClick={() => setLocation("/relatorios")} />
        <Metric label="ResoluÃ§Ãµes" value="36" change="7 aguardam publicaÃ§Ã£o" icon={BookOpen} tone="gold" onClick={() => setLocation("/resolucoes")} />
        <Metric label="PendÃªncias" value="09" change="2 prazos vencem hoje" icon={ListChecks} tone="clay" onClick={() => setLocation("/encaminhamentos")} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <article className="border-b border-[#DDE2DB] pb-1">
          <SectionHeading index="01" label="Ritmo institucional" title="Reuniões realizadas" action={<div className="flex items-center gap-1 rounded-full border border-[#DDE2DB] bg-[#FCFBF7] p-0.5"><button onClick={() => setRange("6m")} className={cn("rounded-full px-2.5 py-1 text-[13px] font-bold transition", range === "6m" ? "bg-[#173F34] text-white" : "text-[#637066] hover:bg-[#E0E7DE]")}>6 meses</button><button onClick={() => setRange("12m")} className={cn("rounded-full px-2.5 py-1 text-[13px] font-bold transition", range === "12m" ? "bg-[#173F34] text-white" : "text-[#637066] hover:bg-[#E0E7DE]")}>12 meses</button><a href="/relatorios" onClick={(e) => { e.preventDefault(); setLocation("/relatorios"); }} className="ml-1 hidden items-center gap-1 px-1 text-[13px] font-bold text-[#285A43] hover:text-[#A9533A] sm:inline-flex">Relatório <ArrowUpRight className="size-3" /></a></div>} />
          <div className="h-[240px] border border-[#E2E5DF] bg-[#FCFBF7] px-1 pb-2 pt-5 sm:px-3">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyData} margin={{ top: 5, left: -26, right: 8, bottom: 0 }}><defs><linearGradient id="meetingFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4F896E" stopOpacity={0.28} /><stop offset="100%" stopColor="#4F896E" stopOpacity={0.01} /></linearGradient></defs><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#607068", fontSize: 11, fontWeight: 600 }} dy={7} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#67756C", fontSize: 10 }} /><Tooltip cursor={{ stroke: "#C9D2C8", strokeWidth: 1 }} contentStyle={{ border: "1px solid #DDE2DB", borderRadius: 8, boxShadow: "0 8px 20px rgba(23,63,52,0.08)", fontSize: 12 }} /><Area type="monotone" dataKey="meetings" stroke="#245846" strokeWidth={2.3} fill="url(#meetingFill)" activeDot={{ r: 5, fill: "#C46C4B", stroke: "#fff" }} /></AreaChart></ResponsiveContainer>
          </div>
        </article>
        <article className="border-b border-[#DDE2DB] pb-3">
          <SectionHeading index="02" label="Assiduidade" title="PresenÃ§a do ciclo" />
          <div className="flex min-h-[240px] items-center border border-[#E2E5DF] bg-[#FCFBF7] p-4"><div className="h-[172px] w-[172px]"><ResponsiveContainer><PieChart><Pie data={attendanceData} dataKey="value" innerRadius={53} outerRadius={72} startAngle={90} endAngle={-270} stroke="none" paddingAngle={2}>{attendanceData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer></div><div className="min-w-0"><p className="font-editorial text-[32px] font-semibold tracking-[-0.05em] text-[#193B32]">88<span className="text-[18px]">%</span></p><p className="mt-1 text-[14px] leading-5 text-[#657268]">presenÃ§a mÃ©dia dos membros ativos.</p><div className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-[#285A43]"><span className="size-2 rounded-full bg-[#173F34]" />acima da meta</div></div></div>
        </article>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.52fr)_minmax(300px,0.82fr)]">
        <article>
          <SectionHeading index="03" label="Agenda em movimento" title="PrÃ³ximas reuniÃµes" action={<button onClick={() => setLocation("/reunioes")} className="hidden items-center gap-1 text-[13px] font-bold text-[#285A43] sm:inline-flex">Ver agenda <ArrowRight className="size-3" /></button>} />
          <div className="divide-y divide-[#E2E5DF] border-y border-[#DDE2DB]">{meetings.map((meeting) => <button key={meeting.title} onClick={() => setLocation("/reunioes")} className="group grid w-full grid-cols-[47px_minmax(0,1fr)_auto] items-center gap-4 px-1 py-4 text-left transition hover:bg-[#F5F7F1] sm:px-3"><div className="border-r border-[#DDE2DB] pr-3 text-center"><div className="font-editorial text-[27px] font-semibold leading-none tracking-[-0.05em] text-[#193B32]">{meeting.day}</div><div className="mt-1 text-[8px] font-bold tracking-[0.14em] text-[#A9533A]">{meeting.month}</div></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-[13px] font-bold text-[#294038]">{meeting.title}</p><StatusPill tone={meeting.tone as "confirmed" | "review" | "pending"}>{meeting.status}</StatusPill></div><p className="mt-1 truncate text-[13px] text-[#5E6C64]">{meeting.council} Â· {meeting.time}</p></div><ChevronRight className="size-4 text-[#A3AAA1] transition-transform group-hover:translate-x-1 group-hover:text-[#285A43]" /></button>)}</div>
        </article>
        <article className="relative overflow-hidden border border-[#DDE2DB] bg-[#F1F4ED] p-5"><div className="absolute right-0 top-0 h-full w-[38%] bg-gradient-to-br from-[#A9533A]/25 via-[#C46C4B]/15 to-transparent" /><div className="relative max-w-[225px]"><p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#A9533A]">Controle de prazo</p><h3 className="mt-2 font-editorial text-[25px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#193B32]">Duas decisÃµes precisam de atenÃ§Ã£o.</h3><p className="mt-3 text-[14px] leading-5 text-[#637066]">Encaminhamentos vencem nas prÃ³ximas 48 horas e aguardam resposta dos responsÃ¡veis.</p><button onClick={() => setLocation("/encaminhamentos")} className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-[#285A43]">Acompanhar agora <ArrowRight className="size-3.5" /></button></div></article>
      </section>
    </div>
  );
}

function CouncilsView() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const visible = useMemo(() => councils.filter((council) => council.name.toLowerCase().includes(query.toLowerCase()) || council.acronym.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <div className="space-y-7"><section className="flex flex-col gap-4 border-b border-[#DDE2DB] pb-6 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-xl"><p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#A9533A]">InstÃ¢ncias ativas</p><p className="mt-2 font-editorial text-[28px] font-semibold tracking-[-0.045em] text-[#193B32]">Quatro conselhos compÃµem o ciclo atual.</p></div><ActionButton onClick={() => toast.success("Cadastro de conselho preparado para integraÃ§Ã£o.")}><Plus className="mr-2 size-4" />Novo conselho</ActionButton></section><section className="flex items-center gap-3 border border-[#DDE2DB] bg-[#FCFBF7] p-3"><Search className="size-4 text-[#6C786E]" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou sigla" className="h-8 border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0" /><button onClick={() => setQuery("")} className={cn("text-[#607068] transition", query ? "opacity-100" : "pointer-events-none opacity-0")}><X className="size-4" /></button></section><section className="grid gap-px border border-[#DDE2DB] bg-[#DDE2DB] md:grid-cols-2">{visible.map((council) => <button key={council.acronym} onClick={() => toast.message(`${council.name}: detalhe disponÃ­vel ao conectar o Supabase.`)} className="group bg-[#FCFBF7] p-5 text-left transition hover:bg-[#F4F7F1]"><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-full text-[13px] font-extrabold tracking-[0.04em] text-white" style={{ background: council.color }}>{council.acronym}</div><MoreHorizontal className="size-5 text-[#9CA49B]" /></div><p className="mt-7 max-w-[270px] font-editorial text-[22px] font-semibold leading-[1.1] tracking-[-0.035em] text-[#193B32]">{council.name}</p><div className="mt-6 flex items-center justify-between border-t border-[#E1E5DE] pt-4 text-[13px] text-[#68756B]"><span>{council.members} membros Â· {council.meetings}</span><span className="font-semibold text-[#285A43] group-hover:text-[#A9533A]">{council.updated}</span></div></button>)}</section><button onClick={() => setLocation("/membros")} className="group flex w-full items-center justify-between border-b border-[#DDE2DB] py-4 text-left"><span className="text-[14px] font-bold text-[#536358]">Ver composiÃ§Ã£o e mandatos de todos os conselhos</span><ArrowRight className="size-4 text-[#285A43] transition-transform group-hover:translate-x-1" /></button></div>
  );
}

function MeetingsView() {
  const [filter, setFilter] = useState<"Todas" | "Confirmadas" | "Pendentes">("Todas");
  const filtered = meetings.filter((meeting) => filter === "Todas" || (filter === "Confirmadas" ? meeting.tone === "confirmed" : meeting.tone !== "confirmed"));
  return <div className="space-y-7"><section className="grid gap-5 border-b border-[#DDE2DB] pb-6 lg:grid-cols-[1fr_auto]"><div><p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#A9533A]">Ciclo de 28 ago. a 04 set.</p><p className="mt-2 font-editorial text-[28px] font-semibold tracking-[-0.045em] text-[#193B32]">TrÃªs encontros exigem preparaÃ§Ã£o.</p></div><div className="flex flex-wrap items-center gap-2">{(["Todas", "Confirmadas", "Pendentes"] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={cn("rounded-full px-3 py-1.5 text-[13px] font-bold transition", filter === item ? "bg-[#173F34] text-white" : "bg-[#EEF1EA] text-[#637066] hover:bg-[#E0E7DE]")}>{item}</button>)}</div></section><section className="divide-y divide-[#DFE4DC] border-y border-[#DDE2DB]">{filtered.map((meeting, index) => <article key={meeting.title} className="grid gap-4 px-1 py-5 sm:grid-cols-[78px_minmax(0,1fr)_auto] sm:px-3"><div className="flex gap-3 sm:block sm:border-r sm:border-[#DDE2DB]"><div className="font-editorial text-[39px] font-semibold leading-none tracking-[-0.07em] text-[#193B32]">{meeting.day}</div><div className="mt-1 text-[13px] font-bold tracking-[0.15em] text-[#A9533A]">{meeting.month} Â· 2026</div></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-editorial text-[21px] font-semibold tracking-[-0.035em] text-[#193B32]">{meeting.title}</h2><StatusPill tone={meeting.tone as "confirmed" | "review" | "pending"}>{meeting.status}</StatusPill></div><p className="mt-2 text-[14px] text-[#657268]">{meeting.council}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-[#657268]"><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-[#768C75]" />{meeting.time}</span><span className="inline-flex items-center gap-1.5"><UsersRound className="size-3.5 text-[#768C75]" />{18 + index * 2} confirmaÃ§Ãµes</span><span className="inline-flex items-center gap-1.5"><FileText className="size-3.5 text-[#768C75]" />{index === 0 ? "4 documentos" : "Pauta em andamento"}</span></div></div><div className="flex items-center sm:justify-end"><Button onClick={() => toast.success("PreparaÃ§Ã£o da reuniÃ£o selecionada.")} variant="outline" className="h-9 rounded-xl border-[#CBD4CA] bg-white px-3 text-[13px] font-bold text-[#285A43] hover:bg-[#EAF1E9]">Preparar <ArrowRight className="ml-1.5 size-3.5" /></Button></div></article>)}</section><section className="grid gap-px border border-[#DDE2DB] bg-[#DDE2DB] lg:grid-cols-3"><div className="bg-[#F6F7F2] p-5"><CircleDot className="size-5 text-[#A9533A]" /><p className="mt-4 text-[13px] font-bold uppercase tracking-[0.13em] text-[#607068]">Antes da reuniÃ£o</p><p className="mt-2 font-editorial text-[19px] font-semibold text-[#193B32]">Pauta e convocaÃ§Ã£o</p></div><div className="bg-[#F6F7F2] p-5"><Vote className="size-5 text-[#A9533A]" /><p className="mt-4 text-[13px] font-bold uppercase tracking-[0.13em] text-[#607068]">Durante</p><p className="mt-2 font-editorial text-[19px] font-semibold text-[#193B32]">PresenÃ§a, quÃ³rum e votos</p></div><div className="bg-[#F6F7F2] p-5"><CheckCircle2 className="size-5 text-[#A9533A]" /><p className="mt-4 text-[13px] font-bold uppercase tracking-[0.13em] text-[#607068]">Depois</p><p className="mt-2 font-editorial text-[19px] font-semibold text-[#193B32]">Ata, resoluÃ§Ã£o e aÃ§Ãµes</p></div></section></div>;
}

function DocumentsView() {
  const [type, setType] = useState("Todos");
  const filtered = type === "Todos" ? documents : documents.filter((document) => document.type === type);
  return <div className="space-y-7"><section className="relative overflow-hidden border border-[#DDE2DB] bg-[#F1EEE7] p-6"><div className="absolute inset-y-0 right-0 h-full w-[45%] bg-gradient-to-br from-[#173F34]/15 via-[#285A43]/10 to-transparent" /><div className="relative max-w-[530px]"><p className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#A9533A]">Acervo institucional</p><h2 className="mt-2 font-editorial text-[29px] font-semibold leading-[1.04] tracking-[-0.05em] text-[#193B32]">Contexto, versÃ£o e publicaÃ§Ã£o no mesmo documento.</h2><p className="mt-3 max-w-md text-[13px] leading-6 text-[#657268]">Cada arquivo guarda vÃ­nculo com o conselho, a reuniÃ£o ou o processo que lhe dÃ¡ origem.</p><ActionButton className="mt-5" onClick={() => toast.success("Envio de documento preparado para integraÃ§Ã£o.")}><Plus className="mr-2 size-4" />Adicionar documento</ActionButton></div></section><section className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDE2DB] pb-4"><div className="flex flex-wrap gap-2">{["Todos", "ATA", "RES", "PAUTA", "REL"].map((item) => <button key={item} onClick={() => setType(item)} className={cn("rounded-full px-3 py-1.5 text-[13px] font-bold transition", type === item ? "bg-[#173F34] text-white" : "bg-[#EEF1EA] text-[#637066] hover:bg-[#E0E7DE]")}>{item}</button>)}</div><p className="text-[13px] font-medium text-[#5E6C64]">{filtered.length} itens exibidos</p></section><section className="divide-y divide-[#E1E5DE] border-y border-[#DDE2DB]">{filtered.map((document) => <article key={document.title} className="group grid gap-3 px-2 py-4 sm:grid-cols-[47px_minmax(0,1fr)_auto] sm:items-center sm:px-3"><div className="grid size-10 place-items-center rounded-xl bg-[#EAF0E7] text-[13px] font-black tracking-[0.08em] text-[#285A43]">{document.type}</div><div className="min-w-0"><p className="truncate text-[13px] font-bold text-[#294038]">{document.title}</p><p className="mt-1 truncate text-[13px] text-[#5E6C64]">{document.context} Â· {document.file}</p></div><div className="flex items-center gap-3"><StatusPill tone={document.status === "Publicado" ? "confirmed" : document.status === "Em revisÃ£o" ? "review" : "private"}>{document.status}</StatusPill><button onClick={() => toast.message(`Download de â€œ${document.title}â€ estarÃ¡ disponÃ­vel apÃ³s a conexÃ£o com o armazenamento.`)} className="grid size-8 place-items-center rounded-lg text-[#526358] transition hover:bg-[#E5ECE3] hover:text-[#285A43]"><Download className="size-4" /></button></div></article>)}</section></div>;
}

function ReportsView() {
  const [active, setActive] = useState("ReuniÃµes");
  const reports = ["ReuniÃµes", "PresenÃ§a", "DeliberaÃ§Ãµes", "ResoluÃ§Ãµes", "PendÃªncias"];
  return <div className="space-y-7"><section className="grid gap-7 border-b border-[#DDE2DB] pb-7 lg:grid-cols-[0.95fr_1.45fr]"><div><p className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#A9533A]">Leitura de gestÃ£o</p><h2 className="mt-2 font-editorial text-[29px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#193B32]">Dados que sustentam a prestaÃ§Ã£o de contas.</h2><p className="mt-4 text-[13px] leading-6 text-[#657268]">Selecione o assunto e filtre o perÃ­odo antes de gerar uma visualizaÃ§Ã£o para consulta ou exportaÃ§Ã£o.</p></div><div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#607068]">Conselho</span><div className="mt-2 flex h-11 items-center justify-between border border-[#D5DDD4] bg-[#FCFBF7] px-3 text-[14px] font-semibold text-[#526358]">Todos os conselhos <ChevronDown className="size-4" /></div></label><label className="block"><span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#607068]">PerÃ­odo</span><div className="mt-2 flex h-11 items-center justify-between border border-[#D5DDD4] bg-[#FCFBF7] px-3 text-[14px] font-semibold text-[#526358]">Jan â€” Ago 2026 <CalendarDays className="size-4" /></div></label><div className="sm:col-span-2"><ActionButton onClick={() => toast.success("RelatÃ³rio gerado na visualizaÃ§Ã£o. A exportaÃ§Ã£o serÃ¡ ativada com o backend.")}><BarChart3 className="mr-2 size-4" />Gerar anÃ¡lise</ActionButton></div></div></section><section className="grid gap-7 lg:grid-cols-[225px_minmax(0,1fr)]"><nav className="flex gap-1 overflow-x-auto border-b border-[#DDE2DB] pb-2 lg:block lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">{reports.map((report, index) => <button key={report} onClick={() => setActive(report)} className={cn("flex shrink-0 items-center gap-3 px-3 py-2.5 text-left text-[14px] font-bold transition lg:w-full", active === report ? "bg-[#E8F0E8] text-[#285A43]" : "text-[#6F7B70] hover:bg-[#F2F4EF]")}><span className="text-[13px] text-[#A9533A]">0{index + 1}</span>{report}</button>)}</nav><article className="border border-[#DDE2DB] bg-[#FCFBF7] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#607068]">RelatÃ³rio selecionado</p><h3 className="mt-1 font-editorial text-[24px] font-semibold tracking-[-0.04em] text-[#193B32]">{active} por perÃ­odo</h3></div><StatusPill tone="confirmed">Pronto para exportar</StatusPill></div><div className="mt-8 grid gap-px border border-[#DDE2DB] bg-[#DDE2DB] sm:grid-cols-3"><div className="bg-[#F7F8F4] p-4"><p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#607068]">Total</p><p className="mt-2 font-editorial text-[29px] font-semibold tracking-[-0.05em] text-[#193B32]">{active === "PresenÃ§a" ? "88%" : "36"}</p></div><div className="bg-[#F7F8F4] p-4"><p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#607068]">VariaÃ§Ã£o</p><p className="mt-2 font-editorial text-[29px] font-semibold tracking-[-0.05em] text-[#285A43]">+12%</p></div><div className="bg-[#F7F8F4] p-4"><p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#607068]">PerÃ­odo</p><p className="mt-2 font-editorial text-[20px] font-semibold tracking-[-0.045em] text-[#193B32]">8 meses</p></div></div><div className="mt-7 flex h-32 items-end gap-2 border-b border-[#DDE2DB] pb-1">{[34, 55, 42, 75, 58, 89, 66, 96, 74, 86, 61, 84].map((height, index) => <div key={index} className="flex-1 bg-[#D6E2D5] transition hover:bg-[#285A43]" style={{ height: `${height}%` }} />)}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#6E7A70]"><span>Dados demonstrativos da interface.</span><button onClick={() => toast.message("A exportaÃ§Ã£o em PDF serÃ¡ processada por funÃ§Ã£o segura apÃ³s a conexÃ£o do backend.")} className="inline-flex items-center gap-1.5 font-bold text-[#285A43]">Exportar PDF <Download className="size-3.5" /></button></div></article></section></div>;
}

function GenericModule({ active }: { active: ModuleKey }) {
  const data = moduleTitles[active];
  const icons: Record<ModuleKey, typeof Landmark> = { dashboard: LayoutDashboard, conselhos: Landmark, membros: UsersRound, mandatos: ShieldCheck, reunioes: CalendarDays, pautas: ListChecks, votacoes: Vote, atas: BookOpen, resolucoes: FileText, documentos: FolderOpen, encaminhamentos: CheckCircle2, relatorios: BarChart3, auditoria: Activity, configuracoes: Settings2 };
  const Icon = icons[active];
  return (
    <Empty className="min-h-[420px] rounded-none border-[#DDE2DB] bg-[#FCFBF7] p-7">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-[#E8F0E8] text-[#285A43]">
          <Icon className="size-5" />
        </EmptyMedia>
        <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.15em] text-[#A9533A]">Módulo em preparação</p>
        <EmptyTitle className="font-editorial text-[28px] font-semibold tracking-[-0.045em] text-[#193B32]">{data.title}</EmptyTitle>
        <EmptyDescription className="mx-auto max-w-md text-[13px] leading-6 text-[#657268]">
          {data.description} A estrutura de navegação, permissões e estados já está prevista no MVP. A próxima etapa conecta esta tela à base Supabase e às regras de acesso.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => toast.success("Módulo registrado no roteiro de implementação do MVP.")} className="h-10 rounded-xl bg-[#173F34] px-4 text-[14px] font-semibold text-white hover:bg-[#245446]">
            <Sparkles className="mr-2 size-3.5" />Registrar prioridade
          </Button>
          <Button onClick={() => toast.message("A integração com o banco de dados será o próximo passo.")} variant="outline" className="h-10 rounded-xl border-[#CBD4CA] bg-white text-[14px] font-bold text-[#285A43] hover:bg-[#EAF1E9]">
            <ArrowRight className="mr-2 size-3.5" />Ver roteiro
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

const navGroups: { label: string; items: { key: ModuleKey; label: string; icon: typeof LayoutDashboard; route: string }[] }[] = [
  { label: "VisÃ£o geral", items: [{ key: "dashboard", label: "Painel", icon: LayoutDashboard, route: "/dashboard" }, { key: "conselhos", label: "Conselhos", icon: Landmark, route: "/conselhos" }, { key: "membros", label: "Membros", icon: UsersRound, route: "/membros" }, { key: "mandatos", label: "Mandatos", icon: ShieldCheck, route: "/mandatos" }] },
  { label: "Ciclo da reuniÃ£o", items: [{ key: "reunioes", label: "ReuniÃµes", icon: CalendarDays, route: "/reunioes" }, { key: "pautas", label: "Pautas", icon: ListChecks, route: "/pautas" }, { key: "votacoes", label: "VotaÃ§Ãµes", icon: Vote, route: "/votacoes" }, { key: "atas", label: "Atas", icon: BookOpen, route: "/atas" }, { key: "resolucoes", label: "ResoluÃ§Ãµes", icon: FileText, route: "/resolucoes" }] },
  { label: "Acervo e anÃ¡lise", items: [{ key: "documentos", label: "Documentos", icon: FolderOpen, route: "/documentos" }, { key: "encaminhamentos", label: "Encaminhamentos", icon: CheckCircle2, route: "/encaminhamentos" }, { key: "relatorios", label: "RelatÃ³rios", icon: BarChart3, route: "/relatorios" }, { key: "auditoria", label: "Auditoria", icon: Activity, route: "/auditoria" }] },
];

function SidebarNav({ active, onNavigate }: { active: ModuleKey; onNavigate: (route: string) => void }) {
  const { user, profile, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const go = (route: string) => { onNavigate(route); setLocation(route); };
  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pt-2"><CivicMark /></div>
      <nav aria-label="Navegação principal" className="sidebar-scroll mt-8 flex-1 overflow-y-auto pr-1">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-2 text-[13px] font-bold uppercase tracking-[0.15em] text-[#67756C]">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <a
                    key={item.key}
                    href={item.route}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(e) => { e.preventDefault(); go(item.route); }}
                    className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-[14px] font-semibold transition focus-visible:outline-none", isActive ? "bg-[#E8F0E8] text-[#285A43]" : "text-[#68756B] hover:bg-[#F1F3EE] hover:text-[#294038]")}
                  >
                    <Icon className={cn("size-4", isActive ? "text-[#A9533A]" : "text-[#607068]")} />
                    {item.label}
                    {item.key === "encaminhamentos" && (
                      <span className="ml-auto grid size-5 place-items-center rounded-full bg-[#F2E3DB] text-[13px] text-[#A9533A]">9</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-[#E0E5DE] pt-4">
        <a
          href="/configuracoes"
          onClick={(e) => { e.preventDefault(); go("/configuracoes"); }}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-[14px] font-semibold text-[#68756B] transition hover:bg-[#F1F3EE] focus-visible:outline-none"
        >
          <Settings2 className="size-4 text-[#607068]" />Configurações
        </a>
        <div className="mt-3 flex items-center gap-2.5 border border-[#E0E5DE] bg-[#F7F8F4] p-2.5">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-[#D5E2D3] text-[13px] font-bold text-[#285A43]">{profile?.full_name?.charAt(0) ?? user?.email?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[#294038]">{profile?.full_name ?? user?.email ?? "Usuário"}</p>
            <p className="truncate text-[13px] text-[#5E6C64]">{profile?.role ?? "membro"}</p>
          </div>
        </div>
        <button onClick={async () => { await signOut(); setLocation("/"); }} className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-bold text-[#A9533A] transition hover:bg-[#FDF3ED] focus-visible:outline-none">
          <LogOut className="size-3.5" />Sair
        </button>
      </div>
    </div>
  );
}

export function AdminWorkspace() {
  const [location, setLocation] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const active = routeToModule[location] ?? "dashboard";
  const title = moduleTitles[active];
  const { start, done } = useLoading();
  const { sessionExpired, setSessionExpired } = useAuth();

  const content = active === "dashboard" ? <Dashboard /> : active === "conselhos" ? <CouncilRegisterView /> : active === "reunioes" ? <MeetingsView /> : active === "documentos" ? <DocumentsView /> : active === "relatorios" ? <AccountabilityReportView /> : <GenericModule active={active} />;

  const go = (route: string) => {
    if (route === location) return;
    setMobileNav(false);
    setPaletteOpen(false);
    setTransitioning(true);
    start();
    setLocation(route);
    window.setTimeout(() => { setTransitioning(false); done(); }, 200);
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#193B32]">
      <a href="#conteudo-principal" className="skip-link">Pular para o conteúdo</a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[266px] flex-col border-r border-[#D5DDD4] bg-[#FCFBF7] px-4 py-5 lg:flex">
        <SidebarNav active={active} onNavigate={go} />
      </aside>

      <div className="lg:hidden">
        <Sheet open={mobileNav} onOpenChange={setMobileNav}>
          <SheetContent side="left" className="w-[280px] border-r border-[#D5DDD4] bg-[#FCFBF7] p-4">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <SheetDescription className="sr-only">Navegação dos módulos</SheetDescription>
            <SidebarNav active={active} onNavigate={go} />
          </SheetContent>
        </Sheet>
      </div>

      <main id="conteudo-principal" className="min-h-screen lg:pl-[266px]">
        <div className="mx-auto max-w-[1360px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#DDE2DB] pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileNav(true)} aria-label="Abrir menu" className="grid size-9 place-items-center rounded-lg border border-[#D5DDD4] bg-[#FCFBF7] text-[#285A43] transition hover:bg-[#EAF1E9] focus-visible:outline-none lg:hidden">
                <Menu className="size-4" />
              </button>
              <nav aria-label="Trilha" className="flex items-center gap-1.5 text-[13px] font-semibold text-[#607068]">
                <button onClick={() => go("/dashboard")} className="transition hover:text-[#285A43] focus-visible:outline-none">Gestão</button>
                <ChevronRight className="size-3 text-[#A9B1A8]" />
                <span className="text-[#294038]">{title.title}</span>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPaletteOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D5DDD4] bg-[#FCFBF7] px-3 text-[14px] font-semibold text-[#536358] transition hover:border-[#285A43] hover:text-[#285A43] focus-visible:outline-none">
                <Search className="size-3.5" />Buscar <kbd className="hidden rounded border border-[#DDE2DB] bg-[#F1F3EE] px-1 text-[13px] text-[#5E6C64] sm:inline">Ctrl K</kbd>
              </button>
              <HelpTip text={moduleHelp[active]} />
            </div>
          </div>
          <div className="pb-8">
            <CivicRail active={active} />
            {transitioning ? <ModuleSkeleton /> : content}
          </div>
        </div>
        <Footer />
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <SessionExpiredDialog open={sessionExpired} />
      <OnboardingTour />
    </div>
  );
}


export function PublicPortal() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const publicCards = [
    { index: "01", title: "Conselhos", copy: "ConheÃ§a atribuiÃ§Ãµes, composiÃ§Ã£o e calendÃ¡rio de cada colegiado.", icon: Landmark },
    { index: "02", title: "Agenda pÃºblica", copy: "Acompanhe reuniÃµes, pautas e os prÃ³ximos espaÃ§os de participaÃ§Ã£o.", icon: CalendarDays },
    { index: "03", title: "DecisÃµes", copy: "Consulte atas, resoluÃ§Ãµes e documentos jÃ¡ publicados.", icon: BookOpen },
  ];
  return <div className="min-h-screen overflow-hidden bg-[#F8F7F2] text-[#193B32]"><header className="relative z-20 mx-auto flex max-w-[1360px] items-center justify-between px-5 py-5 sm:px-8"><CivicMark /><nav className="hidden items-center gap-7 lg:flex"><a href="#transparencia" className="text-[14px] font-bold text-[#5C6B61] hover:text-[#A9533A]">TransparÃªncia</a><a href="#conselhos" className="text-[14px] font-bold text-[#5C6B61] hover:text-[#A9533A]">Conselhos</a><a href="#participacao" className="text-[14px] font-bold text-[#5C6B61] hover:text-[#A9533A]">ParticipaÃ§Ã£o social</a><button onClick={() => setLocation("/dashboard")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#C9D2C8] bg-[#FCFBF7] px-4 text-[14px] font-bold text-[#285A43] transition hover:border-[#285A43]">Acessar gestÃ£o <ArrowRight className="size-3.5" /></button></nav><button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-xl border border-[#D1D9D0] bg-[#FCFBF7] text-[#285A43] lg:hidden"><Menu className="size-4" /></button>{menuOpen && <div className="absolute right-5 top-[70px] w-60 border border-[#D5DDD4] bg-[#FCFBF7] p-3 shadow-[0_18px_50px_rgba(23,63,52,0.15)] sm:right-8 lg:hidden"><a className="block px-3 py-2 text-[14px] font-bold text-[#536358]" href="#transparencia">TransparÃªncia</a><a className="block px-3 py-2 text-[14px] font-bold text-[#536358]" href="#conselhos">Conselhos</a><button onClick={() => setLocation("/dashboard")} className="mt-2 w-full bg-[#173F34] px-3 py-2.5 text-left text-[14px] font-bold text-white">Acessar gestÃ£o</button></div>}</header><main><section className="relative mx-auto grid max-w-[1360px] gap-6 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[0.93fr_1.07fr] lg:pb-16 lg:pt-14"><div className="relative z-10 flex flex-col justify-center lg:pb-9"><div className="mb-6 inline-flex w-fit items-center gap-2 border-l-2 border-[#C46C4B] pl-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[#A9533A]"><span className="size-1.5 rounded-full bg-[#C46C4B]" />TransparÃªncia que se acompanha</div><h1 className="max-w-[640px] font-sans text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#173F34] sm:text-[54px]">DecisÃµes pÃºblicas, <em className="font-bold text-[#A9533A]">memÃ³ria viva.</em></h1><p className="mt-6 max-w-[520px] text-[15px] leading-7 text-[#59685D]">O ConselhoOS organiza o trabalho dos colegiados e torna mais simples acompanhar reuniÃµes, resoluÃ§Ãµes e espaÃ§os de participaÃ§Ã£o social.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => document.getElementById("conselhos")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex h-11 items-center gap-2 bg-[#173F34] px-5 text-[13px] font-bold text-white shadow-[0_9px_20px_rgba(23,63,52,0.16)] transition hover:bg-[#285A43]">Explorar os conselhos <ArrowRight className="size-4" /></button><button onClick={() => document.getElementById("participacao")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex h-11 items-center gap-2 border border-[#C9D2C8] bg-[#FCFBF7] px-5 text-[13px] font-bold text-[#285A43] transition hover:bg-white">Participar de consulta <ExternalLink className="size-3.5" /></button></div><div className="mt-11 flex items-center gap-6"><div><p className="font-editorial text-[28px] font-semibold tracking-[-0.05em] text-[#173F34]">4</p><p className="mt-1 text-[13px] font-bold uppercase tracking-[0.11em] text-[#748176]">Conselhos ativos</p></div><div className="h-8 w-px bg-[#D1D9D0]" /><div><p className="font-editorial text-[28px] font-semibold tracking-[-0.05em] text-[#173F34]">36</p><p className="mt-1 text-[13px] font-bold uppercase tracking-[0.11em] text-[#748176]">ResoluÃ§Ãµes em 2026</p></div><div className="h-8 w-px bg-[#D1D9D0]" /><div><p className="font-editorial text-[28px] font-semibold tracking-[-0.05em] text-[#173F34]">88%</p><p className="mt-1 text-[13px] font-bold uppercase tracking-[0.11em] text-[#748176]">PresenÃ§a mÃ©dia</p></div></div></div><div className="relative min-h-[430px] overflow-hidden bg-[#DCE5D9] sm:min-h-[500px]"><div className="absolute inset-0 bg-gradient-to-br from-[#173F34]/40 via-[#285A43]/25 to-[#C46C4B]/30" /><div className="absolute inset-0 bg-gradient-to-t from-[#173F34]/45 via-transparent to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8"><div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.16em] text-[#E7DFAE]"><span className="size-1.5 rounded-full bg-[#E7DFAE]" />Em destaque</div><p className="mt-2 max-w-sm font-editorial text-[25px] font-semibold leading-[1.05] tracking-[-0.035em]">24Âª ReuniÃ£o OrdinÃ¡ria do Conselho Municipal de SaÃºde</p><p className="mt-3 text-[14px] font-medium text-white/80">28 de agosto Â· 14h Â· Sala PlenÃ¡ria</p></div></div></section><section id="transparencia" className="border-y border-[#D7DED5] bg-[#EFF3EB]"><div className="mx-auto grid max-w-[1360px] gap-px px-5 sm:px-8 lg:grid-cols-3">{publicCards.map((card) => { const Icon = card.icon; return <article key={card.title} className="group border-l border-[#D7DED5] px-5 py-8 first:border-l-0 lg:px-8"><div className="flex items-start justify-between"><span className="text-[13px] font-bold tracking-[0.15em] text-[#A9533A]">{card.index}</span><Icon className="size-5 text-[#617661] transition group-hover:text-[#A9533A]" /></div><h2 className="mt-8 font-editorial text-[26px] font-semibold tracking-[-0.045em] text-[#193B32]">{card.title}</h2><p className="mt-3 max-w-[280px] text-[13px] leading-6 text-[#637066]">{card.copy}</p><button onClick={() => toast.message(`A seÃ§Ã£o â€œ${card.title}â€ serÃ¡ alimentada pelos dados pÃºblicos apÃ³s integraÃ§Ã£o.`)} className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-[#285A43]">Consultar <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></button></article>; })}</div></section><section id="conselhos" className="mx-auto grid max-w-[1360px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.64fr_1.36fr] lg:py-24"><div><p className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#A9533A]">Conselhos em atividade</p><h2 className="mt-3 font-editorial text-[39px] font-semibold leading-[0.99] tracking-[-0.055em] text-[#173F34]">InstituiÃ§Ãµes que dialogam com a cidade.</h2><p className="mt-5 max-w-sm text-[14px] leading-7 text-[#647166]">Cada conselho possui uma pÃ¡gina prÃ³pria para apresentar suas competÃªncias, integrantes, agenda e decisÃµes publicadas.</p><button onClick={() => toast.message("A lista pÃºblica serÃ¡ conectada Ã  publicaÃ§Ã£o dos conselhos ativos.")} className="mt-7 inline-flex items-center gap-2 text-[14px] font-bold text-[#285A43]">Conhecer todos <ArrowRight className="size-3.5" /></button></div><div className="border-t border-[#D6DDD4]">{councils.map((council) => <button key={council.acronym} onClick={() => toast.message(`PÃ¡gina pÃºblica do ${council.name} em preparaÃ§Ã£o.`)} className="group grid w-full grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#D6DDD4] py-5 text-left"><span className="grid size-10 place-items-center rounded-full text-[13px] font-black tracking-[0.07em] text-white" style={{ background: council.color }}>{council.acronym}</span><div><p className="font-editorial text-[21px] font-semibold tracking-[-0.035em] text-[#193B32]">{council.name}</p><p className="mt-1 text-[13px] text-[#748075]">{council.members} membros Â· {council.meetings}</p></div><ArrowUpRight className="size-4 text-[#97A196] transition group-hover:text-[#A9533A]" /></button>)}</div></section><section id="participacao" className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 lg:pb-24"><div className="relative overflow-hidden bg-[#173F34] p-7 text-white sm:p-10 lg:p-14"><div className="absolute inset-y-0 right-0 h-full w-[48%] bg-gradient-to-bl from-[#E7DFAE]/20 via-[#285A43]/30 to-[#A9533A]/25" /><div className="relative max-w-[610px]"><div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.16em] text-[#E7DFAE]"><Sparkles className="size-3.5" />ParticipaÃ§Ã£o social</div><h2 className="mt-4 font-editorial text-[39px] font-semibold leading-[0.99] tracking-[-0.055em] text-white">Toda contribuiÃ§Ã£o merece um caminho de resposta.</h2><p className="mt-5 max-w-lg text-[14px] leading-7 text-[#D6E2D7]">Consultas pÃºblicas organizadas por tema, prazo e conselho responsÃ¡vel â€” com registro de contribuiÃ§Ãµes e devolutivas publicadas.</p><button onClick={() => toast.message("Nenhuma consulta pÃºblica aberta nesta demonstraÃ§Ã£o.")} className="mt-8 inline-flex h-11 items-center gap-2 bg-[#E7DFAE] px-5 text-[13px] font-bold text-[#294038] transition hover:bg-white">Ver consultas abertas <ArrowRight className="size-4" /></button></div></div></section></main>
  <Footer /></div>
};

