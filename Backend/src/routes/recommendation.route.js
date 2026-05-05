import express from "express";
import { triggerRecommendations } from "../controller/recommendations.controller.js";

const router = express.Router();

router.post("/generate", triggerRecommendations);

export default router;