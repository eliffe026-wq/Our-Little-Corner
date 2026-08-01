import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMemories, useCreateMemory } from "@workspace/api-client-react";
import { getGetMemoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const COLORS = [
  "bg-yellow-100 text-yellow-900",
  "bg-pink-100 text-pink-900",
  "bg-blue-100 text-blue-900",
  "bg-green-100 text-green-900",
  "bg-purple-100 text-purple-900",
];

const PIN_COLORS = ["bg-red-500", "bg-blue-500", "bg-yellow-400", "bg-purple-500", "bg-pink-500"];

interface MemoryBoardProps {
  slug: string;
  userName: string;
}

export default function MemoryBoard({ slug, userName }: MemoryBoardProps) {
  const queryClient = useQueryClient();
  const { data: memories = [] } = useGetMemories(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetMemoriesQueryKey(slug),
    }
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);

  const createMemory = useCreateMemory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMemoriesQueryKey(slug) });
        setOpenModal(false);
      }
    }
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const handleAddMemory = () => {
    if (!title.trim() || !content.trim()) return;
    createMemory.mutate({
      slug,
      data: {
        authorName: userName,
        title: title.trim(),
        content: content.trim(),
        color,
        pinColor: PIN_COLORS[Math.floor(Math.random() * PIN_COLORS.length)],
        rotation: Math.floor(Math.random() * 20) - 10,
      }
    });
  };

  return (
    <section className="flex flex-col items-center justify-center w-full my-16">
      <h2 className="text-3xl font-serif text-primary mb-8 text-center">📌 Memory Board</h2>
      
      <div className="relative w-full max-w-4xl min-h-[500px] rounded-3xl border-[12px] border-[#8b5a2b] shadow-2xl p-6 md:p-10 overflow-hidden" 
           style={{ backgroundColor: '#d2a679', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.5\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.2\'/%3E%3C/svg%3E")' }}>
        
        {/* Floating Add Button */}
        <div className="absolute top-4 right-4 z-20">
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full shadow-lg bg-[#8b5a2b] hover:bg-[#6b4220] text-white">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] paper-texture">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-primary">Pin a Memory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Memory Title..." value={title} onChange={e => setTitle(e.target.value)} className="font-sans font-medium bg-white/50" />
                <Textarea placeholder="Remember when..." value={content} onChange={e => setContent(e.target.value)} className="min-h-[150px] font-handwritten text-xl resize-none bg-white/50" />
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} className={`w-8 h-8 rounded-full border-2 ${c} ${color === c ? 'border-foreground shadow-md scale-110' : 'border-transparent'}`} onClick={() => setColor(c)} />
                  ))}
                </div>
                <Button className="w-full" onClick={handleAddMemory} disabled={!title.trim() || !content.trim() || createMemory.isPending}>
                  Pin it 📌
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Memories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 pt-12">
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
              initial={{ rotate: memory.rotation }}
              animate={{ rotate: memory.rotation }}
              onClick={() => setSelectedMemory(memory)}
              className={`relative cursor-pointer ${memory.color} p-4 pb-6 shadow-md shadow-black/20 group transition-transform ease-out duration-200`}
              style={{ minHeight: '160px' }}
            >
              {/* Push Pin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-sm flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full ${memory.pinColor} shadow-inner border border-black/10`} />
                <div className="absolute top-1 left-1 w-1 h-1 bg-white/60 rounded-full" />
                <div className="absolute -bottom-1 left-1/2 w-[2px] h-3 bg-gray-400/50 -z-10" />
              </div>

              <h3 className="font-sans font-bold text-sm leading-tight mb-2 opacity-80 mt-2 line-clamp-2">{memory.title}</h3>
              <p className="font-handwritten text-xl leading-snug line-clamp-3">{memory.content}</p>
              <div className="absolute bottom-2 right-3 text-xs opacity-50 font-handwritten">— {memory.authorName}</div>
            </motion.div>
          ))}
        </div>

        {/* Expanded Memory Modal */}
        <AnimatePresence>
          {selectedMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setSelectedMemory(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50, rotate: -5 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.8, y: 50, rotate: 5 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-md ${selectedMemory.color} p-8 md:p-12 shadow-2xl`}
              >
                <button 
                  className="absolute top-4 right-4 text-black/40 hover:text-black/80 transition-colors"
                  onClick={() => setSelectedMemory(null)}
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="washi-tape bg-white/40 -top-3 left-1/2 -translate-x-1/2 rotate-2 w-32" />
                <h3 className="font-sans font-bold text-xl md:text-2xl mb-4 opacity-80 border-b border-black/10 pb-2">{selectedMemory.title}</h3>
                <p className="font-handwritten text-3xl leading-relaxed whitespace-pre-wrap">{selectedMemory.content}</p>
                <div className="mt-8 text-right font-handwritten text-2xl opacity-60">— {selectedMemory.authorName}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
