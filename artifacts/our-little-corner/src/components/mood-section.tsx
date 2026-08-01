import { useGetMoods, useSaveMood } from "@workspace/api-client-react";
import { getGetMoodsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const MOODS = [
  { mood: "Sunny", emoji: "🌞", color: "bg-orange-100 border-orange-200 text-orange-800" },
  { mood: "Rainy", emoji: "🌧️", color: "bg-blue-100 border-blue-200 text-blue-800" },
  { mood: "Dreamy", emoji: "🌙", color: "bg-indigo-100 border-indigo-200 text-indigo-800" },
  { mood: "Blooming", emoji: "🌺", color: "bg-pink-100 border-pink-200 text-pink-800" },
  { mood: "Cloudy", emoji: "☁️", color: "bg-gray-100 border-gray-200 text-gray-800" },
  { mood: "Starry", emoji: "⭐", color: "bg-yellow-100 border-yellow-200 text-yellow-800" },
];

interface MoodSectionProps {
  slug: string;
  userName: string;
  friendName: string;
}

export default function MoodSection({ slug, userName, friendName }: MoodSectionProps) {
  const queryClient = useQueryClient();
  const { data: moods = [] } = useGetMoods(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetMoodsQueryKey(slug),
    }
  });

  const saveMood = useSaveMood({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMoodsQueryKey(slug) });
      }
    }
  });

  // Get today's mood (just the latest one per user since API simplified it)
  const myMood = moods.find(m => m.authorName === userName);
  const friendMoodRecord = moods.find(m => m.authorName !== userName);
  
  const handleSelectMood = (mood: string, emoji: string) => {
    saveMood.mutate({
      slug,
      data: {
        authorName: userName,
        mood,
        emoji,
      }
    });
  };

  const renderMoodCard = (name: string, record: any, isMe: boolean) => {
    const matchedMood = record ? MOODS.find(m => m.mood === record.mood) : null;
    const cardClass = matchedMood ? matchedMood.color : "bg-card border-border text-muted-foreground";

    const content = (
      <div className={`w-full max-w-[200px] h-40 rounded-3xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-300 ${cardClass} ${!record && isMe ? 'cursor-pointer hover:scale-105 shadow-sm' : 'shadow-md'}`}>
        {record ? (
          <>
            <span className="text-5xl mb-2 animate-bounce-slow">{record.emoji}</span>
            <span className="font-serif font-medium">{record.mood}</span>
            <span className="text-xs opacity-70 mt-1 uppercase tracking-wider">{name}</span>
          </>
        ) : (
          <>
            <span className="text-4xl mb-2 opacity-50">😶‍🌫️</span>
            <span className="font-sans text-sm">{isMe ? "Set mood..." : "Unknown"}</span>
            <span className="text-xs opacity-70 mt-1 uppercase tracking-wider">{name}</span>
          </>
        )}
      </div>
    );

    if (isMe) {
      return (
        <Popover key={name}>
          <PopoverTrigger asChild>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="outline-none">
              {content}
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-card rounded-2xl flex flex-wrap gap-2 justify-center max-w-[280px]">
            {MOODS.map(m => (
              <Button 
                key={m.mood} 
                variant="outline" 
                className={`flex-col h-16 w-16 p-0 rounded-xl ${m.color} hover:opacity-80`}
                onClick={() => handleSelectMood(m.mood, m.emoji)}
              >
                <span className="text-2xl">{m.emoji}</span>
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      );
    }

    return <div key={name}>{content}</div>;
  };

  return (
    <section className="flex flex-col items-center justify-center w-full my-16">
      <h2 className="text-2xl md:text-3xl font-serif text-primary mb-8 text-center">😊 Mood Today</h2>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 w-full">
        {renderMoodCard(userName, myMood, true)}
        {renderMoodCard(friendMoodRecord?.authorName || friendName || "Friend", friendMoodRecord, false)}
      </div>
    </section>
  );
}
