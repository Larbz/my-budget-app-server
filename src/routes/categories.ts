import { Router } from "express";
import {
    createCategorie,
    getCategories,
    getCategoriesById,
} from "../controllers/categories";
import { TokenValidation } from "../middlewares/verifyToken";

const router: Router = Router();

router.post("", TokenValidation, createCategorie);
router.get("", TokenValidation, getCategories);
router.get("/:id", TokenValidation, getCategoriesById);

export default router;
