import { Router } from "express";
import {
    // autoComplete,
    createTransaction,
    getTransactionWithFilters,
    getTransactions,
    getTransactionsByText,
    getTransactionsCountPerUser,
    updateTransactions,
} from "../controllers/transactions";
import { TokenValidation } from "../middlewares/verifyToken";

const router: Router = Router();

router.post("", TokenValidation, createTransaction);
router.get("", TokenValidation, getTransactions);
router.get("/filters", TokenValidation, getTransactionWithFilters);
router.get("/text", TokenValidation, getTransactionsByText);
router.get("/peruser",getTransactionsCountPerUser);
// router.get("/autocomplete",TokenValidation,autoComplete);
router.patch("/update/:id", TokenValidation, updateTransactions);
export default router;
