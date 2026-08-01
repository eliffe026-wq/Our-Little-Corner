import { useEffect, useState } from 'react';

const DECORATIONS = ['🎀', '🌸', '⭐', '🦋', '🌷', '✨'];

export default function FloatingDecorations() {
  const [items, setItems] = useState<{ id: number; x: number; y: number; text: string; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 15;
    
    const newItems = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      text: DECORATIONS[Math.floor(Math.random() * DECORATIONS.length)],
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
    }));
    
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-2xl animate-float opacity-50"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animation: `float ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.text}
        </div>
      ))}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.6; }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
