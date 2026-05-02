import express from "express";
import { filterFindings, getFindingsByScan, getFindingsSummary } from "../controller/finding.controller.js";

const router = express.Router();

// 1️⃣ Summary
router.get("/summary/:scanId", getFindingsSummary);

// 2️⃣ Get findings for a scan
router.get("/:scanId", getFindingsByScan);

// 3️⃣ Filter findings
router.get("/", filterFindings);


export default router;