import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get(
  "/health",
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
