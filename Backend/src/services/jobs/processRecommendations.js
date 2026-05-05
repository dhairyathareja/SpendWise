import Findings from "../../model/finding.model.js";
import Recommendation from "../../model/recommendations.model.js";
import { generateRecommendation } from "../recommendationEngine.service.js";
import { sendCostAlert } from "../notification.service.js";

export const processRecommendations = (scanId, userEmail) => {

  console.log("Email",userEmail);

  setImmediate(async () => {
    try {
      console.log("🚀 Running recommendation job for:", scanId);

      const findings = await Findings.find({ scanId });
      console.log("Fiindings",findings);
      if (!findings.length) return;

      for (const finding of findings) {
        // ❌ prevent duplicates
        const exists = await Recommendation.findOne({
          scanId,
          resourceId: finding.resourceId,
          issue: finding.issue,
        });

        if (exists) continue;

        const rec = generateRecommendation(finding);
        if (!rec) continue;

        const saved = await Recommendation.create({
          scanId,
          ...rec,
          notified: false,
        });

        // 🔔 notify only CRITICAL
        if (["CRITICAL", "HIGH"].includes(finding.severity)) {
          console.log(
            "📩 Sending email for:",
            rec.resourceId,
            "| Severity:",
            finding.severity,
          );

          try {
            await sendCostAlert({
              userEmail,
              resource: rec.resourceId,
              usage: rec.message,
              savings: rec.estimatedSavings,
              recommendation: rec.action,
            });

            saved.notified = true;
            await saved.save();
          } catch (err) {
            console.error("Email Error:", err.message);
          }
        }
      }
    } catch (err) {
      console.error("Recommendation Job Error:", err);
    }
  });
};
