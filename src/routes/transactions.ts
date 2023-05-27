import { Router } from "express";
import {
    createTransaction,
    getTransactionWithFilters,
    getTransactions,
    updateTransactions,
} from "../controllers/transactions";
import { TokenValidation } from "../middlewares/verifyToken";

const router: Router = Router();

router.post("", TokenValidation, createTransaction);
router.get("", TokenValidation, getTransactions);
router.get("/filters", TokenValidation, getTransactionWithFilters);
router.patch("/update/:id", TokenValidation, updateTransactions);
export default router;
