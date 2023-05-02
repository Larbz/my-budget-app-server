import { Router } from "express";
import { TokenValidation } from "../libs/verifyToken";
import { createCategorie, getCategories, getCategoriesById } from "../controllers/categories";

const router: Router = Router();

router.post("/create",TokenValidation, createCategorie);
router.get("/get",TokenValidation, getCategories);
router.get("/get/:id",TokenValidation, getCategoriesById);

export default router;