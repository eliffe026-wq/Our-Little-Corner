import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scrapbooksRouter from "./scrapbooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scrapbooksRouter);

export default router;
