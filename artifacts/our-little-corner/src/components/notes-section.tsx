import { useState } from "react";
import { motion } from "framer-motion";
import { useGetNotes, useCreateNote } from "@workspace/api-client-react";
import { getGetNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = [
  "bg-[#fef08a] text-yellow-900", // yellow
  "bg-[#fbcfe8] text-pink-900",   // pink
  "bg-[#bfdbfe] text-blue-900",   // blue
  "bg-[#bbf7d0] text-green-900",  // green
];

interface NotesSectionProps {
  slug: string;
  userName: string;
}

export default function NotesSection({ slug, userName }: NotesSectionProps) {
  const queryClient = useQueryClient();
  const { data: notes = [] } = useGetNotes(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetNotesQueryKey(slug),
    }
  });

  const [text, setText] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const createNote = useCreateNote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotesQueryKey(slug) });
        setText("");
      }
    }
  });

  const handleAddNote = () => {
    if (!text.trim()) return;
    createNote.mutate({
      slug,
      data: {
        authorName: userName,
        content: text.trim(),
        color,
      }
    });
  };

  return (
    <section className="flex flex-col items-center justify-center w-full my-16">
      <h2 className="text-3xl font-serif text-primary mb-8 text-center">📬 Leave Me a Note</h2>
      
      <div className="w-full max-w-5xl bg-[#f1f5f9] rounded-xl border border-border/50 shadow-inner p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
        {/* Subtle grid pattern to look like fridge */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        {/* Input Area */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 z-10">
          <div className={`w-full ${color} p-4 shadow-sm min-h-[200px] flex flex-col transition-colors duration-300`}>
            <textarea
              placeholder="Just leaving a tiny note..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-transparent resize-none border-none focus:outline-none font-handwritten text-2xl flex-1 placeholder:text-black/30"
              maxLength={150}
            />
            <div className="flex justify-between items-center mt-2 border-t border-black/10 pt-2">
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    className={`w-6 h-6 rounded-full border-2 ${c} ${color === c ? 'border-black/50 scale-110' : 'border-transparent'}`}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full hover:bg-black/10 text-black/60 hover:text-black/90"
                onClick={handleAddNote}
                disabled={!text.trim() || createNote.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Notes Wall */}
        <div className="w-full md:w-2/3 flex flex-wrap content-start gap-4 p-4 z-10 min-h-[300px]">
          {notes.map((note, i) => {
            const rot = (i % 2 === 0 ? 1 : -1) * (Math.random() * 4 + 2);
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                className={`w-[140px] ${note.color} p-3 shadow-md flex flex-col relative`}
                style={{ rotate: `${rot}deg` }}
              >
                {/* Washi tape small */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 rotate-2" />
                <p className="font-handwritten text-xl leading-tight mb-4 flex-1 break-words">{note.content}</p>
                <span className="text-xs font-handwritten opacity-60 text-right">— {note.authorName}</span>
              </motion.div>
            );
          })}
          {notes.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 font-handwritten text-2xl">
              The fridge is empty... 🥶
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
