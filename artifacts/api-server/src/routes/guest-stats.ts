import { Router, type IRouter } from "express";
import { desc, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { guestNotesTable, visitsTable } from "@workspace/db";
import {
  CreateGuestNoteBody,
  GetGuestNotesResponse,
  CreateGuestNoteResponse,
  GetVisitorStatsResponse,
  RecordVisitResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /guest-notes
router.get("/guest-notes", async (_req, res): Promise<void> => {
  const notes = await db
    .select()
    .from(guestNotesTable)
    .orderBy(desc(guestNotesTable.createdAt))
    .limit(100);

  res.json(GetGuestNotesResponse.parse(notes));
});

// POST /guest-notes
router.post("/guest-notes", async (req, res): Promise<void> => {
  const body = CreateGuestNoteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { name, message } = body.data;

  if (message.length > 150) {
    res.status(400).json({ error: "Message must be 150 characters or less" });
    return;
  }

  const [note] = await db
    .insert(guestNotesTable)
    .values({ name: name.substring(0, 50), message: message.substring(0, 150) })
    .returning();

  res.status(201).json(CreateGuestNoteResponse.parse(note));
});

// GET /stats/visitors
router.get("/stats/visitors", async (_req, res): Promise<void> => {
  const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(visitsTable);
  const count = result[0]?.count ?? 0;
  res.json(GetVisitorStatsResponse.parse({ count }));
});

// POST /stats/visit
router.post("/stats/visit", async (_req, res): Promise<void> => {
  await db.insert(visitsTable).values({});
  const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(visitsTable);
  const count = result[0]?.count ?? 0;
  res.json(RecordVisitResponse.parse({ count }));
});

export default router;
