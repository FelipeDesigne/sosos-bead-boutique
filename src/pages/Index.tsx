import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { FloatingCart } from "@/components/FloatingCart";
import { Header } from "@/components/Header";
import { HeartAnimation } from "@/components/HeartAnimation";
import { useToast } from "@/hooks/use-toast";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showHearts, setShowHearts] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar produtos:", error);
    } else {
      setProducts(data || []);
    }
  };

  const addToCart = (product: { id: string; name: string; price: number; imageUrl: string }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setShowHearts(true);
    
    toast({
      title: "Pulseirinha adicionada! 💕",
      description: `${product.name} foi adicionada ao carrinho.`,
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Item removido",
      description: "Produto removido do carrinho.",
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const whatsappNumber = "5514981181568"; // SUBSTITUIR PELO NÚMERO REAL
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let message = "Olá Soso 💕! Quero comprar essas pulseirinhas:\n\n";
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\nTotal: R$ ${total.toFixed(2)}\n\nPode me confirmar o pedido?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "Pedido enviado com sucesso! 💕",
      description: "A Soso já recebeu seu pedido no WhatsApp.",
    });
    
    setCartItems([]);
  };

  return (
    <div className="min-h-screen gradient-soft">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Heart className="absolute top-0 left-10 w-8 h-8 text-primary/20 animate-float" />
            <Sparkles className="absolute top-5 right-20 w-6 h-6 text-accent/30 animate-bounce-gentle" />
            <Heart className="absolute bottom-0 left-1/4 w-6 h-6 text-primary/20 animate-float" />
          </div>
          
          <h2 className="text-4xl font-bold text-primary mb-4">
            Nossas Pulseirinhas 💕
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Cada uma feita com muito carinho e miçangas coloridas!
          </p>
          
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="border-primary/30 hover:bg-primary/10"
          >
            Sou a Soso - Entrar no Painel
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary/50 animate-bounce-gentle" />
            <p className="text-xl text-muted-foreground">
              Em breve teremos pulseirinhas lindas por aqui! ✨
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description || ""}
                price={product.price}
                imageUrl={product.image_url}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="gradient-primary py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-white animate-heart-beat" fill="white" />
            <p className="text-white font-semibold">
              Feito com amor e miçangas
            </p>
            <Heart className="w-5 h-5 text-white animate-heart-beat" fill="white" />
          </div>
          <p className="text-white/80 text-sm">
            Pulseirinhas da Soso ✨ 2024
          </p>
        </div>
      </footer>

      <FloatingCart
        items={cartItems}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <HeartAnimation
        show={showHearts}
        onComplete={() => setShowHearts(false)}
      />
    </div>
  );
}