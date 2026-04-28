import express from "express";
import { sendCostAlertEmail } from "../controller/notify.controller.js";

const router=express.Router();

router.post('/sendAlert',sendCostAlertEmail);

export default router;