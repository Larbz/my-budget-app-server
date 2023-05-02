import { Router } from "express";
import { TokenValidation } from "../libs/verifyToken";
import { createTransaction, getTransactions } from "../controllers/transactions";

const router: Router = Router();

router.post("/create",TokenValidation, createTransaction);
router.get("/get",TokenValidation, getTransactions);

export default router;
