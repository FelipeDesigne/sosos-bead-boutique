import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Sparkles } from "lucide-react";
import { Session } from "@supabase/supabase-js";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          navigate("/admin");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Conta criada com sucesso! 💕",
          description: "Você já pode fazer login.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Bem-vinda de volta! 💕",
          description: "Login realizado com sucesso.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ops! 😢",
        description: error.message || "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-20 left-10 w-8 h-8 text-primary/20 animate-float" />
        <Sparkles className="absolute top-40 right-20 w-6 h-6 text-accent/30 animate-bounce-gentle" />
        <Heart className="absolute bottom-32 left-1/4 w-6 h-6 text-primary/20 animate-float" />
        <Sparkles className="absolute bottom-20 right-1/3 w-8 h-8 text-accent/30 animate-bounce-gentle" />
      </div>

      <Card className="w-full max-w-md gradient-card border-2 border-primary/20 shadow-glow">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary animate-heart-beat" fill="currentColor" />
          </div>
          <CardTitle className="text-2xl text-primary">
            {isSignUp ? "Criar Conta" : "Entrar"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Crie sua conta para gerenciar as pulseirinhas 💕" 
              : "Entre para acessar o painel administrativo ✨"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="seu-email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-primary/30 focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary hover:shadow-glow transition-smooth"
              size="lg"
              disabled={loading}
            >
              {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80"
            >
              {isSignUp 
                ? "Já tem uma conta? Entre aqui" 
                : "Não tem conta? Crie uma aqui"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}