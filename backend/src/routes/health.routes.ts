import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response";
import { withRouteMeta } from "../middlewares/route-meta.middleware";

const router = Router();

router.get(
  "/health",
  withRouteMeta({
    isPublic: true,
    message: "",
    permissionPath: "/api/v1/health"
  }),
  asyncHandler(async (_request, response) => {
    sendSuccess(
      response,
      {
        status: "ok"
      },
      ""
    );
  })
);

export default router;
