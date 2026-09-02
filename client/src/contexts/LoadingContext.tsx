import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

type LoadingContextType = {
  start: (key?: string) => void;
  done: (key?: string) => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [busy, setBusy] = useState(0);
  const count = useRef(0);

  const start = useCallback(() => {
    count.current += 1;
    setBusy(count.current);
  }, []);

  const done = useCallback(() => {
    count.current = Math.max(0, count.current - 1);
    setBusy(count.current);
  }, []);

  return (
    <LoadingContext.Provider value={{ start, done }}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent transition-opacity duration-200",
          busy > 0 ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="loading-bar" />
      </div>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading deve ser usado dentro de LoadingProvider");
  return ctx;
}
