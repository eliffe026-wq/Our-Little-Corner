import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scrapbooksRouter from "./scrapbooks";
import guestStatsRouter from "./guest-stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scrapbooksRouter);
router.use(guestStatsRouter);

export default router;
