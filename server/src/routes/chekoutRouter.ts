import { Router } from "express";
import { createCheckout, verifyCheckout } from "../controllers/checkoutController";

const router = Router();

router.post("/", createCheckout);
router.get("/:id", verifyCheckout);

export default router;
