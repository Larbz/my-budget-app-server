import { Router } from "express";
import {
    logout,
    profile,
    updateRefreshToken,
    refreshToken,
    signin,
    signup,
} from "../controllers/auth.controller";
import { requireRefreshToken } from "../middlewares/requireRefreshToken";
import { TokenValidation } from "../middlewares/verifyToken";
const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.get("/profile", TokenValidation, profile);
router.post("/updatejwt",requireRefreshToken, refreshToken);
router.post("/update/refreshtoken",requireRefreshToken, updateRefreshToken);
export default router;
