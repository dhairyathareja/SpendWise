import { processRecommendations } from "../services/jobs/processRecommendations.js";

export const triggerRecommendations = (req, res) => {
  
  const { userEmail, scanId } = req.body;

  // ⚡ instant response
  res.status(200).json({
    success: true,
    message: "Recommendations started"
  });

  // 🔥 background job
  processRecommendations(scanId, userEmail);
};