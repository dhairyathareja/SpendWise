import express from "express"
import { latestScans, scanAccount } from "../controller/report.controller.js";

const router = express.Router();

router.post('/scan',scanAccount);
router.post('/latestScans',latestScans);

export default router;
