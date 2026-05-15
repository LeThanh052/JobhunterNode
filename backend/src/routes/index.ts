import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import companiesRoutes from "../modules/companies/companies.routes";
import usersRoutes from "../modules/users/users.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/", authRoutes);
router.use("/", companiesRoutes);
router.use("/", usersRoutes);
router.use("/", healthRoutes);

export default router;
