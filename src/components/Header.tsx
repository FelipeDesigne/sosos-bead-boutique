import { Heart, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  isAdmin?: boolean;
}

export const Header = ({ isAdmin = false }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Até logo! 💕",
      description: "Você saiu da sua conta.",
    });
    navigate("/");
  };

  return (
    <header className="gradient-primary shadow-soft sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-soft animate-bounce-gentle">
              <Heart className="w-7 h-7 text-primary" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Pulseirinhas da Soso
              </h1>
              <p className="text-xs text-white/90">✨ Feitas com amor e miçangas ✨</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/admin")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Settings className="w-4 h-4 mr-2" />
                Painel Admin
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};