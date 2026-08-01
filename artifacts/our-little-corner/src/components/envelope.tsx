import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMessages, useCreateMessage } from "@workspace/api-client-react";
import { getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EnvelopeProps {
  slug: string;
  userName: string;
  initialMessage?: string | null;
  creatorName: string;
}

export default function EnvelopeSection({ slug, userName, initialMessage, creatorName }: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reply, setReply] = useState("");
  
  const queryClient = useQueryClient();
  const { data: messages = [] } = useGetMessages(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetMessagesQueryKey(slug),
    }
  });

  const createMessage = useCreateMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(slug) });
        setReply("");
      }
    }
  });

  const handleReply = () => {
    if (!reply.trim()) return;
    createMessage.mutate({
      slug,
      data: {
        authorName: userName,
        content: reply.trim(),
        isReply: true,
      }
    });
  };

  return (
    <section className="flex flex-col items-center justify-center w-full my-16">
      <h2 className="text-3xl font-serif text-primary mb-8 text-center">💌 A Secret Letter</h2>
      
      {!isOpen ? (
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="relative w-80 h-56 bg-[#fdf5f6] rounded-xl shadow-lg cursor-pointer border border-[#f0d0d3] group overflow-hidden"
        >
          {/* Flap */}
          <div className="absolute top-0 w-full h-full opacity-60">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
               <polygon fill="#eebfc3" points="0,0 100,0 50,55" />
             </svg>
          </div>
          {/* Ribbon */}
          <div className="absolute top-0 bottom-0 left-1/2 -ml-3 w-6 bg-primary/20 z-10" />
          <div className="absolute top-1/2 left-0 right-0 -mt-3 h-6 bg-primary/20 z-10" />
          
          <div className="absolute top-1/2 left-1/2 -mt-6 -ml-6 w-12 h-12 bg-primary rounded-full z-20 shadow-md flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          
          <div className="absolute bottom-4 right-6 font-handwritten text-xl text-primary/60 rotate-[-5deg]">
            Open me
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl space-y-6"
        >
          {/* Initial Letter */}
          <div className="scrapbook-card bg-[#fffcfb] p-8 md:p-12 relative shadow-md">
            <div className="washi-tape washi-tape-pink top-[-10px] left-10"></div>
            <div className="font-handwritten text-2xl md:text-3xl leading-relaxed text-foreground whitespace-pre-wrap">
              {initialMessage || "I'm so glad we're friends."}
            </div>
            <div className="mt-8 text-right font-handwritten text-xl text-muted-foreground">
              — {creatorName}
            </div>
          </div>

          {/* Replies */}
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`scrapbook-card p-6 w-[85%] relative ${idx % 2 === 0 ? 'ml-auto bg-blue-50/50' : 'mr-auto bg-yellow-50/50'}`}
            >
              <div className={`washi-tape ${idx % 2 === 0 ? 'washi-tape-blue -top-3 -right-4 left-auto rotate-12' : 'washi-tape-yellow -top-3 -left-4 -rotate-12'}`}></div>
              <p className="font-handwritten text-xl md:text-2xl whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
              <div className="mt-4 text-right font-handwritten text-lg text-muted-foreground">
                — {msg.authorName}
              </div>
            </motion.div>
          ))}

          {/* Reply Box */}
          <div className="pt-6">
            <div className="relative bg-card rounded-xl border p-2 shadow-inner">
              <Textarea
                placeholder="Write a reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="font-handwritten text-xl border-none focus-visible:ring-0 resize-none min-h-[100px] bg-transparent"
              />
              <div className="flex justify-end p-2">
                <Button 
                  onClick={handleReply} 
                  disabled={!reply.trim() || createMessage.isPending}
                  className="rounded-full gap-2 px-6 bg-primary text-white hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" /> Send Note
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
