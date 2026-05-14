import { Router } from "express";
import { authService } from "./auth.service";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { withRouteMeta } from "../../middlewares/route-meta.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validators";

const router = Router();

router.post(
  "/auth/login",
  withRouteMeta({
    isPublic: true,
    message: "User Login",
    permissionPath: "/api/v1/auth/login"
  }),
  validateBody(loginSchema),
  asyncHandler(async (request, response) => {
    const user = await authService.validateUser(request.body.username, request.body.password);
    const data = await authService.login(user, response);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.post(
  "/auth/register",
  withRouteMeta({
    isPublic: true,
    message: "Register a new user",
    permissionPath: "/api/v1/auth/register"
  }),
  validateBody(registerSchema),
  asyncHandler(async (request, response) => {
    const data = await authService.register(request.body);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.get(
  "/auth/account",
  withRouteMeta({
    message: "Get user information",
    permissionPath: "/api/v1/auth/account"
  }),
  asyncHandler(async (request, response) => {
    const data = await authService.getAccount(request.user!);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.get(
  "/auth/refresh",
  withRouteMeta({
    isPublic: true,
    message: "Get User by refresh token",
    permissionPath: "/api/v1/auth/refresh"
  }),
  asyncHandler(async (request, response) => {
    const data = await authService.refresh(request.cookies.refresh_token as string | undefined, response);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.post(
  "/auth/logout",
  withRouteMeta({
    message: "Logout User",
    permissionPath: "/api/v1/auth/logout"
  }),
  asyncHandler(async (request, response) => {
    const data = await authService.logout(request.user!, response);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

export default router;
