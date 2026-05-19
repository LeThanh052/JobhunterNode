import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { companiesService } from "./companies.service";
import { createCompanySchema, updateCompanySchema } from "./companies.validators";

const router = Router();

function getSingleParam(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

router.post(
  "/companies",
  requireAuth(),
  requirePermission("POST", "/api/v1/companies"),
  validateBody(createCompanySchema),
  asyncHandler(async (request, response) => {
    const data = await companiesService.create(request.body, request.user!);
    sendSuccess(response, data, "Create a new Company");
  })
);

router.get(
  "/companies",
  asyncHandler(async (request, response) => {
    const data = await companiesService.findAll(request.query);
    sendSuccess(response, data, "Fetch company with paginate");
  })
);

router.get(
  "/companies/:id",
  asyncHandler(async (request, response) => {
    const data = await companiesService.findOne(getSingleParam(request.params.id));
    sendSuccess(response, data, "Fetch company by id");
  })
);

router.patch(
  "/companies",
  requireAuth(),
  requirePermission("PATCH", "/api/v1/companies/:id"),
  validateBody(updateCompanySchema),
  asyncHandler(async (request, response) => {
    const data = await companiesService.update(request.body, request.user!);
    sendSuccess(response, data, "Update a Company");
  })
);

router.delete(
  "/companies/:id",
  requireAuth(),
  requirePermission("DELETE", "/api/v1/companies/:id"),
  asyncHandler(async (request, response) => {
    const data = await companiesService.remove(getSingleParam(request.params.id), request.user!);
    sendSuccess(response, data, "Delete a Company");
  })
);

export default router;
