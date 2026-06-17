import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import templatesRouter from "./templates.js";
import adminRouter from "./admin.js";
import settingsRouter from "./settings.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(templatesRouter);
router.use(adminRouter);
router.use(settingsRouter);

export default router;
