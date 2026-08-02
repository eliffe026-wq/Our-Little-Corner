import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetGuestNotes, useCreateGuestNote, getGetGuestNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const NOTE_COLORS = [
  "#FFF9C4", // butter yellow
  "#F8BBD0", // pastel pink
  "#E1BEE7", // soft lavender
  "#C8E6C9", // sage green
  "#B3E5FC", // baby blue
  "#FFE0B2", // peach
];

const ROTATIONS = [-3, 2, -1.5, 3.5, -2.5, 1, -4, 2.5];

export default function GuestNotesSection() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const queryClient = useQueryClient();
  const { data: notes = [] } = useGetGuestNotes({ query: { queryKey: getGetGuestNotesQueryKey() } });
  const createNote = useCreateGuestNote();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    createNote.mutate(
      { data: { name: name.trim(), message: message.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGuestNotesQueryKey() });
          setSubmitted(true);
          setName("");
          setMessage("");
          setTimeout(() => setSubmitted(false), 3000);
        },
      }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-8">
        <p className="font-handwritten text-3xl text-primary mb-1">💌 Leave a Guest Note</p>
        <p className="font-sans text-sm text-muted-foreground">
          Visiting this corner of the internet? Leave a little note behind.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#FFFEF7] border border-[#f0d0d3] rounded-2xl p-5 shadow-md mb-10"
        style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #f0d0d355 27px, #f0d0d355 28px)" }}
      >
        {/* washi tape decoration */}
        <div className="absolute -top-3 left-8 w-20 h-5 bg-primary/30 rounded-sm rotate-[-1deg] opacity-70" />
        <div className="absolute -top-3 right-12 w-16 h-5 bg-secondary/50 rounded-sm rotate-[2deg] opacity-70" />

        <div className="space-y-3 mt-2">
          <div>
            <label className="font-handwritten text-lg text-foreground/80 block mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g. Emma"
              data-testid="input-guest-name"
              className="w-full font-handwritten text-xl bg-transparent border-b border-primary/30 focus:border-primary outline-none py-1 px-0 text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
          <div>
            <label className="font-handwritten text-lg text-foreground/80 block mb-1">
              Your message <span className="text-xs text-muted-foreground font-sans">({message.length}/150)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 150))}
              rows={3}
              placeholder="This is literally the cutest website I've ever seen..."
              data-testid="input-guest-message"
              className="w-full font-handwritten text-xl bg-transparent border-b border-primary/30 focus:border-primary outline-none py-1 px-0 resize-none text-foreground placeholder:text-muted-foreground/60 leading-relaxed"
            />
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center font-handwritten text-2xl text-primary py-2"
              >
                Thank you! Your note was pinned 🌸
              </motion.div>
            ) : (
              <motion.button
                key="submit"
                type="submit"
                disabled={createNote.isPending || !name.trim() || !message.trim()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                data-testid="button-submit-guest-note"
                className="w-full py-3 rounded-full bg-gradient-to-r from-primary/80 to-primary font-serif text-primary-foreground text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createNote.isPending ? "Pinning..." : "📌 Pin My Note"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Notes Grid */}
      {notes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20, rotate: ROTATIONS[i % ROTATIONS.length] }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              data-testid={`card-guest-note-${note.id}`}
              className="relative p-4 rounded-lg shadow-md cursor-default"
              style={{
                backgroundColor: NOTE_COLORS[i % NOTE_COLORS.length],
                rotate: `${ROTATIONS[i % ROTATIONS.length]}deg`,
              }}
            >
              {/* Push pin */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/70 shadow-sm" />
              <p className="font-handwritten text-lg leading-snug text-foreground/90 break-words">
                "{note.message}"
              </p>
              <p className="font-handwritten text-sm text-foreground/60 mt-2 text-right">
                — {note.name}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {notes.length === 0 && (
        <p className="text-center font-handwritten text-xl text-muted-foreground/60 py-4">
          Be the first to leave a note! 🌷
        </p>
      )}
    </div>
  );
}
