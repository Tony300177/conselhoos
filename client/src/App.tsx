/**
 * Caderno Cívico: o roteamento separa a transparência pública do espaço de gestão institucional.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedAdmin } from "./components/ProtectedRoute";
import { AdminWorkspace, PublicPortal } from "./pages/ConselhoOS";


function AdminRoutes() {
  return (
    <ProtectedAdmin>
      <AdminWorkspace />
    </ProtectedAdmin>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={PublicPortal} />
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={AdminRoutes} />
      <Route path={"/conselhos"} component={AdminRoutes} />
      <Route path={"/membros"} component={AdminRoutes} />
      <Route path={"/mandatos"} component={AdminRoutes} />
      <Route path={"/reunioes"} component={AdminRoutes} />
      <Route path={"/pautas"} component={AdminRoutes} />
      <Route path={"/votacoes"} component={AdminRoutes} />
      <Route path={"/atas"} component={AdminRoutes} />
      <Route path={"/resolucoes"} component={AdminRoutes} />
      <Route path={"/documentos"} component={AdminRoutes} />
      <Route path={"/encaminhamentos"} component={AdminRoutes} />
      <Route path={"/relatorios"} component={AdminRoutes} />
      <Route path={"/auditoria"} component={AdminRoutes} />
      <Route path={"/configuracoes"} component={AdminRoutes} />
      <Route path={"/404"} component={NotFound} />
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
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
