/**
 * Caderno Cívico: o roteamento separa a transparência pública do espaço de gestão institucional.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminWorkspace, PublicPortal } from "./pages/ConselhoOS";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={PublicPortal} />
      <Route path={"/dashboard"} component={AdminWorkspace} />
      <Route path={"/conselhos"} component={AdminWorkspace} />
      <Route path={"/membros"} component={AdminWorkspace} />
      <Route path={"/mandatos"} component={AdminWorkspace} />
      <Route path={"/reunioes"} component={AdminWorkspace} />
      <Route path={"/pautas"} component={AdminWorkspace} />
      <Route path={"/votacoes"} component={AdminWorkspace} />
      <Route path={"/atas"} component={AdminWorkspace} />
      <Route path={"/resolucoes"} component={AdminWorkspace} />
      <Route path={"/documentos"} component={AdminWorkspace} />
      <Route path={"/encaminhamentos"} component={AdminWorkspace} />
      <Route path={"/relatorios"} component={AdminWorkspace} />
      <Route path={"/auditoria"} component={AdminWorkspace} />
      <Route path={"/configuracoes"} component={AdminWorkspace} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
