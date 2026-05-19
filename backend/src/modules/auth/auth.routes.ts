import { Router } from "express";
import { authService } from "./auth.service";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validators";

const router = Router();

router.post(
  "/auth/login",
  validateBody(loginSchema),
  asyncHandler(async (request, response) => {
    const user = await authService.validateUser(request.body.username, request.body.password);
    const data = await authService.login(user, response);
    sendSuccess(response, data, "User Login");
  })
);

router.post(
  "/auth/register",
  validateBody(registerSchema),
  asyncHandler(async (request, response) => {
    const data = await authService.register(request.body);
    sendSuccess(response, data, "Register a new user");
  })
);

router.get(
  "/auth/account",
  requireAuth(),
  requirePermission("GET", "/api/v1/auth/account"),
  asyncHandler(async (request, response) => {
    const data = await authService.getAccount(request.user!);
    sendSuccess(response, data, "Get user information");
  })
);

router.get(
  "/auth/refresh",
  asyncHandler(async (request, response) => {
    const data = await authService.refresh(request.cookies.refresh_token as string | undefined, response);
    sendSuccess(response, data, "Get User by refresh token");
  })
);

router.post(
  "/auth/logout",
  requireAuth(),
  requirePermission("POST", "/api/v1/auth/logout"),
  asyncHandler(async (request, response) => {
    const data = await authService.logout(request.user!, response);
    sendSuccess(response, data, "Logout User");
  })
);

export default router;
