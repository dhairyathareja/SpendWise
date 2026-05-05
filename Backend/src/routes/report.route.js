import express from "express"
import { latestScans, scanAccount, getReportById } from "../controller/report.controller.js";

const router = express.Router();

router.post('/scan',scanAccount);
router.post('/latestScans',latestScans);
router.get('/:scanId', getReportById);

export default router;
