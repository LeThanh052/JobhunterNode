import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { authMiddleware } from "./middlewares/auth.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { permissionMiddleware } from "./middlewares/permission.middleware";
import routes from "./routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/public", express.static("public"));

  app.get("/api/healthz", (_request, response) => {
    response.status(200).json({ status: "ok", env: env.NODE_ENV });
  });

  app.use("/api/v1", authMiddleware, permissionMiddleware, routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
