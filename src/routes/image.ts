import { getImage, uploadImage } from "../controllers/image.controller";
import { Router } from "express";

const router: Router = Router();

router.post("",uploadImage)
router.post("/get",getImage)

export default router;