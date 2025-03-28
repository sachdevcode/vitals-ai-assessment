import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import organizationRoutes from "./routes/organization.routes";
import webhookRoutes from "./routes/webhook.routes";
import { schedulerService } from "./services/scheduler.service";
import { authMiddleware } from "./middleware/auth.middleware";
import logger from "./utils/logger";

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());

// Public routes (no auth required)
app.use("/api/webhooks/wealthbox", webhookRoutes);

// Protected routes (auth required)
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);

// Start scheduled sync
schedulerService.startScheduledSync();

// Error handling middleware
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

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  schedulerService.stopScheduledSync();
  process.exit(0);
});

export default app;
