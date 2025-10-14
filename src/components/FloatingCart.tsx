import { ShoppingCart, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface FloatingCartProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const FloatingCart = ({ items, onRemoveItem, onCheckout }: FloatingCartProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full gradient-primary shadow-glow hover:scale-110 transition-smooth z-50"
        size="icon"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground animate-bounce-gentle">
            {itemCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 max-h-96 overflow-y-auto gradient-card border-2 border-primary/20 shadow-glow z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary animate-heart-beat" />
              Meu Carrinho
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Seu carrinho está vazio 💕
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-2 rounded-lg bg-background/50">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x R$ {item.price.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={onCheckout}
                  className="w-full gradient-primary hover:shadow-glow transition-smooth"
                  size="lg"
                >
                  Finalizar Compra 💕
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};