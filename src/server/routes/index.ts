import { Router } from "express";
import { aiRouter } from "./ai.ts";
import { securityRouter } from "./security.ts";

export const rootRouter = Router();

// Mount AI routes
rootRouter.use("/ai", aiRouter);

// Mount Security Clearance routes
rootRouter.use("/security", securityRouter);

