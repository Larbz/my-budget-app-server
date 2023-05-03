import { Router } from "express";
import { TokenValidation } from "../libs/verifyToken";
import { logout, profile, signin, signup } from "../controllers/auth.controller";
const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout",logout);
router.get("/profile",TokenValidation, profile);

export default router;
