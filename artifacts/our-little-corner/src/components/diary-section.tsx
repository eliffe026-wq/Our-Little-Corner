import { useState } from "react";
import { motion } from "framer-motion";
import { useGetDiaryEntries, useSaveDiaryEntry } from "@workspace/api-client-react";
import { getGetDiaryEntriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DiarySectionProps {
  slug: string;
  userName: string;
  friendName: string;
}

const PROMPTS = [
  { key: "reminds", text: "What reminds you of me?" },
  { key: "food", text: "What's our comfort food?" },
  { key: "song", text: "Which song is literally us?" },
  { key: "memory", text: "What's one memory you'll never forget?" },
  { key: "different", text: "What makes me different from everyone else?" },
  { key: "secret", text: "One thing you've never told me." },
];

export default function DiarySection({ slug, userName, friendName }: DiarySectionProps) {
  const queryClient = useQueryClient();
  const { data: entries = [] } = useGetDiaryEntries(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetDiaryEntriesQueryKey(slug),
    }
  });

  const saveEntry = useSaveDiaryEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDiaryEntriesQueryKey(slug) });
      }
    }
  });

  return (
    <section className="flex flex-col items-center justify-center w-full my-24 relative">
      <div className="absolute top-0 right-0 text-5xl opacity-20 -z-10 rotate-12">📖</div>
      <h2 className="text-3xl font-serif text-primary mb-12 text-center">📖 Our Little Diary</h2>

      <div className="w-full space-y-16">
        {PROMPTS.map((prompt, idx) => {
          const myEntry = entries.find(e => e.promptKey === prompt.key && e.authorName === userName);
          const friendEntry = entries.find(e => e.promptKey === prompt.key && e.authorName !== userName);
          
          return (
            <motion.div 
              key={prompt.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="bg-[#faf6f0] rounded-2xl p-6 md:p-8 shadow-sm border border-orange-900/5 relative"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-white/50 backdrop-blur-md rounded-full border border-black/5 shadow-sm -mt-8 flex items-center justify-center">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                </div>
              </div>
              
              <h3 className="font-serif text-xl md:text-2xl text-center text-foreground/80 mb-8 mt-2">
                "{prompt.text}"
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
                {/* Book fold line on desktop */}
                <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-gradient-to-b from-transparent via-border to-transparent" />

                {/* Left Side: Me */}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    {userName}
                  </span>
                  {myEntry ? (
                    <p className="font-handwritten text-2xl leading-relaxed text-foreground bg-white/40 p-4 rounded-lg min-h-[120px]">
                      {myEntry.answer}
                    </p>
                  ) : (
                    <DiaryInput 
                      slug={slug} 
                      userName={userName} 
                      promptKey={prompt.key} 
                      promptText={prompt.text} 
                      saveEntry={saveEntry.mutate} 
                      isPending={saveEntry.isPending}
                    />
                  )}
                </div>

                {/* Right Side: Friend */}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 text-right">
                    {friendEntry?.authorName || friendName || "Friend"}
                  </span>
                  {friendEntry ? (
                    <p className="font-handwritten text-2xl leading-relaxed text-foreground bg-white/40 p-4 rounded-lg min-h-[120px]">
                      {friendEntry.answer}
                    </p>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[120px] bg-white/20 border border-dashed rounded-lg">
                      <span className="font-handwritten text-xl text-muted-foreground/50">
                        Waiting for answer... 💭
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function DiaryInput({ slug, userName, promptKey, promptText, saveEntry, isPending }: any) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    saveEntry({
      slug,
      data: {
        promptKey,
        promptText,
        authorName: userName,
        answer: text.trim()
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <Textarea 
        placeholder="Write your answer..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="font-handwritten text-xl resize-none min-h-[120px] bg-white/60 border-primary/20 focus-visible:ring-primary/30"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={!text.trim() || isPending}
        className="self-end rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 text-sm"
      >
        Save Answer
      </Button>
    </div>
  );
}
