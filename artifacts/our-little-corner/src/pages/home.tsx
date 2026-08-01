import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreateModal } from "@/components/create-modal";
import { Heart } from "lucide-react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 text-4xl opacity-50 rotate-[-12deg]">🎀</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-50 rotate-[15deg]">🌷</div>
      <div className="absolute top-40 right-20 text-3xl opacity-40 rotate-[5deg]">🌸</div>
      <div className="absolute bottom-40 left-20 text-3xl opacity-40 rotate-[-8deg]">⭐</div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col items-center text-center max-w-md px-6 z-10"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-6xl mb-6 drop-shadow-md"
            >
              💌
            </motion.div>
            
            <h1 className="font-serif text-3xl md:text-4xl text-primary mb-4 leading-tight">
              Someone made a little corner of the internet just for you...
            </h1>
            <p className="font-handwritten text-2xl text-muted-foreground mb-12">
              Happy Friendship Day.
            </p>

            <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
              {/* Envelope graphic CSS */}
              <div className="w-64 h-40 bg-[#f8e3e5] rounded-lg shadow-lg relative flex items-center justify-center border border-[#f0d0d3] overflow-hidden transition-transform group-hover:scale-105 duration-300">
                {/* Envelope Flap */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-40">
                    <polygon fill="#eebfc3" points="0,0 100,0 50,50" />
                  </svg>
                </div>
                {/* Ribbon */}
                <div className="absolute top-0 bottom-0 left-1/2 -ml-2 w-4 bg-[#d49ea4]/40 z-10"></div>
                <div className="absolute top-1/2 left-0 right-0 -mt-2 h-4 bg-[#d49ea4]/40 z-10"></div>
                
                {/* Wax seal */}
                <div className="w-12 h-12 bg-primary rounded-full z-20 shadow-md flex items-center justify-center border-[3px] border-primary/80 relative">
                  <Heart className="w-5 h-5 text-white/90 fill-white/90" />
                  <div className="absolute inset-0 rounded-full border-t border-white/30 rotate-45"></div>
                </div>
              </div>
              <motion.div 
                className="mt-6 flex justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="font-serif text-lg text-primary-foreground bg-primary px-8 py-3 rounded-full shadow-md flex items-center gap-2 hover:bg-primary/90 transition-colors">
                  🎀 Open My Letter
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="flex flex-col items-center justify-center max-w-2xl px-6 w-full z-10"
          >
            <div className="scrapbook-card w-full mb-12 p-8 md:p-12 text-center relative max-w-xl mx-auto">
              <div className="washi-tape washi-tape-pink"></div>
              <div className="washi-tape washi-tape-blue -bottom-3 -right-4 top-auto left-auto rotate-12"></div>
              
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5, staggerChildren: 0.5 }}
                className="space-y-6 font-handwritten text-2xl md:text-3xl text-foreground leading-relaxed"
              >
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  Happy Friendship Day ❤️
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  No matter where life takes us...
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
                  Thank you for existing.
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }}>
                  You make life brighter.
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6 }} className="text-primary font-bold">
                  I'm really grateful our paths crossed.
                </motion.p>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 3.5 }}
            >
              <CreateModal trigger={
                <button className="font-serif text-xl md:text-2xl text-primary-foreground bg-primary px-10 py-4 rounded-full shadow-lg flex items-center gap-3 hover:scale-105 hover:bg-primary/90 transition-all">
                  🎀 Create Our Little Corner
                </button>
              } />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateModal />
    </div>
  );
}
