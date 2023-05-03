import { Router } from "express";
import { TokenValidation } from "../libs/verifyToken";
import { createCategorie, getCategories, getCategoriesById } from "../controllers/categories";

const router: Router = Router();

router.post("",TokenValidation, createCategorie);
router.get("",TokenValidation, getCategories);
router.get("/:id",TokenValidation, getCategoriesById);

export default router;