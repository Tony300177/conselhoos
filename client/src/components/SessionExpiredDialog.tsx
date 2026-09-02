import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export function SessionExpiredDialog({ open }: { open: boolean }) {
  const { signOut } = useAuth();
  const [, setLocation] = useLocation();

  const handleExit = async () => {
    await signOut();
    setLocation("/login");
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-xl bg-[#F2E3DB] text-[#A9533A]">
          <AlertTriangle className="size-5" />
        </div>
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">Sessão expirada</DialogTitle>
          <DialogDescription className="text-center">
            Sua sessão chegou ao fim por inatividade ou expiração do token. Entre novamente para continuar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleExit} className="h-10 rounded-xl bg-[#173F34] px-5 text-[13px] font-semibold text-white hover:bg-[#245446]">
            Voltar ao login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
