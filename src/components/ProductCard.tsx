import { ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  onAddToCart: (product: { id: string; name: string; price: number; imageUrl: string }) => void;
}

export const ProductCard = ({ id, name, description, price, imageUrl, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="gradient-card border-2 border-primary/20 overflow-hidden hover:shadow-glow transition-smooth hover:scale-105">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <Sparkles className="absolute top-2 right-2 w-6 h-6 text-accent animate-pulse" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-bold text-primary mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-primary">R$ {price.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onAddToCart({ id, name, price, imageUrl })}
          className="w-full gradient-primary hover:shadow-glow transition-smooth"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Adicionar ao carrinho
        </Button>
      </CardFooter>
    </Card>
  );
};