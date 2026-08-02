import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useGetScrapbook } from "@workspace/api-client-react";
import { getGetScrapbookQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CreateModal } from "@/components/create-modal";
import GuestNotesSection from "@/components/guest-notes-section";

// Import sections
import EnvelopeSection from "@/components/envelope";
import DiarySection from "@/components/diary-section";
import MemoryBoard from "@/components/memory-board";
import FriendshipGarden from "@/components/friendship-garden";
import PromiseTree from "@/components/promise-tree";
import NotesSection from "@/components/notes-section";
import MoodSection from "@/components/mood-section";

export default function Scrapbook() {
  const { slug } = useParams();
  const [userName, setUserName] = useState<string>("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState("");

  const { data: scrapbook, isLoading, error } = useGetScrapbook(slug || "", {
    query: {
      enabled: !!slug,
      queryKey: getGetScrapbookQueryKey(slug || ""),
      retry: false,
    },
  });

  useEffect(() => {
    if (slug && scrapbook) {
      const storedName = localStorage.getItem(`olc_username_${slug}`);
      if (storedName) {
        setUserName(storedName);
      } else {
        setShowNameModal(true);
      }
    }
  }, [slug, scrapbook]);

  // Accepts an optional name to allow one-click name buttons to save immediately
  const saveName = (nameOverride?: string) => {
    const name = (nameOverride ?? tempName).trim();
    if (name && slug) {
      localStorage.setItem(`olc_username_${slug}`, name);
      setUserName(name);
      setShowNameModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !scrapbook) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="text-4xl font-serif text-primary">This corner doesn't exist yet</h1>
        <p className="text-muted-foreground font-sans text-lg">Maybe the URL is wrong, or it hasn't been created.</p>
        <Button onClick={() => window.location.href = "/"} className="mt-4 rounded-full px-8 text-lg h-12">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-40 relative">
      {/* Dynamic Background based on Theme */}
      <div className="fixed inset-0 pointer-events-none z-[-2] opacity-30" 
        style={{
          background: scrapbook.theme === 'ocean' ? 'linear-gradient(to bottom, #e0f2fe, #bfdbfe)' :
                      scrapbook.theme === 'sunny' ? 'linear-gradient(to bottom, #fef08a, #fde047)' :
                      scrapbook.theme === 'lavender' ? 'linear-gradient(to bottom, #e9d5ff, #d8b4fe)' :
                      'linear-gradient(to bottom, #fce7f3, #fbcfe8)' // default rosette
        }}
      />
      
      <header className="w-full py-8 md:py-12 px-6 text-center space-y-2 relative z-10 bg-white/40 backdrop-blur-md border-b border-white/50 shadow-sm">
        <h1 className="text-4xl md:text-6xl font-serif text-primary flex items-center justify-center gap-4 drop-shadow-sm">
          <span>{scrapbook.creatorName}</span>
          <span className="text-3xl md:text-4xl animate-pulse">{scrapbook.favoriteEmoji}</span>
          <span>{scrapbook.friendName}</span>
        </h1>
        {scrapbook.nickname && (
          <p className="font-handwritten text-2xl md:text-3xl text-muted-foreground/80 mt-2">
            a.k.a {scrapbook.nickname}
          </p>
        )}
      </header>

      {userName && (
        <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-24 md:space-y-32 mt-8 overflow-x-hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <EnvelopeSection slug={slug!} userName={userName} initialMessage={scrapbook.initialMessage} creatorName={scrapbook.creatorName} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
            <MoodSection slug={slug!} userName={userName} friendName={userName === scrapbook.creatorName ? scrapbook.friendName : scrapbook.creatorName} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
            <DiarySection slug={slug!} userName={userName} friendName={userName === scrapbook.creatorName ? scrapbook.friendName : scrapbook.creatorName} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
            <MemoryBoard slug={slug!} userName={userName} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
            <NotesSection slug={slug!} userName={userName} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
            <PromiseTree slug={slug!} userName={userName} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
            <FriendshipGarden slug={slug!} />
          </motion.div>

          {/* ── Visitors' Wall ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full border-t border-primary/10 pt-16">
              <h2 className="text-3xl font-serif text-primary mb-3 text-center">🌍 Visitors' Wall</h2>
              <p className="text-center font-sans text-sm text-muted-foreground mb-10">
                Anyone who visits this page can leave a little note here.
              </p>
              <GuestNotesSection />
            </div>
          </motion.div>
        </main>
      )}

      {/* Floating Create Button */}
      <CreateModal />

      {/* Setup Name Dialog */}
      <Dialog open={showNameModal} onOpenChange={(open) => !open && userName && setShowNameModal(false)}>
        <DialogContent className="sm:max-w-[400px] border-primary/20 paper-texture [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl text-center text-primary mb-2">Who are you?</DialogTitle>
            <DialogDescription className="text-center font-sans text-base">
              Are you {scrapbook.creatorName} or {scrapbook.friendName}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-3">
              {/* One-tap: clicking a name button immediately opens the scrapbook */}
              <Button
                variant="outline"
                className="h-14 text-xl font-handwritten hover:bg-primary/10 hover:border-primary/50 bg-primary/5"
                onClick={() => saveName(scrapbook.creatorName)}
              >
                I'm {scrapbook.creatorName} 🌸
              </Button>
              <Button
                variant="outline"
                className="h-14 text-xl font-handwritten hover:bg-primary/10 hover:border-primary/50 bg-primary/5"
                onClick={() => saveName(scrapbook.friendName)}
              >
                I'm {scrapbook.friendName} 🌸
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">OR</span>
              <div className="h-px bg-border flex-1" />
            </div>
            <Input 
              placeholder="Enter your name..." 
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              className="text-center h-12 text-lg bg-card"
            />
            <Button
              className="w-full h-12 text-lg rounded-xl font-serif bg-primary hover:bg-primary/90"
              onClick={() => saveName()}
              disabled={!tempName.trim()}
            >
              Open Scrapbook 🌸
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
