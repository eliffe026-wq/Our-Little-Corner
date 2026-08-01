import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateScrapbook } from "@workspace/api-client-react";
import { Copy, Sparkles, Check, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti"; // Not in package.json... we can use Framer Motion for simple confetti or just omit if missing, wait package.json has 'tw-animate-css' and 'framer-motion'. We'll use framer-motion particles.

const THEMES = [
  { id: "rosette", label: "Rosette 🌸", color: "bg-primary/20 border-primary" },
  { id: "lavender", label: "Lavender 💜", color: "bg-secondary border-secondary-foreground/20" },
  { id: "sunny", label: "Sunny 🌻", color: "bg-accent border-accent-foreground/20" },
  { id: "ocean", label: "Ocean 🌊", color: "bg-blue-200/50 border-blue-400" },
];

const formSchema = z.object({
  creatorName: z.string().min(1, "What's your name?"),
  friendName: z.string().min(1, "What's their name?"),
  nickname: z.string().optional(),
  favoriteEmoji: z.string().min(1, "Pick an emoji!").max(5),
  theme: z.string(),
  initialMessage: z.string().min(1, "Write a little note!"),
  songTitle: z.string().optional(),
  songUrl: z.string().optional(),
});

export function CreateModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const createScrapbook = useCreateScrapbook();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creatorName: "",
      friendName: "",
      nickname: "",
      favoriteEmoji: "🌸",
      theme: "rosette",
      initialMessage: "",
      songTitle: "",
      songUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createScrapbook.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          const url = `${window.location.origin}/${data.slug}`;
          setCreatedUrl(url);
        },
      }
    );
  }

  const copyToClipboard = () => {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWhatsApp = () => {
    if (createdUrl) {
      const text = encodeURIComponent(`I made a little corner of the internet just for us 🌸\n\nOpen it here: ${createdUrl}`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="fixed bottom-6 right-6 rounded-full shadow-lg gap-2 z-50 no-default-hover-elevate hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90">
            <Sparkles className="w-4 h-4" />
            Create Our Little Corner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background paper-texture max-h-[90vh] overflow-y-auto border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center text-primary">
            {createdUrl ? "✨ Your Little Corner is Ready!" : "Create a Scrapbook"}
          </DialogTitle>
          <DialogDescription className="text-center font-sans text-muted-foreground">
            {createdUrl
              ? "Share this secret link with your best friend."
              : "Handcraft a private space for just the two of you."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!createdUrl ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="creatorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Taylor" {...field} className="bg-card" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="friendName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Friend's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Sam" {...field} className="bg-card" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nickname (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="What do you call them?" {...field} className="bg-card" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="favoriteEmoji"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Favorite Emoji</FormLabel>
                          <FormControl>
                            <Input placeholder="🌸" {...field} className="bg-card text-center text-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Scrapbook Theme</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                          >
                            {THEMES.map((theme) => (
                              <FormItem key={theme.id} className="flex flex-col items-center gap-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={theme.id} className="peer sr-only" />
                                </FormControl>
                                <div className={`w-full cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-medium hover:opacity-80 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary ${theme.color}`}>
                                  {theme.label}
                                </div>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="initialMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Write a secret note</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="I'm really grateful our paths crossed..."
                            className="min-h-[100px] resize-none font-handwritten text-xl bg-card leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="songTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Our Song Title (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Ribs by Lorde" {...field} className="bg-card" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="songUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Song URL</FormLabel>
                          <FormControl>
                            <Input placeholder="Spotify/YouTube link" {...field} className="bg-card" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg rounded-xl font-serif tracking-wide bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
                    disabled={createScrapbook.isPending}
                  >
                    {createScrapbook.isPending ? "Crafting..." : "✨ Create My Scrapbook"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 space-y-8 flex flex-col items-center"
            >
              <div className="relative w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl mb-4">
                💌
                <motion.div
                  className="absolute inset-0 border-4 border-primary border-dashed rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="w-full p-4 bg-muted/50 rounded-xl border border-primary/20 flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground">Your secret link:</p>
                <div className="w-full flex items-center gap-2 bg-card p-3 rounded-lg border shadow-sm break-all font-mono text-xs">
                  {createdUrl}
                </div>
                <Button variant="outline" className="w-full gap-2 border-primary/20 text-primary hover:bg-primary hover:text-white" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>

              <Button onClick={shareToWhatsApp} className="w-full h-12 gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a] text-lg font-medium shadow-md">
                <MessageCircle className="w-5 h-5" />
                Share to WhatsApp
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
