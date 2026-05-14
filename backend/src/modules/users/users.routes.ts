import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { withRouteMeta } from "../../middlewares/route-meta.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { createUserSchema, updateUserSchema } from "./users.validators";
import { usersService } from "./users.service";

const router = Router();

function getSingleParam(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

router.post(
  "/users",
  withRouteMeta({
    message: "Create a new User",
    permissionPath: "/api/v1/users"
  }),
  validateBody(createUserSchema),
  asyncHandler(async (request, response) => {
    const data = await usersService.create(request.body, request.user!);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.get(
  "/users",
  withRouteMeta({
    message: "Fetch user with paginate",
    permissionPath: "/api/v1/users"
  }),
  asyncHandler(async (request, response) => {
    const data = await usersService.findAll(request.query);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.get(
  "/users/:id",
  withRouteMeta({
    isPublic: true,
    message: "Fetch user by id",
    permissionPath: "/api/v1/users/:id"
  }),
  asyncHandler(async (request, response) => {
    const data = await usersService.findOne(getSingleParam(request.params.id));
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.patch(
  "/users",
  withRouteMeta({
    message: "Update a User",
    permissionPath: "/api/v1/users/:id"
  }),
  validateBody(updateUserSchema),
  asyncHandler(async (request, response) => {
    const data = await usersService.update(request.body, request.user!);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.delete(
  "/users/:id",
  withRouteMeta({
    message: "Delete a User",
    permissionPath: "/api/v1/users/:id"
  }),
  asyncHandler(async (request, response) => {
    const data = await usersService.remove(getSingleParam(request.params.id), request.user!);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

export default router;
