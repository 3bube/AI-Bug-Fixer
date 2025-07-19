import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import prisma from "./utils/prisma";

// routes
import githubRoutes from "./routes/github.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello, TaskTracker!");
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/github", githubRoutes);

// For Vercel deployment
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Export the Express app for Vercel
export default app;
