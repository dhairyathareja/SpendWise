import express from "express";
import { triggerRecommendations } from "../controller/recommendations.controller.js";
import Recommendation from "../model/recommendations.model.js";

const router = express.Router();

router.post("/generate", triggerRecommendations);

// GET /recommendations?scanId=<id>
router.get("/", async (req, res) => {
  try {
    const { scanId } = req.query;
    const query = scanId ? { scanId } : {};
    const recommendations = await Recommendation.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;