import express from "express"
const router =express.Router();
import {ask} from "../controllers/aiController.js"

router.get("/ask",ask);

export default router;