import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGetGarden } from "@workspace/api-client-react";
import { getGetGardenQueryKey } from "@workspace/api-client-react";

interface FriendshipGardenProps {
  slug: string;
}

export default function FriendshipGarden({ slug }: FriendshipGardenProps) {
  const { data: stats } = useGetGarden(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetGardenQueryKey(slug),
    }
  });

  const [elements, setElements] = useState<{ type: string; emoji: string; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    if (!stats) return;

    const newElements = [];
    
    // Flowers (bottom 30% of area)
    const flowerEmojis = ['🌷', '🌸', '🌹', '🌺', '🌻', '🌼'];
    for (let i = 0; i < stats.flowerCount; i++) {
      newElements.push({
        type: 'flower',
        emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
        x: Math.random() * 90 + 5,
        y: 70 + Math.random() * 20,
        delay: Math.random() * 2,
      });
    }

    // Butterflies (upper 70% of area)
    const butterflyEmojis = ['🦋', '✨', '🤍'];
    for (let i = 0; i < stats.butterflyCount; i++) {
      newElements.push({
        type: 'butterfly',
        emoji: butterflyEmojis[Math.floor(Math.random() * butterflyEmojis.length)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 5,
        delay: Math.random() * 5,
      });
    }

    setElements(newElements);
  }, [stats]);

  if (!stats) return null;

  return (
    <section className="flex flex-col items-center justify-center w-full my-16">
      <h2 className="text-3xl font-serif text-primary mb-8 text-center">🌸 Our Living Garden</h2>
      <p className="text-muted-foreground font-sans text-center mb-6 max-w-md">
        This garden grows as you interact. More memories bring flowers, diary answers bring butterflies!
      </p>

      <div className="relative w-full max-w-4xl h-[400px] bg-gradient-to-b from-sky-100 to-green-100 rounded-3xl shadow-inner border border-green-200 overflow-hidden">
        {/* The Tree */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute bottom-10 left-[10%] text-[120px] origin-bottom drop-shadow-md z-10"
          style={{ transform: `scale(${1 + (stats.treeLevel * 0.1)})` }}
        >
          🌳
        </motion.div>

        {/* Tree blossoms if promises exist */}
        {Array.from({ length: stats.promiseBlossoms }).map((_, i) => (
          <motion.div
            key={`blossom-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + (i * 0.2) }}
            className="absolute z-20 text-2xl drop-shadow-sm"
            style={{
              left: `${15 + (Math.random() * 10)}%`,
              bottom: `${150 + (Math.random() * 100)}px`,
            }}
          >
            🌸
          </motion.div>
        ))}

        {/* Generated Elements */}
        {elements.map((el, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: el.type === 'flower' ? 20 : 0 }}
            animate={{ 
              opacity: 1, 
              y: el.type === 'flower' ? 0 : [0, -15, 0],
              x: el.type === 'butterfly' ? [0, 15, 0] : 0 
            }}
            transition={{ 
              opacity: { delay: el.delay, duration: 0.5 },
              y: el.type === 'butterfly' ? { repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut", delay: el.delay } : { duration: 0.5 },
              x: el.type === 'butterfly' ? { repeat: Infinity, duration: 4 + Math.random() * 2, ease: "easeInOut", delay: el.delay } : { duration: 0.5 }
            }}
            className="absolute text-3xl drop-shadow-sm z-20"
            style={{ left: `${el.x}%`, top: `${el.y}%` }}
          >
            {el.emoji}
          </motion.div>
        ))}

        {/* Grass layer */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-green-300 to-transparent opacity-60 pointer-events-none" />
      </div>
    </section>
  );
}
