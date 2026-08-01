import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPromises, useCreatePromise } from "@workspace/api-client-react";
import { getGetPromisesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartHandshake } from "lucide-react";

interface PromiseTreeProps {
  slug: string;
  userName: string;
}

export default function PromiseTree({ slug, userName }: PromiseTreeProps) {
  const queryClient = useQueryClient();
  const { data: promises = [] } = useGetPromises(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetPromisesQueryKey(slug),
    }
  });

  const [text, setText] = useState("");

  const createPromise = useCreatePromise({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPromisesQueryKey(slug) });
        setText("");
      }
    }
  });

  const handleAddPromise = () => {
    if (!text.trim()) return;
    createPromise.mutate({
      slug,
      data: {
        authorName: userName,
        promiseText: text.trim(),
        accepted: true, // Auto-accepting for visual effect
      }
    });
  };

  return (
    <section className="flex flex-col items-center justify-center w-full my-16">
      <h2 className="text-3xl font-serif text-primary mb-8 text-center flex items-center gap-3 justify-center">
        <HeartHandshake className="w-8 h-8" />
        Promise Tree
      </h2>
      
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-8 bg-[#fffcfb] p-6 md:p-10 rounded-3xl shadow-sm border border-[#f0d0d3]">
        {/* Form area */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
          <p className="font-handwritten text-2xl text-muted-foreground mb-4">
            Make a tiny promise. It'll stay here as a blossom forever.
          </p>
          <div className="flex flex-col gap-3">
            <Input 
              placeholder="I promise to..." 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-12 text-lg border-primary/20 bg-white"
            />
            <Button 
              onClick={handleAddPromise}
              disabled={!text.trim() || createPromise.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md h-12 text-lg"
            >
              Add Promise 🌸
            </Button>
          </div>
        </div>

        {/* Tree / List area */}
        <div className="w-full md:w-1/2 min-h-[300px] flex flex-col gap-3 bg-gradient-to-b from-pink-50/50 to-white rounded-2xl p-4 md:p-6 border border-primary/10 overflow-y-auto max-h-[400px]">
          <AnimatePresence>
            {promises.map((promise, i) => (
              <motion.div
                key={promise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-primary/5"
              >
                <span className="text-2xl mt-1 animate-pulse">🌸</span>
                <div className="flex flex-col">
                  <p className="font-sans font-medium text-foreground leading-snug">
                    {promise.promiseText}
                  </p>
                  <span className="text-xs text-muted-foreground mt-1 font-handwritten text-lg">
                    — {promise.authorName}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {promises.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50 space-y-2">
              <span className="text-5xl">🌱</span>
              <p className="font-handwritten text-xl">The tree is waiting to bloom...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
