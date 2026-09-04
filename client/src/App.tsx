/**
 * Caderno Cívico: o roteamento separa a transparência pública do espaço de gestão institucional.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedAdmin } from "./components/ProtectedRoute";
import { LoadingProvider } from "./contexts/LoadingContext";

const PublicPortal = lazy(() => import("./pages/Delibera").then((m) => ({ default: m.PublicPortal })));
const LazyAdminWorkspace = lazy(() => import("./pages/Delibera").then((m) => ({ default: m.AdminWorkspace })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#193B32]">
      <div className="mx-auto flex min-h-screen max-w-[1360px] items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl space-y-6">
          <div className="h-3 w-40 animate-pulse rounded bg-[#E3E8E0]" />
          <div className="h-10 w-72 animate-pulse rounded bg-[#E3E8E0]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded border border-[#DDE2DB] bg-[#FCFBF7]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRoutes() {
  return (
    <ProtectedAdmin>
      <Suspense fallback={<PageLoader />}>
        <LazyAdminWorkspace />
      </Suspense>
    </ProtectedAdmin>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <Suspense fallback={<PageLoader />}>
          <PublicPortal />
        </Suspense>
      </Route>
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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LoadingProvider>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </LoadingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
