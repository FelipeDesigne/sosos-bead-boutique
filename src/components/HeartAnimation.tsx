import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface HeartAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export const HeartAnimation = ({ show, onComplete }: HeartAnimationProps) => {
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
    if (show) {
      const newHearts = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        left: 20 + Math.random() * 60,
      }));
      setHearts(newHearts);

      const timer = setTimeout(() => {
        setHearts([]);
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          className="absolute bottom-0 text-primary animate-float"
          style={{
            left: `${heart.left}%`,
            animation: `float 2s ease-out forwards`,
            fill: "currentColor",
            width: "2rem",
            height: "2rem",
          }}
        />
      ))}
    </div>
  );
};