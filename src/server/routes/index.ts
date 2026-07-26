import { Router } from "express";
import { aiRouter } from "./ai.ts";

export const rootRouter = Router();

// Mount AI routes
rootRouter.use("/ai", aiRouter);

// We can move more routes here in the future
