import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  scrapbooksTable,
  messagesTable,
  diaryEntriesTable,
  memoriesTable,
  promisesTable,
  stickyNotesTable,
  moodsTable,
  polaroidsTable,
} from "@workspace/db";
import {
  CreateScrapbookBody,
  CreateMessageBody,
  CreateMessageParams,
  SaveDiaryEntryBody,
  SaveDiaryEntryParams,
  CreateMemoryBody,
  CreateMemoryParams,
  CreatePromiseBody,
  CreatePromiseParams,
  CreateNoteBody,
  CreateNoteParams,
  SaveMoodBody,
  SaveMoodParams,
  CreatePolaroidBody,
  CreatePolaroidParams,
  GetScrapbookParams,
  GetMessagesParams,
  GetDiaryEntriesParams,
  GetMemoriesParams,
  GetPromisesParams,
  GetNotesParams,
  GetMoodsParams,
  GetPolaroidsParams,
  GetGardenParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateSlug(creatorName: string, friendName: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 20);
  return `${clean(creatorName)}-${clean(friendName)}`;
}

function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

// POST /scrapbooks — create a new scrapbook
router.post("/scrapbooks", async (req, res): Promise<void> => {
  const parsed = CreateScrapbookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { creatorName, friendName, nickname, favoriteEmoji, theme, initialMessage, songUrl, songTitle } = parsed.data;

  let slug = generateSlug(creatorName, friendName);
  // Check for duplicates and add suffix if needed
  const existing = await db
    .select({ slug: scrapbooksTable.slug })
    .from(scrapbooksTable)
    .where(eq(scrapbooksTable.slug, slug));

  if (existing.length > 0) {
    slug = `${slug}-${randomSuffix()}`;
  }

  const [scrapbook] = await db
    .insert(scrapbooksTable)
    .values({
      slug,
      creatorName,
      friendName,
      nickname: nickname ?? null,
      favoriteEmoji,
      theme: theme ?? "rosette",
      initialMessage: initialMessage ?? null,
      songUrl: songUrl ?? null,
      songTitle: songTitle ?? null,
    })
    .returning();

  // If there's an initial message, save it as the first envelope message
  if (initialMessage) {
    await db.insert(messagesTable).values({
      scrapbookSlug: slug,
      authorName: creatorName,
      content: initialMessage,
      isReply: "false",
    });
  }

  res.status(201).json({
    id: scrapbook.id,
    slug: scrapbook.slug,
    creatorName: scrapbook.creatorName,
    friendName: scrapbook.friendName,
    nickname: scrapbook.nickname,
    favoriteEmoji: scrapbook.favoriteEmoji,
    theme: scrapbook.theme,
    initialMessage: scrapbook.initialMessage,
    songUrl: scrapbook.songUrl,
    songTitle: scrapbook.songTitle,
    createdAt: scrapbook.createdAt,
  });
});

// GET /scrapbooks/:slug — get a scrapbook
router.get("/scrapbooks/:slug", async (req, res): Promise<void> => {
  const params = GetScrapbookParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scrapbook] = await db
    .select()
    .from(scrapbooksTable)
    .where(eq(scrapbooksTable.slug, params.data.slug));

  if (!scrapbook) {
    res.status(404).json({ error: "Scrapbook not found" });
    return;
  }

  res.json({
    id: scrapbook.id,
    slug: scrapbook.slug,
    creatorName: scrapbook.creatorName,
    friendName: scrapbook.friendName,
    nickname: scrapbook.nickname,
    favoriteEmoji: scrapbook.favoriteEmoji,
    theme: scrapbook.theme,
    initialMessage: scrapbook.initialMessage,
    songUrl: scrapbook.songUrl,
    songTitle: scrapbook.songTitle,
    createdAt: scrapbook.createdAt,
  });
});

// GET /scrapbooks/:slug/messages
router.get("/scrapbooks/:slug/messages", async (req, res): Promise<void> => {
  const params = GetMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.scrapbookSlug, params.data.slug))
    .orderBy(messagesTable.createdAt);

  res.json(
    messages.map((m) => ({
      id: m.id,
      scrapbookSlug: m.scrapbookSlug,
      authorName: m.authorName,
      content: m.content,
      isReply: m.isReply === "true",
      createdAt: m.createdAt,
    }))
  );
});

// POST /scrapbooks/:slug/messages
router.post("/scrapbooks/:slug/messages", async (req, res): Promise<void> => {
  const params = CreateMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      scrapbookSlug: params.data.slug,
      authorName: body.data.authorName,
      content: body.data.content,
      isReply: body.data.isReply ? "true" : "false",
    })
    .returning();

  res.status(201).json({
    id: message.id,
    scrapbookSlug: message.scrapbookSlug,
    authorName: message.authorName,
    content: message.content,
    isReply: message.isReply === "true",
    createdAt: message.createdAt,
  });
});

// GET /scrapbooks/:slug/diary
router.get("/scrapbooks/:slug/diary", async (req, res): Promise<void> => {
  const params = GetDiaryEntriesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const entries = await db
    .select()
    .from(diaryEntriesTable)
    .where(eq(diaryEntriesTable.scrapbookSlug, params.data.slug))
    .orderBy(diaryEntriesTable.createdAt);

  res.json(
    entries.map((e) => ({
      id: e.id,
      scrapbookSlug: e.scrapbookSlug,
      promptKey: e.promptKey,
      promptText: e.promptText,
      authorName: e.authorName,
      answer: e.answer,
      createdAt: e.createdAt,
    }))
  );
});

// POST /scrapbooks/:slug/diary
router.post("/scrapbooks/:slug/diary", async (req, res): Promise<void> => {
  const params = SaveDiaryEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SaveDiaryEntryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [entry] = await db
    .insert(diaryEntriesTable)
    .values({
      scrapbookSlug: params.data.slug,
      promptKey: body.data.promptKey,
      promptText: body.data.promptText,
      authorName: body.data.authorName,
      answer: body.data.answer,
    })
    .returning();

  res.status(201).json({
    id: entry.id,
    scrapbookSlug: entry.scrapbookSlug,
    promptKey: entry.promptKey,
    promptText: entry.promptText,
    authorName: entry.authorName,
    answer: entry.answer,
    createdAt: entry.createdAt,
  });
});

// GET /scrapbooks/:slug/memories
router.get("/scrapbooks/:slug/memories", async (req, res): Promise<void> => {
  const params = GetMemoriesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const memories = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.scrapbookSlug, params.data.slug))
    .orderBy(memoriesTable.createdAt);

  res.json(
    memories.map((m) => ({
      id: m.id,
      scrapbookSlug: m.scrapbookSlug,
      authorName: m.authorName,
      title: m.title,
      content: m.content,
      color: m.color,
      pinColor: m.pinColor,
      positionX: m.positionX,
      positionY: m.positionY,
      rotation: m.rotation,
      createdAt: m.createdAt,
    }))
  );
});

// POST /scrapbooks/:slug/memories
router.post("/scrapbooks/:slug/memories", async (req, res): Promise<void> => {
  const params = CreateMemoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateMemoryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const colors = ["#FFF9C4", "#F8BBD0", "#E1BEE7", "#B3E5FC", "#C8E6C9", "#FFE0B2"];
  const pinColors = ["#E91E63", "#9C27B0", "#2196F3", "#4CAF50", "#FF9800"];

  const [memory] = await db
    .insert(memoriesTable)
    .values({
      scrapbookSlug: params.data.slug,
      authorName: body.data.authorName,
      title: body.data.title,
      content: body.data.content,
      color: body.data.color ?? colors[Math.floor(Math.random() * colors.length)],
      pinColor: body.data.pinColor ?? pinColors[Math.floor(Math.random() * pinColors.length)],
      positionX: body.data.positionX ?? Math.random() * 80,
      positionY: body.data.positionY ?? Math.random() * 80,
      rotation: body.data.rotation ?? (Math.random() - 0.5) * 12,
    })
    .returning();

  res.status(201).json({
    id: memory.id,
    scrapbookSlug: memory.scrapbookSlug,
    authorName: memory.authorName,
    title: memory.title,
    content: memory.content,
    color: memory.color,
    pinColor: memory.pinColor,
    positionX: memory.positionX,
    positionY: memory.positionY,
    rotation: memory.rotation,
    createdAt: memory.createdAt,
  });
});

// GET /scrapbooks/:slug/promises
router.get("/scrapbooks/:slug/promises", async (req, res): Promise<void> => {
  const params = GetPromisesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const promises = await db
    .select()
    .from(promisesTable)
    .where(eq(promisesTable.scrapbookSlug, params.data.slug))
    .orderBy(promisesTable.createdAt);

  res.json(
    promises.map((p) => ({
      id: p.id,
      scrapbookSlug: p.scrapbookSlug,
      authorName: p.authorName,
      promiseText: p.promiseText,
      accepted: p.accepted === "true",
      createdAt: p.createdAt,
    }))
  );
});

// POST /scrapbooks/:slug/promises
router.post("/scrapbooks/:slug/promises", async (req, res): Promise<void> => {
  const params = CreatePromiseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreatePromiseBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [promise] = await db
    .insert(promisesTable)
    .values({
      scrapbookSlug: params.data.slug,
      authorName: body.data.authorName,
      promiseText: body.data.promiseText,
      accepted: body.data.accepted ? "true" : "false",
    })
    .returning();

  res.status(201).json({
    id: promise.id,
    scrapbookSlug: promise.scrapbookSlug,
    authorName: promise.authorName,
    promiseText: promise.promiseText,
    accepted: promise.accepted === "true",
    createdAt: promise.createdAt,
  });
});

// GET /scrapbooks/:slug/notes
router.get("/scrapbooks/:slug/notes", async (req, res): Promise<void> => {
  const params = GetNotesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const notes = await db
    .select()
    .from(stickyNotesTable)
    .where(eq(stickyNotesTable.scrapbookSlug, params.data.slug))
    .orderBy(desc(stickyNotesTable.createdAt));

  res.json(
    notes.map((n) => ({
      id: n.id,
      scrapbookSlug: n.scrapbookSlug,
      authorName: n.authorName,
      content: n.content,
      color: n.color,
      createdAt: n.createdAt,
    }))
  );
});

// POST /scrapbooks/:slug/notes
router.post("/scrapbooks/:slug/notes", async (req, res): Promise<void> => {
  const params = CreateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateNoteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [note] = await db
    .insert(stickyNotesTable)
    .values({
      scrapbookSlug: params.data.slug,
      authorName: body.data.authorName,
      content: body.data.content,
      color: body.data.color ?? "#FFF9C4",
    })
    .returning();

  res.status(201).json({
    id: note.id,
    scrapbookSlug: note.scrapbookSlug,
    authorName: note.authorName,
    content: note.content,
    color: note.color,
    createdAt: note.createdAt,
  });
});

// GET /scrapbooks/:slug/mood
router.get("/scrapbooks/:slug/mood", async (req, res): Promise<void> => {
  const params = GetMoodsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const moods = await db
    .select()
    .from(moodsTable)
    .where(eq(moodsTable.scrapbookSlug, params.data.slug))
    .orderBy(desc(moodsTable.createdAt))
    .limit(10);

  res.json(
    moods.map((m) => ({
      id: m.id,
      scrapbookSlug: m.scrapbookSlug,
      authorName: m.authorName,
      mood: m.mood,
      emoji: m.emoji,
      createdAt: m.createdAt,
    }))
  );
});

// POST /scrapbooks/:slug/mood
router.post("/scrapbooks/:slug/mood", async (req, res): Promise<void> => {
  const params = SaveMoodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SaveMoodBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [mood] = await db
    .insert(moodsTable)
    .values({
      scrapbookSlug: params.data.slug,
      authorName: body.data.authorName,
      mood: body.data.mood,
      emoji: body.data.emoji,
    })
    .returning();

  res.status(201).json({
    id: mood.id,
    scrapbookSlug: mood.scrapbookSlug,
    authorName: mood.authorName,
    mood: mood.mood,
    emoji: mood.emoji,
    createdAt: mood.createdAt,
  });
});

// GET /scrapbooks/:slug/polaroids
router.get("/scrapbooks/:slug/polaroids", async (req, res): Promise<void> => {
  const params = GetPolaroidsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const polaroids = await db
    .select()
    .from(polaroidsTable)
    .where(eq(polaroidsTable.scrapbookSlug, params.data.slug))
    .orderBy(polaroidsTable.createdAt);

  res.json(
    polaroids.map((p) => ({
      id: p.id,
      scrapbookSlug: p.scrapbookSlug,
      authorName: p.authorName,
      imageUrl: p.imageUrl,
      caption: p.caption,
      rotation: p.rotation,
      createdAt: p.createdAt,
    }))
  );
});

// POST /scrapbooks/:slug/polaroids
router.post("/scrapbooks/:slug/polaroids", async (req, res): Promise<void> => {
  const params = CreatePolaroidParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreatePolaroidBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [polaroid] = await db
    .insert(polaroidsTable)
    .values({
      scrapbookSlug: params.data.slug,
      authorName: body.data.authorName,
      imageUrl: body.data.imageUrl,
      caption: body.data.caption ?? null,
      rotation: body.data.rotation ?? (Math.random() - 0.5) * 10,
    })
    .returning();

  res.status(201).json({
    id: polaroid.id,
    scrapbookSlug: polaroid.scrapbookSlug,
    authorName: polaroid.authorName,
    imageUrl: polaroid.imageUrl,
    caption: polaroid.caption,
    rotation: polaroid.rotation,
    createdAt: polaroid.createdAt,
  });
});

// GET /scrapbooks/:slug/garden
router.get("/scrapbooks/:slug/garden", async (req, res): Promise<void> => {
  const params = GetGardenParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const slug = params.data.slug;

  const [memCount] = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.scrapbookSlug, slug));

  const memories = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.scrapbookSlug, slug));

  const diaryEntries = await db
    .select()
    .from(diaryEntriesTable)
    .where(eq(diaryEntriesTable.scrapbookSlug, slug));

  const polaroids = await db
    .select()
    .from(polaroidsTable)
    .where(eq(polaroidsTable.scrapbookSlug, slug));

  const promises = await db
    .select()
    .from(promisesTable)
    .where(and(eq(promisesTable.scrapbookSlug, slug), eq(promisesTable.accepted, "true")));

  const flowerCount = memories.length;
  const butterflyCount = diaryEntries.length;
  const treeLevel = polaroids.length > 0 ? Math.min(Math.ceil(polaroids.length / 2), 5) : 0;
  const promiseBlossoms = promises.length;
  const totalInteractions = flowerCount + butterflyCount + polaroids.length + promiseBlossoms;

  res.json({
    scrapbookSlug: slug,
    flowerCount,
    butterflyCount,
    treeLevel,
    promiseBlossoms,
    totalInteractions,
  });
});

export default router;
