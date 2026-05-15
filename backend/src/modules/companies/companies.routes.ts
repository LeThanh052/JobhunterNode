import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { withRouteMeta } from "../../middlewares/route-meta.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { companiesService } from "./companies.service";
import { createCompanySchema, updateCompanySchema } from "./companies.validators";

const router = Router();

function getSingleParam(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

router.post(
  "/companies",
  withRouteMeta({
    message: "Create a new Company",
    permissionPath: "/api/v1/companies"
  }),
  validateBody(createCompanySchema),
  asyncHandler(async (request, response) => {
    const data = await companiesService.create(request.body, request.user!);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.get(
  "/companies",
  withRouteMeta({
    isPublic: true,
    message: "Fetch company with paginate",
    permissionPath: "/api/v1/companies"
  }),
  asyncHandler(async (request, response) => {
    const data = await companiesService.findAll(request.query);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.get(
  "/companies/:id",
  withRouteMeta({
    isPublic: true,
    message: "Fetch company by id",
    permissionPath: "/api/v1/companies/:id"
  }),
  asyncHandler(async (request, response) => {
    const data = await companiesService.findOne(getSingleParam(request.params.id));
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.patch(
  "/companies",
  withRouteMeta({
    message: "Update a Company",
    permissionPath: "/api/v1/companies/:id"
  }),
  validateBody(updateCompanySchema),
  asyncHandler(async (request, response) => {
    const data = await companiesService.update(request.body, request.user!);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

router.delete(
  "/companies/:id",
  withRouteMeta({
    message: "Delete a Company",
    permissionPath: "/api/v1/companies/:id"
  }),
  asyncHandler(async (request, response) => {
    const data = await companiesService.remove(getSingleParam(request.params.id), request.user!);
    sendSuccess(response, data, request.routeMeta?.message);
  })
);

export default router;
