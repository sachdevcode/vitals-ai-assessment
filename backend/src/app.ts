import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import organizationRoutes from "./routes/organization.routes";
import webhookRoutes from "./routes/webhook.routes";
import wealthboxRoutes from "./routes/wealthbox.routes";
import { schedulerService } from "./services/scheduler.service";
import { authMiddleware } from "./middleware/auth.middleware";
import logger from "./utils/logger";

const app = express();


app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());


app.use("/api/webhooks/wealthbox", webhookRoutes);


app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/wealthbox", authMiddleware, wealthboxRoutes);


schedulerService.startScheduledSync();


app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);


process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  schedulerService.stopScheduledSync();
  process.exit(0);
});

export default app;
