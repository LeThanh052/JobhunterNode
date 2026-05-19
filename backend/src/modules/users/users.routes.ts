import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { createUserSchema, updateUserSchema } from "./users.validators";
import { usersService } from "./users.service";

const router = Router();

function getSingleParam(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

router.post(
  "/users",
  requireAuth(),
  requirePermission("POST", "/api/v1/users"),
  validateBody(createUserSchema),
  asyncHandler(async (request, response) => {
    const data = await usersService.create(request.body, request.user!);
    sendSuccess(response, data, "Create a new User");
  })
);

router.get(
  "/users",
  requireAuth(),
  requirePermission("GET", "/api/v1/users"),
  asyncHandler(async (request, response) => {
    const data = await usersService.findAll(request.query);
    sendSuccess(response, data, "Fetch user with paginate");
  })
);

router.get(
  "/users/:id",
  asyncHandler(async (request, response) => {
    const data = await usersService.findOne(getSingleParam(request.params.id));
    sendSuccess(response, data, "Fetch user by id");
  })
);

router.patch(
  "/users",
  requireAuth(),
  requirePermission("PATCH", "/api/v1/users/:id"),
  validateBody(updateUserSchema),
  asyncHandler(async (request, response) => {
    const data = await usersService.update(request.body, request.user!);
    sendSuccess(response, data, "Update a User");
  })
);

router.delete(
  "/users/:id",
  requireAuth(),
  requirePermission("DELETE", "/api/v1/users/:id"),
  asyncHandler(async (request, response) => {
    const data = await usersService.remove(getSingleParam(request.params.id), request.user!);
    sendSuccess(response, data, "Delete a User");
  })
);

export default router;
