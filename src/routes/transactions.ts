import { Router } from "express";
import { createTransaction, getTransactions, updateTransactions } from "../controllers/transactions";
import { TokenValidation } from "../libs/verifyToken";

const router: Router = Router();

router.post("/create", TokenValidation, createTransaction);
router.get("/get", TokenValidation, getTransactions);
router.patch("/update/:id", TokenValidation, updateTransactions);
export default router;
