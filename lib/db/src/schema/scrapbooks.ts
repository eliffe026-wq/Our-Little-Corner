import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scrapbooksTable = pgTable("scrapbooks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  creatorName: text("creator_name").notNull(),
  friendName: text("friend_name").notNull(),
  nickname: text("nickname"),
  favoriteEmoji: text("favorite_emoji").notNull(),
  theme: text("theme").notNull().default("rosette"),
  initialMessage: text("initial_message"),
  songUrl: text("song_url"),
  songTitle: text("song_title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScrapbookSchema = createInsertSchema(scrapbooksTable).omit({ id: true, createdAt: true });
export type InsertScrapbook = z.infer<typeof insertScrapbookSchema>;
export type Scrapbook = typeof scrapbooksTable.$inferSelect;

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  scrapbookSlug: text("scrapbook_slug").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  isReply: text("is_reply").notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;

export const diaryEntriesTable = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  scrapbookSlug: text("scrapbook_slug").notNull(),
  promptKey: text("prompt_key").notNull(),
  promptText: text("prompt_text").notNull(),
  authorName: text("author_name").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntriesTable).omit({ id: true, createdAt: true });
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntriesTable.$inferSelect;

export const memoriesTable = pgTable("memories", {
  id: serial("id").primaryKey(),
  scrapbookSlug: text("scrapbook_slug").notNull(),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  color: text("color").notNull().default("#FFF9C4"),
  pinColor: text("pin_color").notNull().default("#E91E63"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  rotation: real("rotation").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMemorySchema = createInsertSchema(memoriesTable).omit({ id: true, createdAt: true });
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memoriesTable.$inferSelect;

export const promisesTable = pgTable("promises", {
  id: serial("id").primaryKey(),
  scrapbookSlug: text("scrapbook_slug").notNull(),
  authorName: text("author_name").notNull(),
  promiseText: text("promise_text").notNull(),
  accepted: text("accepted").notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPromiseSchema = createInsertSchema(promisesTable).omit({ id: true, createdAt: true });
export type InsertPromise = z.infer<typeof insertPromiseSchema>;
export type FriendshipPromise = typeof promisesTable.$inferSelect;

export const stickyNotesTable = pgTable("sticky_notes", {
  id: serial("id").primaryKey(),
  scrapbookSlug: text("scrapbook_slug").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  color: text("color").notNull().default("#FFF9C4"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStickyNoteSchema = createInsertSchema(stickyNotesTable).omit({ id: true, createdAt: true });
export type InsertStickyNote = z.infer<typeof insertStickyNoteSchema>;
export type StickyNote = typeof stickyNotesTable.$inferSelect;

export const moodsTable = pgTable("moods", {
  id: serial("id").primaryKey(),
  scrapbookSlug: text("scrapbook_slug").notNull(),
  authorName: text("author_name").notNull(),
  mood: text("mood").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMoodSchema = createInsertSchema(moodsTable).omit({ id: true, createdAt: true });
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moodsTable.$inferSelect;

export const polaroidsTable = pgTable("polaroids", {
  id: serial("id").primaryKey(),
  scrapbookSlug: text("scrapbook_slug").notNull(),
  authorName: text("author_name").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  rotation: real("rotation").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPolaroidSchema = createInsertSchema(polaroidsTable).omit({ id: true, createdAt: true });
export type InsertPolaroid = z.infer<typeof insertPolaroidSchema>;
export type Polaroid = typeof polaroidsTable.$inferSelect;
